from routes.admin.governance_routes import governance_bp


def register(app):
    app.register_blueprint(governance_bp, url_prefix="/api/admin/governance")
