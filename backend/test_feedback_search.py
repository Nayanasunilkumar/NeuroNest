import sys
import os
from datetime import datetime

# Setup path to import backend modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from core.app_factory import create_app
from database.models import db, Review, User
from modules.feedback.service import FeedbackService

app = create_app()

with app.app_context():
    print("Testing Feedback Search Logic...")
    
    # Test case 1: Search for 'Mary'
    filters = {'search': 'Mary'}
    reviews = FeedbackService.get_all_reviews(filters)
    print(f"Search 'Mary' found: {len(reviews)} reviews")
    for r in reviews:
        print(f" - ID: {r.id}, Patient: {r.patient.full_name}, Doctor: {r.doctor.full_name}")

    # Test case 2: Search for 'Dow'
    filters = {'search': 'Dow'}
    reviews = FeedbackService.get_all_reviews(filters)
    print(f"Search 'Dow' found: {len(reviews)} reviews")
    for r in reviews:
        print(f" - ID: {r.id}, Patient: {r.patient.full_name}, Doctor: {r.doctor.full_name}")

    # Test case 3: Search for 'wait'
    filters = {'search': 'wait'}
    reviews = FeedbackService.get_all_reviews(filters)
    print(f"Search 'wait' found: {len(reviews)} reviews")
    for r in reviews:
        print(f" - ID: {r.id}, Text: {r.review_text}")
