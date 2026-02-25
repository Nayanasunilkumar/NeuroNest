from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt
from services.admin.reports_service import AdminReportsService

admin_reports_bp = Blueprint("admin_reports", __name__)

def _is_admin():
    return get_jwt().get("role") == "admin"

@admin_reports_bp.route("/overview", methods=["GET"])
@jwt_required()
def get_overview():
    if not _is_admin():
        return jsonify({"message": "Admin access required"}), 403

    try:
        metrics = AdminReportsService.get_system_overview_metrics()
        return jsonify(metrics), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@admin_reports_bp.route("/appointments", methods=["GET"])
@jwt_required()
def get_appointment_analytics():
    if not _is_admin():
        return jsonify({"message": "Admin access required"}), 403

    try:
        days = int(request.args.get("days", 7))
        analytics = AdminReportsService.get_appointment_analytics(days)
        return jsonify(analytics), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@admin_reports_bp.route("/doctors", methods=["GET"])
@jwt_required()
def get_doctor_performance():
    if not _is_admin():
        return jsonify({"message": "Admin access required"}), 403

    try:
        reports = AdminReportsService.get_doctor_performance_report()
        return jsonify(reports), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@admin_reports_bp.route("/governance", methods=["GET"])
@jwt_required()
def get_governance():
    if not _is_admin():
        return jsonify({"message": "Admin access required"}), 403

    try:
        days = int(request.args.get("days", 30))
        report = AdminReportsService.get_governance_report(days)
        return jsonify(report), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500
