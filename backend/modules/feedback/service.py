from database.models import db, Review, Appointment, ReviewModerationLog, ReviewTag, ReviewEscalation, User
from sqlalchemy import func
from sqlalchemy import inspect, text
from datetime import datetime, timedelta

class FeedbackService:
    @staticmethod
    def _get_table_columns(table_name):
        try:
            inspector = inspect(db.engine)
            return {col["name"] for col in inspector.get_columns(table_name)}
        except Exception:
            return set()

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
        
        payload = data or {}
        action = payload.get('action') # hide, flag, approve, escalate
        note = payload.get('note', '')
        
        from database.models import DoctorEscalation, ReviewEscalation, ReviewModerationLog, ReviewTag, DoctorProfile
        from services.governance_service import GovernanceService
        reviews_cols = FeedbackService._get_table_columns("reviews")
        review_logs_cols = FeedbackService._get_table_columns("review_moderation_logs")
        review_escalations_cols = FeedbackService._get_table_columns("review_escalations")

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
            if "status" in reviews_cols:
                review.status = target_status
            if "admin_note" in reviews_cols:
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
                if "escalated_at" in reviews_cols:
                    review.escalated_at = datetime.utcnow()
                    print(f"✅ [G-PROTOCOL] Timestamped escalation")
            except Exception as e:
                print(f"⚠️ [G-PROTOCOL] Timestamp failed: {e}")

            severity = payload.get('severity', 'Standard')
            category = payload.get('category', 'Quality of Care')
            
            # Safely sync metadata - don't crash if columns are missing
            for attr, val in [("escalation_severity", severity), ("audit_category", category), ("admin_note", note)]:
                try:
                    if attr in reviews_cols:
                        setattr(review, attr, val)
                        print(f"🔗 [G-PROTOCOL] Synced {attr}")
                except Exception as attr_err:
                    print(f"⚠️ [G-PROTOCOL] Metadata sync failed for {attr}: {attr_err}")
            
            # Persist review escalation in a schema-safe manner (works across old/new DB schemas).
            try:
                insert_cols = []
                insert_values = {}

                if "review_id" in review_escalations_cols:
                    insert_cols.append("review_id")
                    insert_values["review_id"] = review_id
                if "escalated_by" in review_escalations_cols:
                    insert_cols.append("escalated_by")
                    insert_values["escalated_by"] = admin_id
                if "reason" in review_escalations_cols:
                    insert_cols.append("reason")
                    insert_values["reason"] = note or "Escalated by admin moderation workflow"
                if "status" in review_escalations_cols:
                    insert_cols.append("status")
                    insert_values["status"] = "Open"
                if "severity_level" in review_escalations_cols:
                    insert_cols.append("severity_level")
                    insert_values["severity_level"] = severity
                if "category" in review_escalations_cols:
                    insert_cols.append("category")
                    insert_values["category"] = category
                if "created_at" in review_escalations_cols:
                    insert_cols.append("created_at")
                    insert_values["created_at"] = datetime.utcnow()

                if insert_cols:
                    placeholders = ", ".join([f":{c}" for c in insert_cols])
                    sql = f"INSERT INTO review_escalations ({', '.join(insert_cols)}) VALUES ({placeholders})"
                    db.session.execute(text(sql), insert_values)
                else:
                    print("⚠️ [G-PROTOCOL] review_escalations columns unavailable; skipping escalation row insert.")
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
            insert_cols = []
            insert_values = {}
            if "review_id" in review_logs_cols:
                insert_cols.append("review_id")
                insert_values["review_id"] = review_id
            if "doctor_id" in review_logs_cols:
                insert_cols.append("doctor_id")
                insert_values["doctor_id"] = review.doctor_id
            if "patient_id" in review_logs_cols:
                insert_cols.append("patient_id")
                insert_values["patient_id"] = review.patient_id
            if "action" in review_logs_cols:
                insert_cols.append("action")
                insert_values["action"] = action or "moderate"
            if "performed_by" in review_logs_cols:
                insert_cols.append("performed_by")
                insert_values["performed_by"] = admin_id
            if "note" in review_logs_cols:
                insert_cols.append("note")
                insert_values["note"] = note
            if "created_at" in review_logs_cols:
                insert_cols.append("created_at")
                insert_values["created_at"] = datetime.utcnow()

            if insert_cols:
                placeholders = ", ".join([f":{c}" for c in insert_cols])
                sql = f"INSERT INTO review_moderation_logs ({', '.join(insert_cols)}) VALUES ({placeholders})"
                db.session.execute(text(sql), insert_values)
            else:
                print("⚠️ [G-PROTOCOL] review_moderation_logs columns unavailable; skipping moderation log insert.")
            print(f"✅ [G-PROTOCOL] Audit log staged")
        except Exception as e:
            print(f"⚠️ [G-PROTOCOL] Audit log staging failed: {e}")
        
        # Handle Tags
        if 'tags' in payload:
            try:
                ReviewTag.query.filter_by(review_id=review_id).delete()
                for tag_name in payload['tags']:
                    db.session.add(ReviewTag(review_id=review_id, tag=tag_name))
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

            # Safe fallback: persist only the core review moderation state.
            # This guarantees admin actions don't fail just because secondary audit tables drift.
            try:
                update_cols = []
                update_values = {"id": review_id}

                if "is_hidden" in reviews_cols:
                    is_hidden_value = (action == "hide")
                    if action == "approve":
                        is_hidden_value = False
                    update_cols.append("is_hidden = :is_hidden")
                    update_values["is_hidden"] = is_hidden_value

                if "is_flagged" in reviews_cols:
                    is_flagged_value = action in ("flag", "escalate")
                    if action == "approve":
                        is_flagged_value = False
                    update_cols.append("is_flagged = :is_flagged")
                    update_values["is_flagged"] = is_flagged_value

                if "status" in reviews_cols:
                    update_cols.append("status = :status")
                    update_values["status"] = target_status

                if "admin_note" in reviews_cols:
                    update_cols.append("admin_note = :admin_note")
                    update_values["admin_note"] = note

                if action == "escalate" and "escalated_at" in reviews_cols:
                    update_cols.append("escalated_at = :escalated_at")
                    update_values["escalated_at"] = datetime.utcnow()

                if "updated_at" in reviews_cols:
                    update_cols.append("updated_at = :updated_at")
                    update_values["updated_at"] = datetime.utcnow()

                if update_cols:
                    sql = f"UPDATE reviews SET {', '.join(update_cols)} WHERE id = :id"
                    db.session.execute(text(sql), update_values)
                    db.session.commit()
                    print(f"🛟 [OVERSIGHT] SAFE-FINALIZATION applied for Review #{review_id}")
                    return True, "Governance Protocol Finalized (Safe Mode)."

                return False, f"Atomic Transaction Failure: {str(e)}"
            except Exception as safe_err:
                db.session.rollback()
                print(f"💥 [OVERSIGHT] SAFE-FINALIZATION FAILED Review #{review_id}: {safe_err}")
                return False, f"Atomic Transaction Failure: {str(e)} | Safe mode failed: {safe_err}"

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
