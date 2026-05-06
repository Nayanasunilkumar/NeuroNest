from modules.admin import register as register_admin
from modules.alerts import register as register_alerts
from modules.doctor import register as register_doctor
from modules.feedback import register as register_feedback
from modules.patient import register as register_patient
from modules.shared import register as register_shared
from modules.vitals import register as register_vitals


FEATURE_MODULES = [
    register_shared,
    register_admin,
    register_patient,
    register_doctor,
    register_feedback,
    register_alerts,
    register_vitals,
]


def register_feature_modules(app):
    for register in FEATURE_MODULES:
        register(app)
