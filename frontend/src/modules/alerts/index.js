import { Bell } from 'lucide-react';
import AlertsPage from './AlertsPage';

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
  showInSidebarByRole: ['patient'],
  orderByRole: { doctor: 90, patient: 80 },
};

export default alertsModule;
