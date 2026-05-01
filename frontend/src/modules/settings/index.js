import { Settings } from 'lucide-react';
import AdminSettingsModulePage from './AdminSettingsModulePage';
import DoctorSettingsModulePage from './DoctorSettingsModulePage';
import PatientSettingsModulePage from './PatientSettingsModulePage';

const settingsModule = {
  key: 'settings',
  label: 'Settings',
  icon: Settings,
  route: '/settings',
  rolesAllowed: ['doctor', 'patient', 'admin'],
  group: 'Administration',
  enabledByDefault: true,
  componentsByRole: {
    patient: PatientSettingsModulePage,
    doctor: DoctorSettingsModulePage,
    admin: AdminSettingsModulePage,
  },
  orderByRole: { doctor: 50, patient: 90, admin: 90 },
};

export default settingsModule;
