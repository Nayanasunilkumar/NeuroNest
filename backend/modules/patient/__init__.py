from .routes.patient_medical_records import patient_records_bp
from .routes.patient_settings_routes import patient_settings_bp

def register(app):
    app.register_blueprint(patient_records_bp, url_prefix="/api/patient/records")
    app.register_blueprint(patient_settings_bp, url_prefix="/api/patient/settings")
