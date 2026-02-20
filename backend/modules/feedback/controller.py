from flask import jsonify, request
from .service import FeedbackService

class FeedbackController:
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
    def moderate(review_id):
        data = request.json
        admin_id = data.get('admin_id') # In real app, get from auth token/session
        if not admin_id:
            return jsonify({"error": "Unauthorized"}), 401
            
        success, message = FeedbackService.moderate_review(review_id, admin_id, data)
        if not success:
            return jsonify({"error": message}), 400
        return jsonify({"message": message}), 200

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
