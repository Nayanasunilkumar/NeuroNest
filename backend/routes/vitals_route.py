from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone
import secrets

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required
from werkzeug.security import check_password_hash, generate_password_hash

from database.models import (
    Appointment,
    LatestVitalState,
    MedicalDevice,
    User,
    VitalStreamRecord,
    db,
)
from extensions.socket import socketio

vitals_bp = Blueprint("vitals", __name__)

DEVICE_OFFLINE_AFTER_SECONDS = 30
DEVICE_RATE_LIMIT_WINDOW_SECONDS = 10
DEVICE_RATE_LIMIT_MAX_REQUESTS = 30
_device_rate_window = defaultdict(deque)


def _utc_now():
    return datetime.now(timezone.utc)


def _to_utc(dt_value):
    if dt_value is None:
        return None
    if dt_value.tzinfo is None:
        return dt_value.replace(tzinfo=timezone.utc)
    return dt_value.astimezone(timezone.utc)


def _serialize_state(state):
    if not state:
        return None

    payload = state.to_dict()
    payload["heart_rate"] = payload.pop("heart_rate", None)
    return payload


def _within_range(value, minimum, maximum):
    return value is None or (minimum <= value <= maximum)


def _is_admin(role):
    return role in ("admin", "super_admin")


def _can_access_patient_vitals(user_id, role, patient_id):
    if role == "patient":
        return int(user_id) == int(patient_id)

    if _is_admin(role):
        return True

    if role == "doctor":
        relationship = Appointment.query.filter_by(
            doctor_id=int(user_id),
            patient_id=int(patient_id),
        ).first()
        return relationship is not None

    return False


def _mark_stale_devices():
    now_utc = _utc_now()
    threshold = now_utc - timedelta(seconds=DEVICE_OFFLINE_AFTER_SECONDS)
    devices = MedicalDevice.query.all()
    changed = False
    for device in devices:
        last_seen = _to_utc(device.last_seen_timestamp)
        next_status = "online" if last_seen and last_seen >= threshold else "offline"
        if device.device_status != next_status:
            device.device_status = next_status
            changed = True
    if changed:
        db.session.commit()


def _validate_and_normalize_payload(data):
    heart_rate = data.get("heart_rate", data.get("hr"))
    spo2 = data.get("spo2")
    temperature = data.get("temperature", data.get("temp"))
    ecg_data = data.get("ecg_data", data.get("ecg"))
    signal = data.get("signal", "ok")
    recorded_timestamp = data.get("recorded_timestamp", data.get("timestamp"))

    if heart_rate is not None:
        heart_rate = float(heart_rate)
    if spo2 is not None:
        spo2 = float(spo2)
    if temperature is not None:
        temperature = float(temperature)

    if not _within_range(heart_rate, 20, 240):
        raise ValueError("heart_rate must be between 20 and 240")
    if not _within_range(spo2, 50, 100):
        raise ValueError("spo2 must be between 50 and 100")
    if not _within_range(temperature, 25, 45):
        raise ValueError("temperature must be between 25 and 45")

    if ecg_data is None:
        ecg_payload = []
    elif isinstance(ecg_data, list):
        if len(ecg_data) > 2048:
            raise ValueError("ecg_data is too large")
        ecg_payload = [float(point) for point in ecg_data]
    else:
        raise ValueError("ecg_data must be a list of numeric samples")

    if signal not in ("ok", "weak", "no_finger", "initialising", "na"):
        raise ValueError("signal value is invalid")

    if recorded_timestamp:
        try:
            normalized_ts = datetime.fromisoformat(str(recorded_timestamp).replace("Z", "+00:00"))
        except ValueError as exc:
            raise ValueError("recorded_timestamp must be ISO-8601") from exc
        normalized_ts = _to_utc(normalized_ts)
    else:
        normalized_ts = _utc_now()

    return {
        "heart_rate": heart_rate,
        "spo2": spo2,
        "temperature": temperature,
        "ecg_data": ecg_payload,
        "signal": signal,
        "recorded_timestamp": normalized_ts,
    }


def _resolve_device_auth(data):
    device_id = request.headers.get("X-Device-Id") or data.get("device_id")
    device_token = request.headers.get("X-Device-Token") or data.get("device_token")

    if not device_id or not device_token:
        return None, "device_id and device_token are required"

    device = MedicalDevice.query.filter_by(device_id=str(device_id).strip()).first()
    if not device:
        return None, "Device not registered"

    if not check_password_hash(device.device_token_hash, str(device_token)):
        return None, "Invalid device token"

    window = _device_rate_window[device.device_id]
    now = _utc_now()
    cutoff = now - timedelta(seconds=DEVICE_RATE_LIMIT_WINDOW_SECONDS)
    while window and window[0] < cutoff:
        window.popleft()
    if len(window) >= DEVICE_RATE_LIMIT_MAX_REQUESTS:
        return None, "Rate limit exceeded"
    window.append(now)

    return device, None


def _build_broadcast_payload(state):
    payload = _serialize_state(state)
    if not payload:
        return None

    heart_rate = payload.get("heart_rate")
    spo2 = payload.get("spo2")
    temperature = payload.get("temperature")

    payload["hr_alert"] = bool(heart_rate is not None and (heart_rate < 50 or heart_rate > 120))
    payload["spo2_alert"] = bool(spo2 is not None and spo2 < 90)
    payload["temp_alert"] = bool(temperature is not None and (temperature < 34.5 or temperature > 37.2))
    return payload


def _emit_vitals_update(state):
    payload = _build_broadcast_payload(state)
    if not payload:
        return

    patient_room = f"patient_vitals_{state.patient_id}"
    socketio.emit("vitals_update", payload, room=patient_room)
    socketio.emit("vitals_update", payload, room=f"user_{state.patient_id}")


@vitals_bp.route("/api/vitals/devices", methods=["POST"])
@jwt_required()
def register_device():
    claims = get_jwt()
    role = claims.get("role")
    if role not in ("doctor", "admin", "super_admin"):
        return jsonify({"message": "Doctor or admin access required"}), 403

    data = request.get_json() or {}
    device_id = (data.get("device_id") or "").strip()
    device_name = (data.get("device_name") or "").strip()
    patient_id = data.get("patient_id")

    if not device_id or not device_name or not patient_id:
        return jsonify({"message": "device_id, device_name and patient_id are required"}), 400

    patient = User.query.filter_by(id=int(patient_id), role="patient").first()
    if not patient:
        return jsonify({"message": "Patient not found"}), 404

    current_user_id = int(get_jwt_identity())
    if role == "doctor" and not _can_access_patient_vitals(current_user_id, role, patient.id):
        return jsonify({"message": "Clinical relationship required"}), 403

    existing = MedicalDevice.query.filter_by(device_id=device_id).first()
    generated_token = data.get("device_token") or secrets.token_urlsafe(24)
    token_hash = generate_password_hash(generated_token)

    if existing:
        existing.device_name = device_name
        existing.patient_id = patient.id
        existing.device_token_hash = token_hash
        existing.device_status = "offline"
        device = existing
    else:
        device = MedicalDevice(
            device_id=device_id,
            device_name=device_name,
            device_token_hash=token_hash,
            patient_id=patient.id,
            device_status="offline",
        )
        db.session.add(device)

    db.session.commit()
    payload = device.to_dict()
    payload["device_token"] = generated_token
    return jsonify(payload), 201


@vitals_bp.route("/api/vitals/devices", methods=["GET"])
@jwt_required()
def list_devices():
    claims = get_jwt()
    role = claims.get("role")
    current_user_id = int(get_jwt_identity())

    _mark_stale_devices()

    if role == "patient":
        devices = MedicalDevice.query.filter_by(patient_id=current_user_id).order_by(MedicalDevice.device_name.asc()).all()
    elif role == "doctor":
        patient_ids = [
            row[0]
            for row in db.session.query(Appointment.patient_id)
            .filter_by(doctor_id=current_user_id)
            .distinct()
            .all()
        ]
        devices = MedicalDevice.query.filter(MedicalDevice.patient_id.in_(patient_ids)).order_by(MedicalDevice.device_name.asc()).all() if patient_ids else []
    elif _is_admin(role):
        devices = MedicalDevice.query.order_by(MedicalDevice.device_name.asc()).all()
    else:
        return jsonify({"message": "Access denied"}), 403

    return jsonify([device.to_dict() for device in devices]), 200


@vitals_bp.route("/api/vitals/monitored-patients", methods=["GET"])
@jwt_required()
def monitored_patients():
    claims = get_jwt()
    role = claims.get("role")
    current_user_id = int(get_jwt_identity())
    if role not in ("doctor", "admin", "super_admin"):
        return jsonify({"message": "Doctor or admin access required"}), 403

    _mark_stale_devices()

    states_query = LatestVitalState.query
    if role == "doctor":
        patient_ids = [
            row[0]
            for row in db.session.query(Appointment.patient_id)
            .filter_by(doctor_id=current_user_id)
            .distinct()
            .all()
        ]
        if not patient_ids:
            return jsonify([]), 200
        states_query = states_query.filter(LatestVitalState.patient_id.in_(patient_ids))

    states = states_query.order_by(LatestVitalState.recorded_timestamp.desc()).all()
    return jsonify([_serialize_state(state) for state in states if state]), 200


@vitals_bp.route("/api/device/vitals", methods=["POST"])
@vitals_bp.route("/api/vitals/update", methods=["POST"])
def receive_vitals():
    data = request.get_json(silent=True) or {}
    if not data:
        return jsonify({"error": "No data"}), 400

    device, auth_error = _resolve_device_auth(data)
    if auth_error:
        return jsonify({"error": auth_error}), 401 if auth_error != "Rate limit exceeded" else 429

    try:
        payload = _validate_and_normalize_payload(data)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    device.last_seen_timestamp = payload["recorded_timestamp"]
    device.device_status = "online"

    stream_record = VitalStreamRecord(
        patient_id=device.patient_id,
        device_id=device.device_id,
        heart_rate=payload["heart_rate"],
        spo2=payload["spo2"],
        temperature=payload["temperature"],
        ecg_data=payload["ecg_data"],
        recorded_timestamp=payload["recorded_timestamp"],
        signal=payload["signal"],
    )
    db.session.add(stream_record)

    latest_state = LatestVitalState.query.filter_by(patient_id=device.patient_id).first()
    if not latest_state:
        latest_state = LatestVitalState(
            patient_id=device.patient_id,
            device_id=device.device_id,
        )
        db.session.add(latest_state)

    latest_state.device_id = device.device_id
    latest_state.heart_rate = payload["heart_rate"]
    latest_state.spo2 = payload["spo2"]
    latest_state.temperature = payload["temperature"]
    latest_state.ecg_data = payload["ecg_data"]
    latest_state.recorded_timestamp = payload["recorded_timestamp"]
    latest_state.signal = payload["signal"]

    db.session.commit()
    _emit_vitals_update(latest_state)

    return jsonify(
        {
            "status": "ok",
            "device_id": device.device_id,
            "patient_id": device.patient_id,
            "recorded_timestamp": payload["recorded_timestamp"].isoformat(),
        }
    ), 200


@vitals_bp.route("/api/vitals/latest", methods=["GET"])
@jwt_required()
def get_latest():
    claims = get_jwt()
    role = claims.get("role")
    current_user_id = int(get_jwt_identity())
    requested_patient_id = request.args.get("patient_id", type=int) or current_user_id

    if not _can_access_patient_vitals(current_user_id, role, requested_patient_id):
        return jsonify({"message": "Access denied"}), 403

    _mark_stale_devices()
    state = LatestVitalState.query.filter_by(patient_id=requested_patient_id).first()
    if not state:
        return jsonify(
            {
                "patient_id": requested_patient_id,
                "device_status": "offline",
                "heart_rate": None,
                "spo2": None,
                "temperature": None,
                "ecg_data": [],
                "recorded_timestamp": None,
                "signal": "na",
            }
        ), 200

    return jsonify(_build_broadcast_payload(state)), 200


@vitals_bp.route("/api/vitals/history", methods=["GET"])
@jwt_required()
def get_history():
    claims = get_jwt()
    role = claims.get("role")
    current_user_id = int(get_jwt_identity())
    requested_patient_id = request.args.get("patient_id", type=int) or current_user_id
    limit = request.args.get("limit", type=int) or 60
    limit = max(1, min(limit, 300))

    if not _can_access_patient_vitals(current_user_id, role, requested_patient_id):
        return jsonify({"message": "Access denied"}), 403

    rows = (
        VitalStreamRecord.query.filter_by(patient_id=requested_patient_id)
        .order_by(VitalStreamRecord.recorded_timestamp.desc())
        .limit(limit)
        .all()
    )

    history = [row.to_dict() for row in reversed(rows)]
    return jsonify(history), 200
