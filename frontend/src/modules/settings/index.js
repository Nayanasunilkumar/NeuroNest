import { Settings } from 'lucide-react';
import ModuleComingSoon from '../../pages/shared/ModuleComingSoon';

const SettingsPage = () =>
  ModuleComingSoon({
    title: 'Settings',
    description: 'Settings module is prepared for server-driven access controls.',
  });

const settingsModule = {
  key: 'settings',
  label: 'Settings',
  icon: Settings,
  route: '/settings',
  rolesAllowed: ['doctor', 'patient', 'admin'],
  enabledByDefault: true,
  componentsByRole: {
    doctor: SettingsPage,
    patient: SettingsPage,
    admin: SettingsPage,
  },
  orderByRole: { doctor: 110, patient: 90, admin: 120 },
};

export default settingsModule;
