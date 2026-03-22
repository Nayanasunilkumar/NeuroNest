from datetime import datetime, timedelta
from threading import Lock, Timer
from uuid import uuid4

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required

from database.models import User
from extensions.socket import socketio
from models.chat_models import Participant

calls_bp = Blueprint("calls", __name__)

CALL_TIMEOUT_SECONDS = 30
_calls = {}
_call_timers = {}
_calls_lock = Lock()


def _serialize_call(call):
    return {
        "call_id": call["call_id"],
        "room_id": call["room_id"],
        "caller_id": call["caller_id"],
        "caller_name": call["caller_name"],
        "receiver_id": call["receiver_id"],
        "receiver_name": call["receiver_name"],
        "conversation_id": call.get("conversation_id"),
        "call_type": call["call_type"],
        "status": call["status"],
        "created_at": call["created_at"].isoformat() if call.get("created_at") else None,
        "accepted_at": call["accepted_at"].isoformat() if call.get("accepted_at") else None,
        "ended_at": call["ended_at"].isoformat() if call.get("ended_at") else None,
        "decline_reason": call.get("decline_reason"),
    }


def _cancel_call_timer(call_id):
    timer = _call_timers.pop(call_id, None)
    if timer:
        timer.cancel()


def _emit_call_event(event_name, payload, call):
    socketio.emit(event_name, payload, room=f"user_{call['caller_id']}")
    socketio.emit(event_name, payload, room=f"user_{call['receiver_id']}")
    if call.get("conversation_id"):
        socketio.emit(event_name, payload, room=f"conversation_{call['conversation_id']}")


def _schedule_missed_call(call_id):
    def _expire_call():
        with _calls_lock:
            call = _calls.get(call_id)
            if not call or call.get("status") != "ringing":
                return
            call["status"] = "missed"
            call["ended_at"] = datetime.utcnow()

        payload = _serialize_call(call)
        _emit_call_event("call_missed", payload, call)

    timer = Timer(CALL_TIMEOUT_SECONDS, _expire_call)
    timer.daemon = True
    _call_timers[call_id] = timer
    timer.start()


def _require_participant(conversation_id, user_id, receiver_id):
    if not conversation_id:
        return True
    caller_in_conv = Participant.query.filter_by(conversation_id=conversation_id, user_id=user_id).first()
    receiver_in_conv = Participant.query.filter_by(conversation_id=conversation_id, user_id=receiver_id).first()
    return bool(caller_in_conv and receiver_in_conv)


@calls_bp.route("/api/calls/start", methods=["POST"])
@jwt_required()
def start_call():
    claims = get_jwt()
    role = claims.get("role")
    if role not in ("doctor", "patient", "admin", "super_admin"):
        return jsonify({"message": "Access denied"}), 403

    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    caller_id = int(data.get("caller_id") or user_id)
    receiver_id = data.get("receiver_id")
    call_type = (data.get("call_type") or "video").strip().lower()
    conversation_id = data.get("conversation_id")

    if caller_id != user_id:
        return jsonify({"message": "caller_id mismatch"}), 403
    if not receiver_id:
        return jsonify({"message": "receiver_id is required"}), 400
    receiver_id = int(receiver_id)
    if caller_id == receiver_id:
        return jsonify({"message": "Cannot call self"}), 400
    if call_type not in ("video", "audio"):
        return jsonify({"message": "Invalid call_type"}), 400
    if conversation_id is not None:
        try:
            conversation_id = int(conversation_id)
        except (TypeError, ValueError):
            return jsonify({"message": "conversation_id must be numeric"}), 400

    if not _require_participant(conversation_id, caller_id, receiver_id):
        return jsonify({"message": "Conversation access denied"}), 403

    caller = User.query.get(caller_id)
    receiver = User.query.get(receiver_id)
    if not caller or not receiver:
        return jsonify({"message": "User not found"}), 404

    call_id = str(uuid4())
    room_id = str(conversation_id) if conversation_id else f"call-{call_id[:8]}"
    now = datetime.utcnow()
    call = {
        "call_id": call_id,
        "room_id": room_id,
        "conversation_id": conversation_id,
        "caller_id": caller_id,
        "caller_name": caller.full_name or "Caller",
        "receiver_id": receiver_id,
        "receiver_name": receiver.full_name or "Receiver",
        "call_type": call_type,
        "status": "ringing",
        "created_at": now,
        "accepted_at": None,
        "ended_at": None,
        "decline_reason": None,
    }

    with _calls_lock:
        _calls[call_id] = call
        _schedule_missed_call(call_id)

    payload = _serialize_call(call)
    _emit_call_event("incoming_call", payload, call)
    _emit_call_event("outgoing_call", payload, call)
    _emit_call_event("call_initiated", payload, call)
    return jsonify(payload), 201


@calls_bp.route("/api/calls/accept/<call_id>", methods=["POST"])
@jwt_required()
def accept_call(call_id):
    user_id = int(get_jwt_identity())

    with _calls_lock:
        call = _calls.get(call_id)
        if not call:
            return jsonify({"message": "Call not found"}), 404
        if user_id not in (call["caller_id"], call["receiver_id"]):
            return jsonify({"message": "Access denied"}), 403
        if user_id != call["receiver_id"]:
            return jsonify({"message": "Only receiver can accept"}), 403
        if call["status"] != "ringing":
            return jsonify({"message": f"Call already {call['status']}"}), 409

        call["status"] = "connected"
        call["accepted_at"] = datetime.utcnow()
        _cancel_call_timer(call_id)
        payload = _serialize_call(call)

    _emit_call_event("call_accepted", payload, call)
    _emit_call_event("call_joined", payload, call)
    return jsonify(payload), 200


@calls_bp.route("/api/calls/decline/<call_id>", methods=["POST"])
@jwt_required()
def decline_call(call_id):
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    reason = (data.get("reason") or "declined").strip().lower()

    with _calls_lock:
        call = _calls.get(call_id)
        if not call:
            return jsonify({"message": "Call not found"}), 404
        if user_id not in (call["caller_id"], call["receiver_id"]):
            return jsonify({"message": "Access denied"}), 403
        if call["status"] not in ("ringing", "connected"):
            return jsonify({"message": f"Call already {call['status']}"}), 409

        call["status"] = "declined" if reason != "missed" else "missed"
        call["decline_reason"] = reason
        call["ended_at"] = datetime.utcnow()
        _cancel_call_timer(call_id)
        payload = _serialize_call(call)

    _emit_call_event("call_declined", payload, call)
    _emit_call_event("call_rejected", payload, call)
    return jsonify(payload), 200


@calls_bp.route("/api/calls/end/<call_id>", methods=["POST"])
@jwt_required()
def end_call(call_id):
    user_id = int(get_jwt_identity())

    with _calls_lock:
        call = _calls.get(call_id)
        if not call:
            return jsonify({"message": "Call not found"}), 404
        if user_id not in (call["caller_id"], call["receiver_id"]):
            return jsonify({"message": "Access denied"}), 403
        if call["status"] in ("ended", "declined", "missed"):
            return jsonify(_serialize_call(call)), 200

        call["status"] = "ended"
        call["ended_at"] = datetime.utcnow()
        _cancel_call_timer(call_id)
        payload = _serialize_call(call)

    _emit_call_event("call_ended", payload, call)
    return jsonify(payload), 200


@calls_bp.route("/api/calls/<call_id>", methods=["GET"])
@jwt_required()
def get_call(call_id):
    user_id = int(get_jwt_identity())
    with _calls_lock:
        call = _calls.get(call_id)
        if not call:
            return jsonify({"message": "Call not found"}), 404
        if user_id not in (call["caller_id"], call["receiver_id"]):
            return jsonify({"message": "Access denied"}), 403
        return jsonify(_serialize_call(call)), 200
