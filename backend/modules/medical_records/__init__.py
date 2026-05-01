from routes.medical_records import medical_records_bp


def register(app):
    app.register_blueprint(medical_records_bp)
