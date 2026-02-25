from datetime import datetime, timedelta
from sqlalchemy import func, case, cast, String
from database.models import db, User, Appointment, Review, ReviewEscalation, PatientFlag, SecurityActivity, DoctorStatusLog, PatientStatusLog

class AdminReportsService:
    
    @staticmethod
    def get_system_overview_metrics():
        today = datetime.now().date()
        
        # Base user metrics
        patient_count = db.session.query(func.count(User.id)).filter(User.role == 'patient').scalar() or 0
        doctor_count = db.session.query(func.count(User.id)).filter(User.role == 'doctor').scalar() or 0
        
        # Appointment volume metrics 
        total_appointments = db.session.query(func.count(Appointment.id)).scalar() or 0
        today_appointments = db.session.query(func.count(Appointment.id)).filter(
            func.date(Appointment.appointment_date) == today
        ).scalar() or 0
        
        # Advanced aggregations utilizing PostgreSQL CASE for conditional counting
        appointment_states = db.session.query(
            func.sum(case((cast(Appointment.status, String).ilike('Completed'), 1), else_=0)).label('completed_count'),
            func.sum(case((cast(Appointment.status, String).ilike('Pending'), 1), else_=0)).label('pending_count'),
            func.sum(case((cast(Appointment.status, String).ilike('%Cancelled%'), 1), else_=0)).label('cancelled_count')
        ).first()

        completed_count = appointment_states.completed_count or 0
        pending_count = appointment_states.pending_count or 0
        cancelled_count = appointment_states.cancelled_count or 0

        # Review overview
        reviews_agg = db.session.query(
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
        target_date = datetime.now() - timedelta(days=days)
        
        # PostgreSQL specific aggregation for daily appointment volume
        daily_trends = db.session.query(
            func.date(Appointment.appointment_date).label('date'),
            func.count(Appointment.id).label('count')
        ).filter(
            Appointment.created_at >= target_date
        ).group_by(
            func.date(Appointment.appointment_date)
        ).order_by(
            func.date(Appointment.appointment_date)
        ).all()

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
        ).filter(
            User.role == 'doctor'
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

