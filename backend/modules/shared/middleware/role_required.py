from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt, jwt_required


def _normalized_role():
    return (get_jwt().get("role") or "").strip().lower()


def require_roles(*allowed_roles):
    allowed = {role.strip().lower() for role in allowed_roles}

    def decorator(view):
        @wraps(view)
        @jwt_required()
        def wrapper(*args, **kwargs):
            if _normalized_role() not in allowed:
                return jsonify({"message": "Role access denied"}), 403
            return view(*args, **kwargs)

        return wrapper

    return decorator


def protect_blueprint(blueprint, *allowed_roles):
    if getattr(blueprint, "_role_guard_installed", False):
        return blueprint

    allowed = {role.strip().lower() for role in allowed_roles}

    @blueprint.before_request
    @jwt_required()
    def enforce_blueprint_role():
        if _normalized_role() not in allowed:
            return jsonify({"message": "Role access denied"}), 403

    blueprint._role_guard_installed = True
    return blueprint
