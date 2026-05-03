from modules.admin import register as register_admin
from modules.patient import register as register_patient
from modules.doctor import register as register_doctor
from modules.shared import register as register_shared


FEATURE_MODULES = [
    register_shared,
    register_admin,
    register_patient,
    register_doctor,
]


def register_feature_modules(app):
    for register in FEATURE_MODULES:
        register(app)
