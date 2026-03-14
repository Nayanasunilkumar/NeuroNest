from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity

from database.models import db, Alert, User
from extensions.socket import socketio

alerts_bp = Blueprint("alerts", __name__)


@alerts_bp.route("/api/alerts", methods=["GET"])
@jwt_required()
def list_alerts():
    claims = get_jwt()
    role = claims.get("role")
    user_id = int(get_jwt_identity())

    unacked_only = request.args.get("unacknowledged") == "true"

    query = Alert.query

    if role == "patient":
        query = query.filter_by(patient_id=user_id)
    elif role in ("doctor", "admin", "super_admin"):
        # Doctors / admins can see all alerts
        pass
    else:
        return jsonify({"message": "Access denied"}), 403

    if unacked_only:
        query = query.filter_by(is_acknowledged=False)

    alerts = query.order_by(Alert.created_at.desc()).limit(200).all()
    return jsonify([a.to_dict() for a in alerts]), 200


@alerts_bp.route("/api/alerts/<int:alert_id>/acknowledge", methods=["PATCH"])
@jwt_required()
def acknowledge_alert(alert_id):
    claims = get_jwt()
    role = claims.get("role")
    user_id = int(get_jwt_identity())

    alert = Alert.query.get(alert_id)
    if not alert:
        return jsonify({"message": "Alert not found"}), 404

    if role == "patient" and alert.patient_id != user_id:
        return jsonify({"message": "Access denied"}), 403

    alert.is_acknowledged = True
    alert.acknowledged_by = user_id
    alert.acknowledged_at = datetime.utcnow()
    db.session.commit()

    # Broadcast ack event so UIs can update
    socketio.emit("alert_acknowledged", {"id": alert.id, "acknowledged_by": user_id})

    return jsonify(alert.to_dict()), 200
