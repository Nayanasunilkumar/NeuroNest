import { Bell } from 'lucide-react';
import ModuleComingSoon from '../../pages/shared/ModuleComingSoon';

const AlertsPage = () =>
  ModuleComingSoon({
    title: 'Alerts',
    description: 'Centralized alerting is wired and can be enabled from configuration.',
  });

const alertsModule = {
  key: 'alerts',
  label: 'Alerts',
  icon: Bell,
  route: '/alerts',
  rolesAllowed: ['doctor', 'patient'],
  enabledByDefault: true,
  componentsByRole: {
    doctor: AlertsPage,
    patient: AlertsPage,
  },
  orderByRole: { doctor: 90, patient: 80 },
};

export default alertsModule;
