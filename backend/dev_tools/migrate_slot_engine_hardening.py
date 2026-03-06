from app import app
from database.models import db
from models.system_settings import SystemSetting
from sqlalchemy import inspect, text


def migrate_slot_engine_hardening():
    with app.app_context():
        # Create new tables (and any missing indexes/constraints supported by SQLAlchemy create_all).
        db.create_all()

        # Backfill/add missing schedule toggle column for existing DBs.
        inspector = inspect(db.engine)
        table_exists = inspector.has_table("doctor_schedule_settings")
        columns = {col["name"] for col in inspector.get_columns("doctor_schedule_settings")} if table_exists else set()
        if table_exists and "accepting_new_bookings" not in columns:
            dialect = db.engine.dialect.name
            if dialect == "postgresql":
                db.session.execute(
                    text(
                        "ALTER TABLE doctor_schedule_settings "
                        "ADD COLUMN accepting_new_bookings BOOLEAN NOT NULL DEFAULT TRUE"
                    )
                )
            else:
                db.session.execute(
                    text(
                        "ALTER TABLE doctor_schedule_settings "
                        "ADD COLUMN accepting_new_bookings BOOLEAN DEFAULT 1"
                    )
                )
            db.session.commit()
            print("Added doctor_schedule_settings.accepting_new_bookings column")
        elif not table_exists:
            print("Table missing: doctor_schedule_settings (created via db.create_all if model is present)")
        else:
            print("Column exists: doctor_schedule_settings.accepting_new_bookings")

        key = "patient_cancel_cutoff_minutes"
        existing = SystemSetting.query.filter_by(setting_key=key).first()
        if not existing:
            db.session.add(
                SystemSetting(
                    setting_key=key,
                    setting_value="60",
                    setting_type="integer",
                    setting_group="appointments",
                )
            )
            db.session.commit()
            print(f"Added default setting: {key}=60")
        else:
            print(f"Setting already exists: {key}={existing.setting_value}")

        print("Slot engine hardening migration complete.")


if __name__ == "__main__":
    migrate_slot_engine_hardening()
