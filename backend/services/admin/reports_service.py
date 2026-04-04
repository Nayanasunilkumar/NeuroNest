from datetime import datetime, timedelta
from sqlalchemy import func, case, cast, String
from database.models import db, User, Appointment, Review, ReviewEscalation, PatientFlag, SecurityActivity, DoctorStatusLog, PatientStatusLog, NotificationPreference

class AdminReportsService:
    @staticmethod
    def _appointment_trends_for_window(start_date, end_date):
        return (
            AdminReportsService._analytics_enabled_appointment_query()
            .with_entities(
                func.date(Appointment.appointment_date).label('date'),
                func.count(Appointment.id).label('count')
            )
            .filter(
                Appointment.appointment_date >= start_date,
                Appointment.appointment_date <= end_date,
            )
            .group_by(func.date(Appointment.appointment_date))
            .order_by(func.date(Appointment.appointment_date))
            .all()
        )

    @staticmethod
    def _analytics_enabled_appointment_query():
        return (
            db.session.query(Appointment)
            .outerjoin(NotificationPreference, NotificationPreference.user_id == Appointment.patient_id)
            .filter(func.coalesce(NotificationPreference.allow_analytics, True).is_(True))
        )

    @staticmethod
    def _analytics_enabled_review_query():
        return (
            db.session.query(Review)
            .outerjoin(NotificationPreference, NotificationPreference.user_id == Review.patient_id)
            .filter(func.coalesce(NotificationPreference.allow_analytics, True).is_(True))
        )
    
    @staticmethod
    def get_system_overview_metrics():
        today = datetime.now().date()
        
        # Base user metrics
        patient_count = db.session.query(func.count(User.id)).filter(User.role == 'patient').scalar() or 0
        doctor_count = db.session.query(func.count(User.id)).filter(User.role == 'doctor').scalar() or 0
        
        # Appointment volume metrics 
        appointment_query = AdminReportsService._analytics_enabled_appointment_query()
        total_appointments = appointment_query.with_entities(func.count(Appointment.id)).scalar() or 0
        today_appointments = appointment_query.filter(
            func.date(Appointment.appointment_date) == today
        ).with_entities(func.count(Appointment.id)).scalar() or 0
        
        # Advanced aggregations utilizing PostgreSQL CASE for conditional counting
        appointment_states = appointment_query.with_entities(
            func.sum(case((cast(Appointment.status, String).ilike('Completed'), 1), else_=0)).label('completed_count'),
            func.sum(case((cast(Appointment.status, String).ilike('Pending'), 1), else_=0)).label('pending_count'),
            func.sum(case((cast(Appointment.status, String).ilike('%Cancelled%'), 1), else_=0)).label('cancelled_count')
        ).first()

        completed_count = appointment_states.completed_count or 0
        pending_count = appointment_states.pending_count or 0
        cancelled_count = appointment_states.cancelled_count or 0

        # Review overview
        reviews_agg = AdminReportsService._analytics_enabled_review_query().with_entities(
            func.count(Review.id).label('total_reviews'),
            func.avg(Review.rating).label('average_rating')
        ).first()
        
        total_reviews = reviews_agg.total_reviews or 0
        avg_rating = float(reviews_agg.average_rating) if reviews_agg.average_rating else 0.0

        return {
            "users": {
                "total_patients": patient_count,
                "total_doctors": doctor_count,
            },
            "appointments": {
                "total": total_appointments,
                "today": today_appointments,
                "completed": int(completed_count),
                "pending": int(pending_count),
                "cancelled": int(cancelled_count)
            },
            "reviews": {
                "total": total_reviews,
                "average_rating": round(avg_rating, 1)
            }
        }

    @staticmethod
    def get_appointment_analytics(days=7):
        today = datetime.now().date()
        window_start = today - timedelta(days=max(days - 1, 0))

        daily_trends = AdminReportsService._appointment_trends_for_window(window_start, today)

        if not daily_trends:
            latest_appointment_date = (
                AdminReportsService._analytics_enabled_appointment_query()
                .with_entities(func.max(Appointment.appointment_date))
                .scalar()
            )

            if latest_appointment_date:
                fallback_end = latest_appointment_date
                fallback_start = fallback_end - timedelta(days=max(days - 1, 0))
                daily_trends = AdminReportsService._appointment_trends_for_window(
                    fallback_start,
                    fallback_end,
                )

        return {
            "daily_trends": [{"date": str(d.date), "count": d.count} for d in daily_trends],
            "period_days": days
        }

    @staticmethod
    def get_doctor_performance_report():
        # Joins Appointment, Review and Users table efficiently allowing postgres to do the heavy lifting
        # Calculates metrics per doctor in a single fast query
        doctor_stats = db.session.query(
            User.id,
            User.full_name,
            func.count(Appointment.id).label('total_appointments'),
            func.sum(case((cast(Appointment.status, String).ilike('Completed'), 1), else_=0)).label('completed_count'),
            func.sum(case((cast(Appointment.status, String).ilike('%Cancelled%'), 1), else_=0)).label('cancelled_count')
        ).join(
            Appointment, User.id == Appointment.doctor_id, isouter=True
        ).outerjoin(
            NotificationPreference, NotificationPreference.user_id == Appointment.patient_id
        ).filter(
            User.role == 'doctor',
            func.coalesce(NotificationPreference.allow_analytics, True).is_(True)
        ).group_by(
            User.id, User.full_name
        ).all()

        results = []
        for stat in doctor_stats:
            total = stat.total_appointments or 0
            completed = stat.completed_count or 0
            cancelled = stat.cancelled_count or 0
            
            completion_rate = (completed / total * 100) if total > 0 else 0
            cancellation_rate = (cancelled / total * 100) if total > 0 else 0

            results.append({
                "doctor_id": stat.id,
                "doctor_name": stat.full_name,
                "total_appointments": total,
                "completed": int(completed),
                "cancelled": int(cancelled),
                "completion_rate_pct": round(completion_rate, 1),
                "cancellation_rate_pct": round(cancellation_rate, 1)
            })

        return results

    @staticmethod
    def get_governance_report(days=30):
        target_date = datetime.now() - timedelta(days=days)

        # 1. Review Escalations Overview
        escalations_agg = db.session.query(
            func.count(ReviewEscalation.id).label('total_escalated'),
            func.sum(case((ReviewEscalation.status == 'open', 1), else_=0)).label('unresolved')
        ).filter(ReviewEscalation.created_at >= target_date).first()

        # 2. Patient Flags
        patient_flags_agg = db.session.query(
            func.count(PatientFlag.id).label('total_flags'),
            func.sum(case((PatientFlag.is_resolved == False, 1), else_=0)).label('unresolved')
        ).filter(PatientFlag.created_at >= target_date).first()

        # 3. Doctor Status Changes (e.g., Suspensions/Approvals)
        doctor_status_changes = db.session.query(
            func.count(DoctorStatusLog.id).label('changes')
        ).filter(DoctorStatusLog.created_at >= target_date).scalar() or 0

        # 4. Security Activity (Logins/Failed Logins)
        security_agg = db.session.query(
            func.count(SecurityActivity.id).label('total_events'),
            func.sum(case((SecurityActivity.event_type.ilike('%fail%'), 1), else_=0)).label('failed_attempts')
        ).filter(SecurityActivity.created_at >= target_date).first()

        return {
            "period_days": days,
            "escalations": {
                "total": escalations_agg.total_escalated or 0,
                "unresolved": int(escalations_agg.unresolved or 0)
            },
            "patient_flags": {
                "total": patient_flags_agg.total_flags or 0,
                "unresolved": int(patient_flags_agg.unresolved or 0)
            },
            "doctor_status_changes": doctor_status_changes,
            "security": {
                "events_logged": security_agg.total_events or 0,
                "failed_authentications": int(security_agg.failed_attempts or 0)
            }
        }
