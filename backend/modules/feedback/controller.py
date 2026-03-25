from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from database.models import db
import os
from .service import FeedbackService

class FeedbackController:
    @staticmethod
    def marker():
        review_cols = FeedbackService._get_table_columns("reviews")
        escalation_cols = FeedbackService._get_table_columns("review_escalations")
        moderation_cols = FeedbackService._get_table_columns("review_moderation_logs")

        return jsonify({
            "marker": "feedback-marker-2026-03-25-r2",
            "service": "feedback",
            "commit": os.getenv("RENDER_GIT_COMMIT") or os.getenv("GIT_COMMIT") or "unknown",
            "request_host": request.host,
            "has_reviews_status": "status" in review_cols,
            "has_reviews_admin_note": "admin_note" in review_cols,
            "has_review_escalations_severity": "severity_level" in escalation_cols,
            "has_review_escalations_category": "category" in escalation_cols,
            "has_moderation_doctor_id": "doctor_id" in moderation_cols,
            "has_moderation_patient_id": "patient_id" in moderation_cols,
        }), 200

    @staticmethod
    def list_reviews():
        # Handle optional filters from query params
        filters = {
            'rating': request.args.get('rating', type=int),
            'doctor_id': request.args.get('doctor_id', type=int),
            'is_flagged': request.args.get('is_flagged', type=lambda x: x.lower() == 'true'),
            'sentiment': request.args.get('sentiment')
        }
        # Clean up None values
        filters = {k: v for k, v in filters.items() if v is not None}
        
        reviews = FeedbackService.get_all_reviews(filters)
        return jsonify([r.to_dict() for r in reviews]), 200

    @staticmethod
    def get_review(review_id):
        review = FeedbackService.get_review_by_id(review_id)
        if not review:
            return jsonify({"error": "Review not found"}), 404
        return jsonify(review.to_dict()), 200

    @staticmethod
    def post_review():
        data = request.json
        review, error = FeedbackService.submit_review(data)
        if error:
            return jsonify({"error": error}), 400
        return jsonify(review.to_dict()), 201

    @staticmethod
    @jwt_required()
    def moderate(review_id):
        from database.models import User
        import traceback
        
        try:
            # Identity is str(user.id) from auth.py login
            identity = get_jwt_identity()
            admin_id = int(identity) if identity else None
            
            user = User.query.get(admin_id)
            if not user or user.role not in ['admin', 'super_admin']:
                return jsonify({"error": "Unauthorized Governance Access"}), 403
                
            data = request.json
            success, message = FeedbackService.moderate_review(review_id, admin_id, data)
            if not success:
                return jsonify({"error": message}), 400
            return jsonify({"message": message}), 200
        except Exception as e:
            print(f"Governance Safe-Fallback Activated: {str(e)}")
            try:
                db.session.rollback()
                return jsonify({
                    "error": f"Governance moderation failed safely: {str(e)}",
                    "hint": "Primary action may be retried; secondary audit tables might be schema-misaligned."
                }), 500
            except Exception:
                traceback.print_exc()
                return jsonify({
                    "error": f"Critical Failure: {str(e)}",
                    "hint": "Institutional audit database might be temporarily locked."
                }), 500

    @staticmethod
    def get_stats():
        stats = FeedbackService.get_quality_stats()
        return jsonify(stats), 200

    @staticmethod
    def get_my_reviews():
        patient_id = request.args.get('patient_id', type=int)
        if not patient_id: return jsonify({"error": "patient_id required"}), 400
        return jsonify(FeedbackService.get_patient_reviews(patient_id)), 200

    @staticmethod
    def edit_my_review(review_id):
        data = request.json or {}
        patient_id = data.get('patient_id')
        if not patient_id: return jsonify({"error": "patient_id required"}), 400
        ok, msg = FeedbackService.edit_patient_review(review_id, patient_id, data)
        if not ok: return jsonify({"error": msg}), 400
        return jsonify({"message": msg}), 200

    @staticmethod
    def get_my_complaints():
        patient_id = request.args.get('patient_id', type=int)
        if not patient_id: return jsonify({"error": "patient_id required"}), 400
        return jsonify(FeedbackService.get_patient_complaints(patient_id)), 200

    @staticmethod
    def get_doctor_summary():
        doctor_id = request.args.get('doctor_id', type=int)
        if not doctor_id: return jsonify({"error": "Doctor ID required"}), 400
        return jsonify(FeedbackService.get_doctor_feedback_summary(doctor_id)), 200

    @staticmethod
    def get_doctor_distribution():
        doctor_id = request.args.get('doctor_id', type=int)
        if not doctor_id: return jsonify({"error": "Doctor ID required"}), 400
        return jsonify(FeedbackService.get_doctor_rating_distribution(doctor_id)), 200

    @staticmethod
    def get_doctor_trend():
        doctor_id = request.args.get('doctor_id', type=int)
        if not doctor_id: return jsonify({"error": "Doctor ID required"}), 400
        return jsonify(FeedbackService.get_doctor_performance_trend(doctor_id)), 200

    @staticmethod
    def get_doctor_tags():
        doctor_id = request.args.get('doctor_id', type=int)
        if not doctor_id: return jsonify({"error": "Doctor ID required"}), 400
        return jsonify(FeedbackService.get_doctor_tag_analytics(doctor_id)), 200

    @staticmethod
    def get_doctor_reviews():
        doctor_id = request.args.get('doctor_id', type=int)
        if not doctor_id: return jsonify({"error": "Doctor ID required"}), 400
        return jsonify(FeedbackService.get_doctor_reviews_list(doctor_id)), 200
