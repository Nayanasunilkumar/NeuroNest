import { Settings } from 'lucide-react';
import PatientSettingsPage from '../../pages/patient/settings/PatientSettingsPage';

// Placeholder for doctor/admin settings (future)
const ComingSoon = () => import('../../pages/shared/ModuleComingSoon').then(m => m.default({
  title: 'Settings',
  description: 'Settings module is prepared for server-driven access controls.',
}));

const settingsModule = {
  key: 'settings',
  label: 'Settings',
  icon: Settings,
  route: '/settings',
  rolesAllowed: ['doctor', 'patient', 'admin'],
  group: 'Administration',
  enabledByDefault: true,
  componentsByRole: {
    patient: PatientSettingsPage,
    doctor:  () => null,
    admin:   () => null,
  },
  orderByRole: { doctor: 110, patient: 90, admin: 90 },
};

export default settingsModule;
