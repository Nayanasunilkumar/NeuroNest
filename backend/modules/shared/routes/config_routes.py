from flask import Blueprint, jsonify
from models.system_settings import SystemSetting

config_bp = Blueprint("config", __name__)

@config_bp.route("/system-config", methods=["GET"])
def get_public_system_config():
    """
    Returns public-facing system settings (contact info, timezone, etc.)
    used by the frontend for UI configuration.
    """
    settings = SystemSetting.query.all()
    # Map to a simple key-value object for easier consumption
    config = {s.setting_key: s.setting_value for s in settings}
    return jsonify(config), 200

@config_bp.route("/modules/config", methods=["GET"])
def get_module_config():
    """
    Returns feature flag configuration to enable/disable 
    specific frontend modules dynamically.
    """
    # For now, return a default enabled state for all core modules.
    # In the future, this can be linked to a ModuleToggle model.
    return jsonify({
        "chat": True,
        "vitals": True,
        "appointments": True,
        "prescriptions": True,
        "records": True
    }), 200
