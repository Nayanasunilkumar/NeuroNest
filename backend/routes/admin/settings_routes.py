from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.system_settings import SystemSetting
from database.models import db, User
from datetime import datetime

admin_settings_bp = Blueprint("admin_settings", __name__)

def super_admin_required(fn):
    @jwt_required()
    def wrapper(*args, **kwargs):
        current_id = get_jwt_identity()
        user = User.query.get(current_id)
        if not user or user.role != "admin":
            return jsonify({"error": "Admin access required"}), 403
        return fn(*args, **kwargs)
    wrapper.__name__ = fn.__name__
    return wrapper

# GET ALL SETTINGS OR BY GROUP
@admin_settings_bp.route("/", methods=["GET"], strict_slashes=False)
@admin_settings_bp.route("", methods=["GET"], strict_slashes=False)
@super_admin_required
def get_settings():
    group = request.args.get("group", "")
    query = SystemSetting.query
    
    if group:
        query = query.filter_by(setting_group=group)
        
    settings = query.all()
    
    # Return as an object grouped by key for easy React consumption
    settings_dict = {}
    for setting in settings:
        settings_dict[setting.setting_key] = {
            "id": setting.id,
            "value": setting.setting_value,
            "type": setting.setting_type,
            "group": setting.setting_group
        }
        
    return jsonify(settings_dict), 200

# UPDATE A BATCH OF SETTINGS
@admin_settings_bp.route("/batch", methods=["PUT"], strict_slashes=False)
@super_admin_required
def update_settings_batch():
    data = request.json
    if not isinstance(data, dict):
        return jsonify({"error": "Invalid format, expecting object with key-value pairs"}), 400
        
    admin_id = get_jwt_identity()
    updated_count = 0
    
    for key, value in data.items():
        setting = SystemSetting.query.filter_by(setting_key=key).first()
        if setting:
            setting.setting_value = str(value)
            setting.updated_by = admin_id
            setting.updated_at = datetime.utcnow()
            updated_count += 1
            
    if updated_count > 0:
        db.session.commit()
        return jsonify({"message": f"Successfully updated {updated_count} system settings"}), 200
        
    return jsonify({"message": "No settings found to update"}), 400
