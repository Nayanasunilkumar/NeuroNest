from flask import Blueprint
from .controller import FeedbackController

feedback_bp = Blueprint('feedback', __name__)

# Admin & Super Admin Routes
@feedback_bp.route('/list', methods=['GET'])
def list_reviews():
    return FeedbackController.list_reviews()

@feedback_bp.route('/<int:review_id>', methods=['GET'])
def get_review(review_id):
    return FeedbackController.get_review(review_id)

@feedback_bp.route('/<int:review_id>/moderate', methods=['POST'])
def moderate_review(review_id):
    return FeedbackController.moderate(review_id)

@feedback_bp.route('/stats', methods=['GET'])
def get_stats():
    return FeedbackController.get_stats()

# Patient Routes
@feedback_bp.route('/submit', methods=['POST'])
def submit_review():
    return FeedbackController.post_review()

# Doctor Specific Routes
@feedback_bp.route('/doctor/summary', methods=['GET'])
def get_dr_summary():
    return FeedbackController.get_doctor_summary()

@feedback_bp.route('/doctor/distribution', methods=['GET'])
def get_dr_dist():
    return FeedbackController.get_doctor_distribution()

@feedback_bp.route('/doctor/trend', methods=['GET'])
def get_dr_trend():
    return FeedbackController.get_doctor_trend()

@feedback_bp.route('/doctor/tags', methods=['GET'])
def get_dr_tags():
    return FeedbackController.get_doctor_tags()

@feedback_bp.route('/doctor/list', methods=['GET'])
def get_dr_reviews():
    return FeedbackController.get_doctor_reviews()

# Patient Specific Routes
@feedback_bp.route('/patient/reviews', methods=['GET'])
def get_my_reviews():
    return FeedbackController.get_my_reviews()

@feedback_bp.route('/patient/review/<int:review_id>', methods=['PUT'])
def edit_my_review(review_id):
    return FeedbackController.edit_my_review(review_id)

@feedback_bp.route('/patient/complaints', methods=['GET'])
def get_my_complaints():
    return FeedbackController.get_my_complaints()
