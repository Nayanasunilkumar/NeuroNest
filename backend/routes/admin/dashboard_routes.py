from datetime import datetime, timedelta

from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import func

from database.models import Appointment, DoctorEscalation, Review, User
from models.announcement import Announcement

admin_dashboard_bp = Blueprint("admin_dashboard", __name__)


def _safe_count(label, query):
    try:
        return query.count()
    except Exception as exc:
        print(f"[ADMIN DASHBOARD] count failed for {label}: {exc}")
        return 0


def _safe_all(label, query):
    try:
        return query.all()
    except Exception as exc:
        print(f"[ADMIN DASHBOARD] query failed for {label}: {exc}")
        return []


def _format_relative_time(value):
    if not value:
        return "System"

    delta = datetime.utcnow() - value
    seconds = max(int(delta.total_seconds()), 0)

    if seconds < 60:
        return "Just now"

    minutes = seconds // 60
    if minutes < 60:
        return f"{minutes} min ago"

    hours = minutes // 60
    if hours < 24:
        return f"{hours} hr ago"

    days = hours // 24
    if days < 7:
        return f"{days} day{'s' if days != 1 else ''} ago"

    return value.strftime("%d %b")


def _trend_label(current, previous):
    if previous <= 0:
        return "Live" if current > 0 else "Stable"

    diff = current - previous
    if diff == 0:
        return "Stable"

    pct = round((diff / previous) * 100)
    return f"{'+' if pct > 0 else ''}{pct}%"


def _build_chart_data():
    today = datetime.utcnow().date()
    start_day = today - timedelta(days=6)
    days = [start_day + timedelta(days=offset) for offset in range(7)]
    chart_data = []

    for day in days:
        next_day = day + timedelta(days=1)
        intake = _safe_count(
            f"appointments intake {day}",
            Appointment.query.filter(
                Appointment.created_at >= day,
                Appointment.created_at < next_day,
            ),
        )
        outflow = _safe_count(
            f"appointments outflow {day}",
            Appointment.query.filter(
                func.lower(Appointment.status) == "completed",
                Appointment.updated_at >= day,
                Appointment.updated_at < next_day,
            ),
        )
        chart_data.append({"day": day.strftime("%a"), "p": intake, "s": outflow})

    max_value = max((max(item["p"], item["s"]) for item in chart_data), default=0)
    if max_value <= 0:
        return []

    return [
        {
            "day": item["day"],
            "p": round((item["p"] / max_value) * 100),
            "s": round((item["s"] / max_value) * 100),
        }
        for item in chart_data
    ]


def _build_tasks():
    tasks = []

    pending_appointments = _safe_count(
        "pending appointments",
        Appointment.query.filter(
            func.lower(Appointment.status).in_(["pending", "rescheduled"])
        ),
    )
    if pending_appointments:
        tasks.append(
            {
                "title": "Review appointment approvals",
                "desc": f"{pending_appointments} appointment request{'s' if pending_appointments != 1 else ''} waiting for action.",
                "priority": "High",
            }
        )

    pending_reviews = _safe_count(
        "pending reviews",
        Review.query.filter(
            func.lower(Review.status).in_(["pending", "flagged", "escalated"])
        ),
    )
    if pending_reviews:
        tasks.append(
            {
                "title": "Moderate patient reviews",
                "desc": f"{pending_reviews} review item{'s' if pending_reviews != 1 else ''} need moderation follow-up.",
                "priority": "Medium" if pending_reviews < 5 else "High",
            }
        )

    open_escalations = _safe_count(
        "open escalations",
        DoctorEscalation.query.filter(
            func.lower(DoctorEscalation.status).in_(["open", "investigating"])
        ),
    )
    if open_escalations:
        tasks.append(
            {
                "title": "Handle doctor escalations",
                "desc": f"{open_escalations} governance escalation{'s' if open_escalations != 1 else ''} remain unresolved.",
                "priority": "High",
            }
        )

    scheduled_announcements = _safe_count(
        "scheduled announcements",
        Announcement.query.filter(
            func.lower(Announcement.status) == "scheduled"
        ),
    )
    if scheduled_announcements:
        tasks.append(
            {
                "title": "Confirm scheduled announcements",
                "desc": f"{scheduled_announcements} announcement{'s' if scheduled_announcements != 1 else ''} scheduled for release.",
                "priority": "Low",
            }
        )

    unverified_doctors = _safe_count(
        "unverified doctors",
        User.query.filter(
            User.role == "doctor",
            User.is_verified.is_(False),
            User.is_deleted.is_(False),
        ),
    )
    if unverified_doctors:
        tasks.append(
            {
                "title": "Verify doctor accounts",
                "desc": f"{unverified_doctors} doctor profile{'s' if unverified_doctors != 1 else ''} still need verification review.",
                "priority": "Medium",
            }
        )

    priority_order = {"High": 0, "Medium": 1, "Low": 2}
    tasks.sort(key=lambda item: priority_order.get(item["priority"], 9))
    return tasks[:6]


def _build_activities():
    items = []

    recent_appointments = _safe_all(
        "recent appointments",
        Appointment.query.order_by(Appointment.created_at.desc()).limit(3),
    )
    for appointment in recent_appointments:
        patient_name = appointment.patient.full_name if appointment.patient else f"patient {appointment.patient_id}"
        items.append(
            {
                "time": _format_relative_time(appointment.created_at),
                "type": "success",
                "text": f"Appointment #{appointment.id} created for {patient_name} with status {appointment.status}.",
                "created_at": appointment.created_at,
            }
        )

    recent_reviews = _safe_all(
        "recent reviews",
        Review.query.order_by(Review.created_at.desc()).limit(3),
    )
    for review in recent_reviews:
        doctor_name = review.doctor.full_name if review.doctor else f"doctor {review.doctor_id}"
        status = (review.status or "").lower()
        items.append(
            {
                "time": _format_relative_time(review.created_at),
                "type": "error" if status in {"flagged", "escalated"} or review.rating <= 2 else "success",
                "text": f"Review submitted for {doctor_name} with rating {review.rating}/5.",
                "created_at": review.created_at,
            }
        )

    recent_escalations = _safe_all(
        "recent escalations",
        DoctorEscalation.query.order_by(DoctorEscalation.created_at.desc()).limit(3),
    )
    for escalation in recent_escalations:
        doctor_name = escalation.doctor.full_name if escalation.doctor else f"doctor {escalation.doctor_id}"
        items.append(
            {
                "time": _format_relative_time(escalation.created_at),
                "type": "error",
                "text": f"Governance escalation opened for {doctor_name} ({escalation.risk_level} risk).",
                "created_at": escalation.created_at,
            }
        )

    recent_announcements = _safe_all(
        "recent announcements",
        Announcement.query.order_by(Announcement.created_at.desc()).limit(2),
    )
    for announcement in recent_announcements:
        items.append(
            {
                "time": _format_relative_time(announcement.created_at),
                "type": "success",
                "text": f"Announcement \"{announcement.title}\" saved with status {announcement.status}.",
                "created_at": announcement.created_at,
            }
        )

    items.sort(key=lambda item: item["created_at"] or datetime.min, reverse=True)
    return [
        {
            "time": item["time"],
            "type": item["type"],
            "text": item["text"],
        }
        for item in items[:8]
    ]


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
        today = datetime.utcnow().date()
        yesterday = today - timedelta(days=1)

        total_patients = User.query.filter_by(role="patient").count()
        active_doctors = User.query.filter_by(role="doctor").count()
        total_appointments = Appointment.query.count()
        today_appointments = Appointment.query.filter(
            func.date(Appointment.created_at) == today
        ).count()
        yesterday_appointments = Appointment.query.filter(
            func.date(Appointment.created_at) == yesterday
        ).count()

        previous_patient_total = User.query.filter(
            User.role == "patient",
            func.date(User.created_at) < today,
        ).count()
        previous_doctor_total = User.query.filter(
            User.role == "doctor",
            func.date(User.created_at) < today,
        ).count()

        return jsonify(
            {
                "stats": [
                    {
                        "label": "Total Patients",
                        "value": f"{total_patients:,}",
                        "trend": _trend_label(total_patients, previous_patient_total),
                        "color": "blue",
                        "id": "patients",
                    },
                    {
                        "label": "Active Doctors",
                        "value": f"{active_doctors:,}",
                        "trend": _trend_label(active_doctors, previous_doctor_total),
                        "color": "green",
                        "id": "doctors",
                    },
                    {
                        "label": "Total Appointments",
                        "value": f"{total_appointments:,}",
                        "trend": _trend_label(
                            total_appointments,
                            max(total_appointments - today_appointments, 0),
                        ),
                        "color": "purple",
                        "id": "appointments",
                    },
                    {
                        "label": "Today's Appointments",
                        "value": f"{today_appointments:,}",
                        "trend": _trend_label(today_appointments, yesterday_appointments),
                        "color": "orange",
                        "id": "today_appointments",
                    },
                ],
                "activities": _build_activities(),
                "tasks": _build_tasks(),
                "chartData": _build_chart_data(),
            }
        ), 200

    except Exception as e:
        print(f"Error fetching dashboard stats: {str(e)}")
        return jsonify({"error": "Failed to load dashboard data"}), 500
