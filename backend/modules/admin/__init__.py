from .routes.announcement_routes import admin_announcements_bp
from .routes.dashboard_routes import admin_dashboard_bp
from .routes.governance_routes import governance_bp
from .routes.manage_appointments_routes import admin_appointments_bp
from .routes.manage_doctors_routes import admin_doctors_bp
from .routes.manage_patients_routes import admin_patients_bp
from .routes.reports_routes import admin_reports_bp
from .routes.settings_routes import admin_settings_bp
# We also have announcements.py (public read for users, but admin can manage too?)
# Actually, announcements.py is for ALL users to read their own. 
# But let's keep it in admin if it's managed there, or shared if read by all.

def protect_blueprint(blueprint, role):
    # Mock protect_blueprint if not available yet
    return blueprint

ADMIN_BLUEPRINTS = [
    (admin_dashboard_bp, "/api/admin/dashboard"),
    (admin_patients_bp, "/api/admin/patients"),
    (admin_doctors_bp, "/api/admin/doctors"),
    (admin_appointments_bp, "/api/admin/appointments"),
    (admin_reports_bp, "/api/admin/reports"),
    (admin_settings_bp, "/api/admin/settings"),
    (admin_announcements_bp, "/api/admin/announcements"),
    (governance_bp, "/api/admin/governance"),
]


def register(app):
    for blueprint, url_prefix in ADMIN_BLUEPRINTS:
        app.register_blueprint(
            blueprint, # protect_blueprint(blueprint, "admin"),
            url_prefix=url_prefix,
        )
