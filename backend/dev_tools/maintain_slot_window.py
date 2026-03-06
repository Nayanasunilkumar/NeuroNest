import argparse

from app import app
from database.models import db
from utils.slot_engine import maintain_rolling_window


def main():
    parser = argparse.ArgumentParser(description="Maintain rolling slot window for doctors.")
    parser.add_argument("--days", type=int, default=14, help="Rolling window size in days (default: 14)")
    parser.add_argument("--doctor-id", type=int, default=None, help="Optional doctor user id scope")
    args = parser.parse_args()

    with app.app_context():
        summary = maintain_rolling_window(days=args.days, doctor_user_id=args.doctor_id)
        db.session.commit()
        print("Slot maintenance completed")
        print(summary)


if __name__ == "__main__":
    main()
