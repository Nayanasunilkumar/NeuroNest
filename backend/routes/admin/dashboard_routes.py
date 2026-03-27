from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.models import User, Appointment
from sqlalchemy import func
from datetime import datetime

admin_dashboard_bp = Blueprint("admin_dashboard", __name__)

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

@admin_dashboard_bp.route("/", methods=["GET"])
@super_admin_required
def get_dashboard_summary():
    """
    Returns high-level statistics and recent activity for the Admin Dashboard.
    """
    try:
        total_patients = User.query.filter_by(role="patient").count()
        active_doctors = User.query.filter_by(role="doctor").count()

        total_appointments = Appointment.query.count()
        today_appointments = Appointment.query.filter(
            func.date(Appointment.created_at) == datetime.utcnow().date()
        ).count()

        return jsonify({
            "stats": [
                {
                    "label": "Total Patients",
                    "value": f"{total_patients:,}",
                    "trend": "Live",
                    "color": "blue",
                    "id": "patients"
                },
                {
                    "label": "Active Doctors",
                    "value": f"{active_doctors:,}",
                    "trend": "Live",
                    "color": "green",
                    "id": "doctors"
                },
                {
                    "label": "Total Appointments",
                    "value": f"{total_appointments:,}",
                    "trend": "Live",
                    "color": "purple",
                    "id": "appointments"
                },
                {
                    "label": "Today's Appointments",
                    "value": f"{today_appointments:,}",
                    "trend": "Live",
                    "color": "orange",
                    "id": "today_appointments"
                }
            ],
            "activities": [],
            "tasks": [],
            "chartData": []
        }), 200

    except Exception as e:
        print(f"Error fetching dashboard stats: {str(e)}")
        return jsonify({"error": "Failed to load dashboard data"}), 500
