from app import app
from database.models import db
from models.system_settings import SystemSetting

def seed_default_settings():
    defaults = [
        # General Settings
        {"key": "platform_name", "value": "NeuroNest", "type": "string", "group": "general"},
        {"key": "support_email", "value": "support@neuronest.com", "type": "email", "group": "general"},
        {"key": "contact_number", "value": "+1-800-NEURO-01", "type": "string", "group": "general"},
        {"key": "maintenance_mode", "value": "false", "type": "boolean", "group": "general"},
        {"key": "default_timezone", "value": "UTC", "type": "string", "group": "general"},
        {"key": "default_language", "value": "en-US", "type": "string", "group": "general"},
        
        # Appointment Settings
        {"key": "default_session_duration", "value": "30", "type": "integer", "group": "appointments"},
        {"key": "buffer_time", "value": "15", "type": "integer", "group": "appointments"},
        {"key": "cancellation_policy_hours", "value": "24", "type": "integer", "group": "appointments"},
        {"key": "auto_approve_appointments", "value": "false", "type": "boolean", "group": "appointments"},
        {"key": "max_daily_appointments_per_doctor", "value": "20", "type": "integer", "group": "appointments"},
        
        # Payment Settings
        {"key": "platform_commission_percentage", "value": "15", "type": "integer", "group": "payments"},
        {"key": "enable_payment_gateway", "value": "true", "type": "boolean", "group": "payments"},
        {"key": "tax_percentage", "value": "5", "type": "integer", "group": "payments"},
        {"key": "auto_settlement", "value": "true", "type": "boolean", "group": "payments"},
        {"key": "refund_window_days", "value": "7", "type": "integer", "group": "payments"},
        
        # Notification Settings
        {"key": "enable_email_notifications", "value": "true", "type": "boolean", "group": "notifications"},
        {"key": "enable_in_app_notifications", "value": "true", "type": "boolean", "group": "notifications"},
        {"key": "enable_sms_notifications", "value": "false", "type": "boolean", "group": "notifications"},
        {"key": "critical_alert_escalation", "value": "true", "type": "boolean", "group": "notifications"},
        
        # Security Settings
        {"key": "password_min_length", "value": "12", "type": "integer", "group": "security"},
        {"key": "force_strong_password", "value": "true", "type": "boolean", "group": "security"},
        {"key": "enable_2fa", "value": "false", "type": "boolean", "group": "security"},
        {"key": "session_timeout_minutes", "value": "60", "type": "integer", "group": "security"},
        {"key": "account_lockout_attempts", "value": "5", "type": "integer", "group": "security"},
        
        # Data & Backup Settings
        {"key": "enable_automated_backups", "value": "true", "type": "boolean", "group": "backup"},
        {"key": "backup_frequency", "value": "daily", "type": "string", "group": "backup"},
        {"key": "data_retention_days", "value": "365", "type": "integer", "group": "backup"},
    ]

    with app.app_context():
        # Create table
        db.create_all()
        
        added = 0
        for item in defaults:
            existing = SystemSetting.query.filter_by(setting_key=item["key"]).first()
            if not existing:
                new_setting = SystemSetting(
                    setting_key=item["key"],
                    setting_value=item["value"],
                    setting_type=item["type"],
                    setting_group=item["group"]
                )
                db.session.add(new_setting)
                added += 1
        
        if added > 0:
            db.session.commit()
            print(f"Added {added} default system settings.")
        else:
            print("Settings already exist. No new seeds added.")

if __name__ == "__main__":
    print("Setting up System Settings table...")
    seed_default_settings()
    print("Done!")
