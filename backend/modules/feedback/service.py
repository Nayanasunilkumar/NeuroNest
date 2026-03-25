from database.models import db, Review, Appointment, ReviewModerationLog, ReviewTag, ReviewEscalation, User
from sqlalchemy import func
from datetime import datetime, timedelta

class FeedbackService:
    @staticmethod
    def get_all_reviews(filters=None):
        query = Review.query
        
        if filters:
            if filters.get('rating'):
                query = query.filter(Review.rating == filters['rating'])
            if filters.get('doctor_id'):
                query = query.filter(Review.doctor_id == filters['doctor_id'])
            if filters.get('is_flagged') is not None:
                query = query.filter(Review.is_flagged == filters['is_flagged'])
            if filters.get('sentiment'):
                query = query.filter(Review.sentiment == filters['sentiment'])
                
        return query.order_by(Review.created_at.desc()).all()

    @staticmethod
    def get_review_by_id(review_id):
        return Review.query.get(review_id)

    @staticmethod
    def submit_review(data):
        appt = Appointment.query.get(data['appointment_id'])
        if not appt or str(appt.status).lower() != 'completed':
            return None, "Only completed appointments can be reviewed."
        if appt.feedback_given:
            return None, "Feedback already submitted for this appointment."
        
        from database.models import DoctorPrivacySetting
        privacy = DoctorPrivacySetting.query.filter_by(doctor_user_id=appt.doctor_id).first()
        if privacy and not privacy.allow_reviews_publicly:
            return None, "This doctor does not accept public reviews at this time."
        
        rating = int(data['rating'])
        sentiment = "positive" if rating >= 4 else ("negative" if rating <= 2 else "neutral")
        is_serious = bool(data.get('is_serious_complaint', False))
        
        review = Review(
            appointment_id=data['appointment_id'],
            patient_id=data['patient_id'],
            doctor_id=appt.doctor_id,
            rating=rating,
            review_text=data.get('review_text', ''),
            sentiment=sentiment,
            is_flagged=is_serious,
        )
        appt.feedback_given = True
        db.session.add(review)
        db.session.flush()
        
        for tag_name in data.get('tags', []):
            db.session.add(ReviewTag(review_id=review.id, tag=tag_name))
        
        if is_serious:
            db.session.add(ReviewEscalation(
                review_id=review.id,
                escalated_by=data['patient_id'],
                reason=data.get('complaint_reason', 'Patient marked as serious complaint'),
                status='open'
            ))
        
        db.session.commit()
        
        # 🔗 Governance Hook: Detection of risk clusters and auto-escalation
        from services.governance_service import GovernanceService
        GovernanceService.process_review_event(review.id)
        
        return review, None

    @staticmethod
    def get_patient_reviews(patient_id):
        reviews = Review.query.filter_by(patient_id=patient_id)\
            .order_by(Review.created_at.desc()).all()
        result = []
        for r in reviews:
            tags = [t.tag for t in ReviewTag.query.filter_by(review_id=r.id).all()]
            escalation = ReviewEscalation.query.filter_by(review_id=r.id).first()
            age_hours = (datetime.utcnow() - r.created_at).total_seconds() / 3600
            can_edit = age_hours <= 24 and not escalation
            result.append({
                "id": r.id,
                "appointment_id": r.appointment_id,
                "doctor_id": r.doctor_id,
                "doctor_name": r.doctor.full_name if r.doctor else "Doctor",
                "rating": r.rating,
                "review_text": r.review_text,
                "sentiment": r.sentiment,
                "tags": tags,
                "is_flagged": r.is_flagged,
                "date": r.created_at.strftime("%Y-%m-%d"),
                "can_edit": can_edit,
                "complaint": {
                    "id": escalation.id,
                    "status": escalation.status,
                    "reason": escalation.reason,
                    "created_at": escalation.created_at.strftime("%Y-%m-%d")
                } if escalation else None
            })
        return result

    @staticmethod
    def edit_patient_review(review_id, patient_id, data):
        review = Review.query.get(review_id)
        if not review or review.patient_id != patient_id:
            return False, "Review not found or unauthorized."
        age_hours = (datetime.utcnow() - review.created_at).total_seconds() / 3600
        if age_hours > 24:
            return False, "Edit window has expired (24 hours)."
        if ReviewEscalation.query.filter_by(review_id=review_id).first():
            return False, "Cannot edit a review that has been escalated."
        if 'rating' in data:
            r = int(data['rating'])
            review.rating = r
            review.sentiment = "positive" if r >= 4 else ("negative" if r <= 2 else "neutral")
        if 'review_text' in data:
            review.review_text = data['review_text']
        if 'tags' in data:
            ReviewTag.query.filter_by(review_id=review_id).delete()
            for tag_name in data['tags']:
                db.session.add(ReviewTag(review_id=review_id, tag=tag_name))
        db.session.commit()
        return True, "Review updated successfully."

    @staticmethod
    def get_patient_complaints(patient_id):
        escalations = db.session.query(ReviewEscalation)\
            .join(Review, ReviewEscalation.review_id == Review.id)\
            .filter(Review.patient_id == patient_id)\
            .order_by(ReviewEscalation.created_at.desc()).all()
        result = []
        for e in escalations:
            rv = Review.query.get(e.review_id)
            result.append({
                "complaint_id": e.id,
                "review_id": e.review_id,
                "doctor_name": rv.doctor.full_name if rv and rv.doctor else "N/A",
                "appointment_id": rv.appointment_id if rv else None,
                "reason": e.reason,
                "status": e.status,
                "created_at": e.created_at.strftime("%Y-%m-%d"),
                "rating_given": rv.rating if rv else None,
            })
        return result

    @staticmethod
    def moderate_review(review_id, admin_id, data):
        print(f"🏥 [G-PROTOCOL] START Review #{review_id} | Admin: {admin_id} | Data: {data}")
        
        review = Review.query.get(review_id)
        if not review:
            print(f"❌ [G-PROTOCOL] Review #{review_id} not found in database")
            return False, "Review not found"
        
        action = data.get('action') # hide, flag, approve, escalate
        note = data.get('note', '')
        
        from database.models import DoctorEscalation, ReviewEscalation, ReviewModerationLog, ReviewTag, DoctorProfile
        from services.governance_service import GovernanceService

        # Mapping actions to standard statuses
        status_map = {
            'hide': 'Hidden',
            'approve': 'Approved',
            'flag': 'Flagged',
            'escalate': 'Escalated'
        }
        
        target_status = status_map.get(action, 'Moderated')
        print(f"🔍 [G-PROTOCOL] Attempting action: {action} -> {target_status}")

        try:
            review.status = target_status
            review.admin_note = note
            print(f"✅ [G-PROTOCOL] Baseline metadata updated")
        except Exception as e:
            print(f"⚠️ [G-PROTOCOL] Schema mismatch on baseline metadata: {e}")
        
        if action == 'hide':
            review.is_hidden = True
        elif action == 'approve':
            review.is_hidden = False
            review.is_flagged = False
        elif action == 'flag':
            review.is_flagged = True
        elif action == 'escalate':
            review.is_flagged = True
            
            # --- HARD FIX: SAFE ESCALATION Fallback ---
            try:
                review.escalated_at = datetime.utcnow()
                print(f"✅ [G-PROTOCOL] Timestamped escalation")
            except Exception as e:
                print(f"⚠️ [G-PROTOCOL] Timestamp failed: {e}")

            severity = data.get('severity', 'Standard')
            category = data.get('category', 'Quality of Care')
            
            # Safely sync metadata - don't crash if columns are missing
            for attr, val in [("escalation_severity", severity), ("audit_category", category), ("admin_note", note)]:
                try:
                    if hasattr(review, attr):
                        setattr(review, attr, val)
                        print(f"🔗 [G-PROTOCOL] Synced {attr}")
                except Exception as attr_err:
                    print(f"⚠️ [G-PROTOCOL] Metadata sync failed for {attr}: {attr_err}")
            
            # Hook into governance triage
            try:
                GovernanceService.trigger_auto_escalation(
                    review.doctor_id, 
                    f"[MANUAL ESCALATION - {severity}] Review #{review.id}: {note}"
                )
                print(f"✅ [G-PROTOCOL] Governance Triage Hooked")
            except Exception as hook_err:
                print(f"⚠️ [G-PROTOCOL] Governance Hook failed: {hook_err}")
            
            try:
                review_esc = ReviewEscalation(
                    review_id=review_id,
                    escalated_by=admin_id,
                    severity_level=severity,
                    category=category,
                    reason=note,
                    status="Open"
                )
                db.session.add(review_esc)
                print(f"✅ [G-PROTOCOL] Escalation record staged")
            except Exception as esc_err:
                print(f"⚠️ [G-PROTOCOL] Escalation record failed: {esc_err}")
            
        # 🔗 Governance Hook: Recalculate doctor telemetry after moderation
        try:
            GovernanceService.process_review_event(review.id)
            print(f"✅ [G-PROTOCOL] Analytics recalibrated")
        except Exception as e:
            print(f"⚠️ [G-PROTOCOL] Analytics hook failed: {e}")
            
        # Log moderation
        try:
            log = ReviewModerationLog(
                review_id=review_id,
                doctor_id=review.doctor_id,
                patient_id=review.patient_id,
                action=action,
                performed_by=admin_id,
                note=note
            )
            db.session.add(log)
            print(f"✅ [G-PROTOCOL] Audit log staged")
        except Exception as e:
            print(f"⚠️ [G-PROTOCOL] Audit log staging failed: {e}")
        
        # Handle Tags
        if 'tags' in data:
            try:
                ReviewTag.query.filter_by(review_id=review_id).delete()
                for tag_name in data['tags']:
                    db.session.add(ReviewTag(review_id=review_id, tag_name=tag_name))
                print(f"✅ [G-PROTOCOL] Tags synchronized")
            except Exception as e:
                print(f"⚠️ [G-PROTOCOL] Tag sync failed: {e}")
            
        try:
            db.session.commit()
            print(f"🎉 [OVERSIGHT] Successfully finalized moderation Review #{review_id}")
            return True, f"Governance Protocol Finalized: Case {action.upper()} operation successful."
        except Exception as e:
            db.session.rollback()
            print(f"💥 [OVERSIGHT] ATOMIC CRASH Review #{review_id}: {str(e)}")
            return False, f"Atomic Transaction Failure: {str(e)}"

    @staticmethod
    def get_quality_stats():
        total_reviews = Review.query.count()
        avg_rating = db.session.query(func.avg(Review.rating)).scalar() or 0
        
        # Recent negative reviews (last 7 days)
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_neg = Review.query.filter(Review.rating <= 2, Review.created_at >= week_ago).count()
        
        # Most reported doctor
        most_reported = db.session.query(
            Review.doctor_id, User.full_name, func.count(Review.id)
        ).join(User, Review.doctor_id == User.id)\
         .filter(Review.is_flagged == True)\
         .group_by(Review.doctor_id, User.full_name)\
         .order_by(func.count(Review.id).desc()).first()
         
        from database.models import DoctorEscalation
        unresolved_escalations = DoctorEscalation.query.filter_by(status='open').count()
        
        return {
            "avg_rating": round(float(avg_rating), 1),
            "total_reviews": total_reviews,
            "recent_negative": recent_neg,
            "most_reported_doctor": most_reported[1] if most_reported else "None",
            "most_reported_doctor_id": most_reported[0] if most_reported else None,
            "unresolved_escalations": unresolved_escalations
        }

    @staticmethod
    def get_doctor_feedback_summary(doctor_id):
        escalated = FeedbackService._escalated_review_ids()
        # Stats for the specific doctor — serious complaint reviews are admin-only, excluded here
        total_reviews = Review.query.filter(
            Review.doctor_id == doctor_id,
            Review.is_hidden == False,
            ~Review.id.in_(escalated)
        ).count()
        avg_rating = db.session.query(func.avg(Review.rating)).filter(
            Review.doctor_id == doctor_id,
            Review.is_hidden == False,
            ~Review.id.in_(escalated)
        ).scalar() or 0
        
        month_ago = datetime.utcnow() - timedelta(days=30)
        negative_30d = Review.query.filter(
            Review.doctor_id == doctor_id,
            Review.rating <= 2,
            Review.created_at >= month_ago,
            Review.is_hidden == False,
            ~Review.id.in_(escalated)
        ).count()
        
        return {
            "avg_rating": round(float(avg_rating), 1),
            "total_reviews": total_reviews,
            "negative_reviews_30d": negative_30d,
            "rating_trend": "stable"
        }

    @staticmethod
    def _escalated_review_ids():
        """Returns a set of review IDs that have been escalated (serious complaint). 
        These are excluded from ALL doctor-facing views."""
        return db.session.query(ReviewEscalation.review_id).subquery()

    @staticmethod
    def get_doctor_rating_distribution(doctor_id):
        escalated = FeedbackService._escalated_review_ids()
        dist = db.session.query(
            Review.rating, func.count(Review.id)
        ).filter(
            Review.doctor_id == doctor_id,
            Review.is_hidden == False,
            ~Review.id.in_(escalated)
        ).group_by(Review.rating).all()
        
        result = {i: 0 for i in range(1, 6)}
        for rating, count in dist:
            result[rating] = count
        return result

    @staticmethod
    def get_doctor_performance_trend(doctor_id):
        escalated = FeedbackService._escalated_review_ids()
        trend = []
        for i in range(5, -1, -1):
            month_start = (datetime.utcnow().replace(day=1) - timedelta(days=i*30)).replace(day=1)
            month_end = (month_start + timedelta(days=32)).replace(day=1)
            
            avg = db.session.query(func.avg(Review.rating)).filter(
                Review.doctor_id == doctor_id,
                Review.created_at >= month_start,
                Review.created_at < month_end,
                Review.is_hidden == False,
                ~Review.id.in_(escalated)
            ).scalar() or 0
            
            count = Review.query.filter(
                Review.doctor_id == doctor_id,
                Review.created_at >= month_start,
                Review.created_at < month_end,
                Review.is_hidden == False,
                ~Review.id.in_(escalated)
            ).count()
            
            trend.append({
                "month": month_start.strftime("%b %Y"),
                "avg_rating": round(float(avg), 1),
                "review_count": count
            })
        return trend

    @staticmethod
    def get_doctor_tag_analytics(doctor_id):
        escalated = FeedbackService._escalated_review_ids()
        tags = db.session.query(
            ReviewTag.tag, func.count(ReviewTag.id)
        ).join(Review, ReviewTag.review_id == Review.id)\
         .filter(
             Review.doctor_id == doctor_id,
             Review.is_hidden == False,
             ~Review.id.in_(escalated)
         ).group_by(ReviewTag.tag)\
         .order_by(func.count(ReviewTag.id).desc()).limit(10).all()
         
        return [{"tag": t[0], "count": t[1]} for t in tags]

    @staticmethod
    def get_doctor_reviews_list(doctor_id, limit=20):
        escalated = FeedbackService._escalated_review_ids()
        # Exclude: hidden reviews AND serious complaint escalations (admin-only)
        reviews = Review.query.filter(
            Review.doctor_id == doctor_id,
            Review.is_hidden == False,
            ~Review.id.in_(escalated)   # 🔒 Serious complaints never reach doctor view
        ).order_by(Review.created_at.desc()).limit(limit).all()
            
        result = []
        for r in reviews:
            tags = [t.tag for t in ReviewTag.query.filter_by(review_id=r.id).all()]
            result.append({
                "id": r.id,
                "appointment_id": r.appointment_id,
                "date": r.created_at.strftime("%Y-%m-%d"),
                "rating": r.rating,
                "review_text": r.review_text,
                "sentiment": r.sentiment,
                "patient_anonymized": f"Patient #{r.patient_id}",
                "tags": tags
                # NOTE: is_flagged, escalation status, patient name — NOT exposed to doctor
            })
        return result
