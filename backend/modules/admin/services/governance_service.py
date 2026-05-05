from datetime import datetime, timedelta
from database.models import db, Review, Appointment, DoctorProfile, DoctorEscalation, EscalationAction, User

class GovernanceService:
    @staticmethod
    def calculate_risk_score(doctor_profile):
        """
        Risk Score =
        (critical_reviews * 3)
        + (missed_appointments * 2)
        + (low_ratings * 2)
        + (report_count * 4)
        """
        score = (
            (doctor_profile.critical_review_count * 3) +
            (doctor_profile.missed_appointments_count * 2) +
            (doctor_profile.avg_rating < 3.0 and 5 or 0) + # Penalty for low avg
            (doctor_profile.report_count * 4)
        )
        return score

    @staticmethod
    def map_score_to_risk(score):
        if score > 20: return "critical"
        if score > 10: return "high"
        if score > 5: return "medium"
        return "low"

    @staticmethod
    def process_review_event(review_id):
        """Called after a review is submitted to check for auto-escalations."""
        review = Review.query.get(review_id)
        if not review: return

        profile = DoctorProfile.query.filter_by(user_id=review.doctor_id).first()
        if not profile: return

        # Update telemetry
        if review.rating <= 2:
            profile.critical_review_count += 1
        
        # Re-calc average rating
        all_reviews = Review.query.filter_by(doctor_id=review.doctor_id).all()
        if all_reviews:
            profile.avg_rating = sum(r.rating for r in all_reviews) / len(all_reviews)

        # Re-calc risk level
        score = GovernanceService.calculate_risk_score(profile)
        profile.risk_level = GovernanceService.map_score_to_risk(score)

        # Auto-Escalation Triggers
        if profile.risk_level in ["high", "critical"] or review.is_flagged:
            # Check if an open escalation already exists for this doctor
            existing = DoctorEscalation.query.filter_by(doctor_id=profile.user_id, status="open").first()
            if not existing:
                escalation = DoctorEscalation(
                    doctor_id=profile.user_id,
                    reason=f"Auto-escalated: Risk Level {profile.risk_level.upper()}",
                    risk_level=profile.risk_level,
                    status="open",
                    admin_notes="System detected high risk profile based on recent telemetry."
                )
                db.session.add(escalation)
                profile.doctor_status = "under_review"
                
                # 📢 Notify Administrators
                from modules.shared.services.notification_service import NotificationService
                doctor_name = profile.user.full_name
                
                NotificationService.send_admin_notification(
                    title="Critical Doctor Escalation",
                    message=f"System has automatically flagged {'Dr. ' if not doctor_name.startswith('Dr.') else ''}{doctor_name} for immediate review.",
                    notif_type="escalation",
                    severity="critical",
                    payload={"doctor_id": profile.user_id, "risk_level": profile.risk_level}
                )

        db.session.commit()

    @staticmethod
    def process_missed_appointment(appointment_id):
        """Called when an appointment is marked as missed."""
        appt = Appointment.query.get(appointment_id)
        if not appt: return

        profile = DoctorProfile.query.filter_by(user_id=appt.doctor_id).first()
        if not profile: return

        profile.missed_appointments_count += 1
        
        score = GovernanceService.calculate_risk_score(profile)
        profile.risk_level = GovernanceService.map_score_to_risk(score)

        if profile.missed_appointments_count >= 5:
             existing = DoctorEscalation.query.filter_by(doctor_id=profile.user_id, status="open").first()
             if not existing:
                escalation = DoctorEscalation(
                    doctor_id=profile.user_id,
                    reason="Excessive Missed Appointments (threshold reached)",
                    risk_level="high",
                    status="open"
                )
                db.session.add(escalation)

        db.session.commit()

    @staticmethod
    def perform_admin_action(escalation_id, admin_id, action_type, note):
        """Admin acts on an escalation."""
        escalation = DoctorEscalation.query.get(escalation_id)
        if not escalation: return False, "Escalation not found"

        profile = DoctorProfile.query.filter_by(user_id=escalation.doctor_id).first()
        if not profile: return False, "Doctor profile not found"

        # Create audit log
        action = EscalationAction(
            escalation_id=escalation_id,
            admin_id=admin_id,
            action_type=action_type,
            note=note
        )
        db.session.add(action)

        # Update doctor status based on action
        if action_type == "suspend":
            profile.doctor_status = "suspended"
            profile.user.account_status = "suspended"
        elif action_type == "restrict":
            profile.doctor_status = "restricted"
        elif action_type == "warning":
            profile.doctor_status = "under_review"
        elif action_type == "resolve":
            escalation.status = "resolved"
            escalation.resolved_at = datetime.utcnow()
            profile.doctor_status = "active"
            profile.user.account_status = "active"
            
            # Clear clinical risk metrics upon resolution (Clean Slate)
            profile.risk_level = "low"
            profile.report_count = 0
            profile.critical_review_count = 0
            profile.missed_appointments_count = 0
        elif action_type == "dismiss":
            escalation.status = "dismissed"
            escalation.resolved_at = datetime.utcnow()
            profile.doctor_status = "active"

        db.session.commit()
        return True, "Action completed successfully"
