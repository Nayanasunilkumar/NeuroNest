from modules.admin_announcements import register as register_admin_announcements
from modules.admin_appointments import register as register_admin_appointments
from modules.admin_dashboard import register as register_admin_dashboard
from modules.admin_doctors import register as register_admin_doctors
from modules.admin_patients import register as register_admin_patients
from modules.admin_reports import register as register_admin_reports
from modules.admin_settings import register as register_admin_settings
from modules.alerts import register as register_alerts
from modules.announcements import register as register_announcements
from modules.appointments import register as register_appointments
from modules.auth import register as register_auth
from modules.calls import register as register_calls
from modules.chat import register as register_chat
from modules.doctor import register as register_doctor
from modules.doctor_profile import register as register_doctor_profile
from modules.doctor_settings import register as register_doctor_settings
from modules.feedback import register as register_feedback
from modules.governance import register as register_governance
from modules.medical_records import register as register_medical_records
from modules.module_config import register as register_module_config
from modules.patient_medical_records import register as register_patient_medical_records
from modules.patient_settings import register as register_patient_settings
from modules.prescriptions import register as register_prescriptions
from modules.profile import register as register_profile
from modules.rtc import register as register_rtc
from modules.system_config import register as register_system_config
from modules.vitals import register as register_vitals


FEATURE_MODULES = [
    register_auth,
    register_profile,
    register_appointments,
    register_medical_records,
    register_patient_medical_records,
    register_prescriptions,
    register_announcements,
    register_module_config,
    register_vitals,
    register_alerts,
    register_calls,
    register_doctor_profile,
    register_admin_patients,
    register_admin_doctors,
    register_admin_appointments,
    register_chat,
    register_doctor,
    register_feedback,
    register_patient_settings,
    register_doctor_settings,
    register_admin_reports,
    register_admin_settings,
    register_system_config,
    register_admin_dashboard,
    register_admin_announcements,
    register_governance,
    register_rtc,
]


def register_feature_modules(app):
    for register in FEATURE_MODULES:
        register(app)
