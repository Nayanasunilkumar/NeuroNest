from flask import Blueprint, jsonify

modules_config_bp = Blueprint('modules_config', __name__)


@modules_config_bp.get('/config')
def get_modules_config():
    """
    Placeholder endpoint for server-driven module toggles.
    In the next phase this will read from the `modules` table
    and tenant/org-level policy rules.
    """
    return jsonify([
        {"moduleKey": "dashboard", "isEnabled": True},
        {"moduleKey": "profile", "isEnabled": True},
        {"moduleKey": "appointmentRequests", "isEnabled": True},
        {"moduleKey": "todaySchedule", "isEnabled": True},
        {"moduleKey": "myPatients", "isEnabled": True},
        {"moduleKey": "writePrescription", "isEnabled": True},
        {"moduleKey": "assessmentReports", "isEnabled": True},
        {"moduleKey": "performanceAnalytics", "isEnabled": False},
        {"moduleKey": "alerts", "isEnabled": True},
        {"moduleKey": "patientChat", "isEnabled": True},
        {"moduleKey": "settings", "isEnabled": True},
    ])
