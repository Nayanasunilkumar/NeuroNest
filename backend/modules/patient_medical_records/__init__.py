from routes.patient_medical_records import patient_medical_bp


def register(app):
    app.register_blueprint(patient_medical_bp)
