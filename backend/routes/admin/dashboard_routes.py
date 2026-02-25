from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.models import User, Appointment, PatientProfile, DoctorProfile, db
from sqlalchemy import func
from datetime import datetime, timedelta

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
        
        # Calculate trend (Mock logic: comparing today's count to past, simplifying here)
        patients_trend = "+5.2%"
        doctors_trend = "+2.1%"
        
        total_appointments = Appointment.query.count()
        today_appointments = Appointment.query.filter(
            func.date(Appointment.created_at) == datetime.utcnow().date()
        ).count()
        
        # System Load (Mock Data)
        system_load = "24ms"
        
        # Revenue (Mock Data since no Payments table exists yet)
        revenue_mtd = "$12.5k"
        revenue_trend = "+18.2%"
        
        # Activity Logs (Mock Data)
        activities = [
            {"text": "Auth node: Dr. Sarah Smith login established", "time": "12:04:22", "type": "info"},
            {"text": "Patch 2.4.1 deployed to edge cluster", "time": "11:45:10", "type": "success"},
            {"text": "Billing Cron: Monthly reports generated", "time": "09:00:00", "type": "info"},
            {"text": "Access Denied: Multiple failed attempts from IP 192.x", "time": "08:12:45", "type": "error"},
        ]
        
        # Tasks (Mock Data)
        tasks = [
            {"title": "Credential Verification", "desc": "Dr. James Wilson (ID: 442)", "priority": "High"},
            {"title": "Fee Schedule Update", "desc": "Radiology department revisions", "priority": "Medium"},
            {"title": "SLA Audit", "desc": "Response time threshold analysis", "priority": "High"},
        ]
        
        # Chart Data
        chart_data = [
            {"day": "M", "p": 80, "s": 40},
            {"day": "T", "p": 120, "s": 60},
            {"day": "W", "p": 150, "s": 90},
            {"day": "T", "p": 100, "s": 50},
            {"day": "F", "p": 170, "s": 110},
            {"day": "S", "p": 60, "s": 30},
            {"day": "S", "p": 40, "s": 20},
        ]

        return jsonify({
            "stats": [
                {
                    "label": "Total Patients",
                    "value": f"{total_patients:,}",
                    "trend": patients_trend,
                    "color": "blue",
                    "id": "patients"
                },
                {
                    "label": "Active Doctors",
                    "value": f"{active_doctors:,}",
                    "trend": doctors_trend,
                    "color": "green",
                    "id": "doctors"
                },
                {
                    "label": "System Load",
                    "value": system_load,
                    "trend": "Stable",
                    "color": "purple",
                    "id": "load"
                },
                {
                    "label": "Revenue (MTD)",
                    "value": revenue_mtd,
                    "trend": revenue_trend,
                    "color": "orange",
                    "id": "revenue"
                }
            ],
            "activities": activities,
            "tasks": tasks,
            "chartData": chart_data
        }), 200

    except Exception as e:
        print(f"Error fetching dashboard stats: {str(e)}")
        return jsonify({"error": "Failed to load dashboard data"}), 500
