from sqlalchemy import inspect, text

from app import app
from database.models import db


def _add_column_if_missing(table_name, column_name, ddl_sql):
    inspector = inspect(db.engine)
    columns = {col["name"] for col in inspector.get_columns(table_name)} if inspector.has_table(table_name) else set()
    if column_name in columns:
        print(f"Column exists: {table_name}.{column_name}")
        return
    db.session.execute(text(ddl_sql))
    db.session.commit()
    print(f"Added column: {table_name}.{column_name}")


def migrate_medical_records_module():
    with app.app_context():
        db.create_all()

        # Existing table evolution for medical_records.
        _add_column_if_missing("medical_records", "file_type", "ALTER TABLE medical_records ADD COLUMN file_type VARCHAR(50)")
        _add_column_if_missing("medical_records", "file_size_bytes", "ALTER TABLE medical_records ADD COLUMN file_size_bytes BIGINT")
        _add_column_if_missing("medical_records", "hospital_name", "ALTER TABLE medical_records ADD COLUMN hospital_name VARCHAR(200)")
        _add_column_if_missing("medical_records", "notes", "ALTER TABLE medical_records ADD COLUMN notes TEXT")
        _add_column_if_missing(
            "medical_records",
            "status",
            "ALTER TABLE medical_records ADD COLUMN status VARCHAR(30) NOT NULL DEFAULT 'active'",
        )
        _add_column_if_missing("medical_records", "uploaded_by", "ALTER TABLE medical_records ADD COLUMN uploaded_by INTEGER")
        _add_column_if_missing(
            "patient_conditions",
            "under_treatment",
            "ALTER TABLE patient_conditions ADD COLUMN under_treatment BOOLEAN NOT NULL DEFAULT TRUE",
        )
        _add_column_if_missing(
            "patient_medications",
            "status",
            "ALTER TABLE patient_medications ADD COLUMN status VARCHAR(30) NOT NULL DEFAULT 'active'",
        )
        _add_column_if_missing(
            "patient_allergies",
            "created_by_user_id",
            "ALTER TABLE patient_allergies ADD COLUMN created_by_user_id INTEGER",
        )
        _add_column_if_missing(
            "patient_allergies",
            "created_by_role",
            "ALTER TABLE patient_allergies ADD COLUMN created_by_role VARCHAR(20) NOT NULL DEFAULT 'patient'",
        )
        _add_column_if_missing(
            "patient_conditions",
            "created_by_user_id",
            "ALTER TABLE patient_conditions ADD COLUMN created_by_user_id INTEGER",
        )
        _add_column_if_missing(
            "patient_conditions",
            "created_by_role",
            "ALTER TABLE patient_conditions ADD COLUMN created_by_role VARCHAR(20) NOT NULL DEFAULT 'patient'",
        )
        _add_column_if_missing(
            "patient_medications",
            "created_by_user_id",
            "ALTER TABLE patient_medications ADD COLUMN created_by_user_id INTEGER",
        )
        _add_column_if_missing(
            "patient_medications",
            "created_by_role",
            "ALTER TABLE patient_medications ADD COLUMN created_by_role VARCHAR(20) NOT NULL DEFAULT 'patient'",
        )
        _add_column_if_missing(
            "patient_medications",
            "medication_origin",
            "ALTER TABLE patient_medications ADD COLUMN medication_origin VARCHAR(30) NOT NULL DEFAULT 'past_external'",
        )
        _add_column_if_missing(
            "patient_medications",
            "source_hospital_name",
            "ALTER TABLE patient_medications ADD COLUMN source_hospital_name VARCHAR(200)",
        )

        # FK constraint for uploaded_by (safe try).
        try:
            db.session.execute(
                text(
                    "ALTER TABLE medical_records "
                    "ADD CONSTRAINT fk_medical_records_uploaded_by_users "
                    "FOREIGN KEY (uploaded_by) REFERENCES users(id)"
                )
            )
            db.session.commit()
            print("Added FK: medical_records.uploaded_by -> users.id")
        except Exception:
            db.session.rollback()
            print("FK exists or cannot be added now: medical_records.uploaded_by")

        print("Medical records module migration complete.")


if __name__ == "__main__":
    migrate_medical_records_module()
