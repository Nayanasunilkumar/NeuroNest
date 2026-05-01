def run_startup_migrations():
    from database.models import db

    if db.engine.dialect.name == "sqlite":
        print("[MIGRATION] SQLite detected; skipping ALTER-based compatibility migrations")
        return

    try:
        with db.engine.connect().execution_options(isolation_level="AUTOCOMMIT") as conn:
            conn.execute(db.text(
                "ALTER TABLE appointments ADD COLUMN IF NOT EXISTS "
                "consultation_type VARCHAR(20) DEFAULT 'in_person', "
                "ADD COLUMN IF NOT EXISTS rescheduled_by VARCHAR(20), "
                "ADD COLUMN IF NOT EXISTS old_date_time TIMESTAMP, "
                "ADD COLUMN IF NOT EXISTS new_date_time TIMESTAMP, "
                "ADD COLUMN IF NOT EXISTS reschedule_reason TEXT, "
                "ADD COLUMN IF NOT EXISTS reschedule_status VARCHAR(20), "
                "ADD COLUMN IF NOT EXISTS join_enabled_patient_time TIMESTAMP, "
                "ADD COLUMN IF NOT EXISTS join_enabled_doctor_time TIMESTAMP, "
                "ADD COLUMN IF NOT EXISTS doctor_joined_at TIMESTAMP, "
                "ADD COLUMN IF NOT EXISTS patient_joined_at TIMESTAMP, "
                "ADD COLUMN IF NOT EXISTS call_started_at TIMESTAMP, "
                "ADD COLUMN IF NOT EXISTS call_status VARCHAR(20) DEFAULT 'scheduled', "
                "ADD COLUMN IF NOT EXISTS reminder_30_sent_at TIMESTAMP, "
                "ADD COLUMN IF NOT EXISTS reminder_10_sent_at TIMESTAMP, "
                "ADD COLUMN IF NOT EXISTS popup_shown_at TIMESTAMP, "
                "ADD COLUMN IF NOT EXISTS missed_notified_at TIMESTAMP, "
                "ADD COLUMN IF NOT EXISTS video_room_id VARCHAR(100)"
            ))
            conn.execute(db.text("ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS email_alerts BOOLEAN DEFAULT TRUE"))
            conn.execute(db.text("ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS inapp_alerts BOOLEAN DEFAULT TRUE"))
            conn.execute(db.text("ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS inapp_messages BOOLEAN DEFAULT TRUE"))
            conn.execute(db.text("ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS inapp_announcements BOOLEAN DEFAULT TRUE"))
            conn.execute(db.text("ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS inapp_feedback BOOLEAN DEFAULT TRUE"))
            conn.execute(db.text("ALTER TABLE notification_preferences DROP COLUMN IF EXISTS email_messages"))
            conn.execute(db.text("ALTER TABLE notification_preferences DROP COLUMN IF EXISTS sms_appointments"))
            conn.execute(db.text("ALTER TABLE notification_preferences DROP COLUMN IF EXISTS sms_prescriptions"))
            conn.execute(db.text("ALTER TABLE notification_preferences DROP COLUMN IF EXISTS sms_messages"))
            conn.execute(db.text("ALTER TABLE notification_preferences DROP COLUMN IF EXISTS sms_announcements"))
            conn.execute(db.text("ALTER TABLE notification_preferences DROP COLUMN IF EXISTS allow_doctor_followup"))
            conn.execute(db.text("ALTER TABLE notification_preferences DROP COLUMN IF EXISTS allow_promotions"))
            conn.execute(db.text("ALTER TABLE doctor_notification_settings ADD COLUMN IF NOT EXISTS email_on_alerts BOOLEAN DEFAULT TRUE"))
            conn.execute(db.text("ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS issued_date DATE DEFAULT CURRENT_DATE"))
            conn.execute(db.text("ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE"))
            conn.execute(db.text("UPDATE prescriptions SET issued_date = COALESCE(issued_date, DATE(created_at), CURRENT_DATE)"))
            conn.execute(db.text("UPDATE prescriptions SET is_deleted = COALESCE(is_deleted, FALSE)"))
            conn.execute(db.text("ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS duration_days INTEGER"))
            conn.execute(db.text("ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
            conn.execute(db.text("ALTER TABLE prescription_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP"))
            conn.execute(db.text(
                "UPDATE prescription_items "
                "SET duration_days = CAST(substring(duration FROM '([0-9]+)') AS INTEGER) "
                "WHERE duration_days IS NULL AND substring(duration FROM '([0-9]+)') IS NOT NULL"
            ))
            conn.execute(db.text("UPDATE prescription_items SET created_at = COALESCE(created_at, CURRENT_TIMESTAMP)"))
            conn.execute(db.text("UPDATE prescription_items SET updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP)"))
            conn.execute(db.text("ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE"))

            for column_name, column_type in [
                ("status", "VARCHAR(20) DEFAULT 'Pending'"),
                ("escalation_severity", "VARCHAR(50)"),
                ("audit_category", "VARCHAR(50)"),
                ("admin_note", "TEXT"),
                ("escalated_at", "TIMESTAMP"),
            ]:
                try:
                    conn.execute(db.text(f"ALTER TABLE reviews ADD COLUMN IF NOT EXISTS {column_name} {column_type}"))
                except Exception as column_error:
                    print(f"[MIGRATION] Reviews.{column_name} failed: {column_error}")

            try:
                conn.execute(db.text("ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE"))
            except Exception as column_error:
                print(f"[MIGRATION] Reviews.is_anonymous failed: {column_error}")

            for column_name, column_type in [
                ("severity_level", "VARCHAR(20) DEFAULT 'Standard'"),
                ("category", "VARCHAR(50) DEFAULT 'Quality of Care'"),
                ("resolved_at", "TIMESTAMP"),
            ]:
                try:
                    conn.execute(db.text(f"ALTER TABLE review_escalations ADD COLUMN IF NOT EXISTS {column_name} {column_type}"))
                except Exception as column_error:
                    print(f"[MIGRATION] ReviewEscalations.{column_name} failed: {column_error}")

            for column_name, column_type in [
                ("doctor_id", "INTEGER"),
                ("patient_id", "INTEGER"),
            ]:
                try:
                    conn.execute(db.text(f"ALTER TABLE review_moderation_logs ADD COLUMN IF NOT EXISTS {column_name} {column_type}"))
                except Exception as column_error:
                    print(f"[MIGRATION] ModerationLogs.{column_name} failed: {column_error}")

        print("[MIGRATION] ✓ Governance synchronization cycle complete")
    except Exception as error:
        print(f"[MIGRATION] Warning: {error}")
