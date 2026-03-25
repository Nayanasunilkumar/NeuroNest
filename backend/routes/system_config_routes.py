from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from database.models import User, db
from models.system_settings import SystemSetting

system_config_bp = Blueprint("system_config", __name__)

CONFIG_KEYS = {
    "platform_name": {"default": "NeuroNest", "type": "string", "group": "general"},
    "contact_number": {"default": "+91-44-4000-0000", "type": "string", "group": "general"},
    "support_email": {"default": "support@neuronest.com", "type": "email", "group": "general"},
    "default_language": {"default": "en-IN", "type": "string", "group": "general"},
    "default_timezone": {"default": "Asia/Kolkata", "type": "string", "group": "general"},
    "maintenance_mode": {"default": "false", "type": "boolean", "group": "general"},
}


def _serialize(settings_map):
    return {
        "platform_name": settings_map["platform_name"].setting_value,
        "contact_number": settings_map["contact_number"].setting_value,
        "support_email": settings_map["support_email"].setting_value,
        "default_language": settings_map["default_language"].setting_value,
        "default_timezone": settings_map["default_timezone"].setting_value,
        "maintenance_mode": str(settings_map["maintenance_mode"].setting_value).lower() == "true",
        "updated_at": max(
            (s.updated_at for s in settings_map.values() if s.updated_at),
            default=None,
        ).isoformat()
        if any(s.updated_at for s in settings_map.values())
        else None,
    }


def _ensure_config():
    settings = (
        SystemSetting.query.filter(SystemSetting.setting_key.in_(list(CONFIG_KEYS.keys()))).all()
    )
    settings_map = {s.setting_key: s for s in settings}
    changed = False

    for key, meta in CONFIG_KEYS.items():
        if key not in settings_map:
            setting = SystemSetting(
                setting_key=key,
                setting_value=meta["default"],
                setting_type=meta["type"],
                setting_group=meta["group"],
            )
            db.session.add(setting)
            settings_map[key] = setting
            changed = True

    if changed:
        db.session.commit()

    return settings_map


def _admin_required():
    current_id = get_jwt_identity()
    user = User.query.get(current_id)
    return user and user.role == "admin", user


@system_config_bp.route("/", methods=["GET"], strict_slashes=False)
@system_config_bp.route("", methods=["GET"], strict_slashes=False)
def get_system_config():
    settings_map = _ensure_config()
    return jsonify(_serialize(settings_map)), 200


@system_config_bp.route("/", methods=["PUT"], strict_slashes=False)
@system_config_bp.route("", methods=["PUT"], strict_slashes=False)
@jwt_required()
def update_system_config():
    allowed, user = _admin_required()
    if not allowed:
        return jsonify({"error": "Admin access required"}), 403

    payload = request.get_json(silent=True) or {}
    if not isinstance(payload, dict):
        return jsonify({"error": "Invalid payload"}), 400

    settings_map = _ensure_config()
    updated = 0

    for key in CONFIG_KEYS:
        if key not in payload:
            continue
        setting = settings_map[key]
        value = payload[key]
        normalized = str(bool(value)).lower() if key == "maintenance_mode" else str(value).strip()
        if setting.setting_value != normalized:
            setting.setting_value = normalized
            setting.updated_by = user.id
            setting.updated_at = datetime.utcnow()
            updated += 1

    if updated:
        db.session.commit()

    return jsonify({"message": "System configuration updated", "updated": updated, **_serialize(settings_map)}), 200

