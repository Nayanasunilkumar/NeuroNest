from datetime import datetime, timedelta
from database.models import db, Review, Appointment, DoctorProfile, DoctorEscalation, EscalationAction, User

class GovernanceService:
    @staticmethod
    def calculate_risk_score(doctor_profile):
        """
        Refined Risk Score (Weighted Protocol):
        Risk Score =
          (Complaint Volume * 0.5) +
          (Missed Appointments * 0.3) +
          (Low Ratings [<3.0] * 0.2)
        Calculated as a normalized aggregate to identify clinical outliers.
        """
        complaint_weight = min(doctor_profile.report_count * 10, 50) # Cap at 50%
        missed_weight = min(doctor_profile.missed_appointments_count * 5, 30) # Cap at 30%
        rating_penalty = 0
        if doctor_profile.avg_rating < 3.0:
            rating_penalty = 20 # Max 20% penalty
        elif doctor_profile.avg_rating < 4.0:
            rating_penalty = 10
            
        return complaint_weight + missed_weight + rating_penalty

    @staticmethod
    def map_score_to_risk(score):
        if score >= 70: return "critical"
        if score >= 40: return "high"
        if score >= 20: return "medium"
        return "low"

    @staticmethod
    def process_review_event(review_id):
        """Called after a review is submitted to check for escalations."""
        review = Review.query.get(review_id)
        if not review: return

        profile = DoctorProfile.query.filter_by(user_id=review.doctor_id).first()
        if not profile: return

        # Update telemetry
        if review.rating <= 2:
            profile.critical_review_count += 1
        
        all_reviews = Review.query.filter_by(doctor_id=review.doctor_id).all()
        if all_reviews:
            profile.avg_rating = sum(r.rating for r in all_reviews) / len(all_reviews)

        # Re-calc risk level
        score = GovernanceService.calculate_risk_score(profile)
        profile.risk_score = score
        profile.risk_level = GovernanceService.map_score_to_risk(score)

        # 🛡️ Safe Escalation Triggers
        if profile.risk_level in ["high", "critical"] or review.is_flagged:
            # Check for existing open escalation
            existing = DoctorEscalation.query.filter_by(doctor_id=profile.user_id, status="open").first()
            if not existing:
                escalation = DoctorEscalation(
                    doctor_id=profile.user_id,
                    reason=f"Risk Threshold Exceeded: {profile.risk_level.upper()}",
                    risk_level=profile.risk_level,
                    status="open",
                    admin_notes="System flagged for manual verification. No auto-suspension applied."
                )
                db.session.add(escalation)
                
                # 📢 Deduplicated Notification Dispatch
                from database.models import InAppNotification
                one_hour_ago = datetime.utcnow() - timedelta(hours=1)
                
                # Check for similar notification in last hour to avoid spam
                recent_notif = InAppNotification.query.filter(
                    InAppNotification.payload['doctor_id'].astext == str(profile.user_id),
                    InAppNotification.type == "escalation",
                    InAppNotification.created_at >= one_hour_ago
                ).first()

                if not recent_notif:
                    from modules.shared.services.notification_service import NotificationService
                    doctor_name = profile.user.full_name
                    
                    NotificationService.send_admin_notification(
                        title="Specialist Risk Flagged",
                        message=f"System has flagged {'Dr. ' if not doctor_name.startswith('Dr.') else ''}{doctor_name} for manual review based on clinical telemetry.",
                        notif_type="escalation",
                        severity="critical",
                        payload={
                            "doctor_id": profile.user_id,
                            "doctor_license": profile.license_number,
                            "risk_level": profile.risk_level,
                            "department": profile.department or "General Medicine",
                            "stats": {
                                "complaints": profile.report_count,
                                "critical_reviews": profile.critical_review_count,
                                "missed_appointments": profile.missed_appointments_count,
                                "avg_rating": round(profile.avg_rating, 1)
                            }
                        }
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
        profile.risk_score = score
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

        # ⚖️ Create Institutional Audit Log
        from database.models import AdminAuditLog
        audit = AdminAuditLog(
            admin_id=admin_id,
            action=f"governance_{action_type}",
            target_type="doctor",
            target_id=str(profile.user_id),
            details={
                "escalation_id": escalation_id,
                "admin_note": note,
                "previous_status": profile.doctor_status,
                "risk_at_time_of_action": profile.risk_level
            }
        )
        db.session.add(audit)

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
            
            # Clear clinical risk metrics upon resolution (Clean Slate Protocol)
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
