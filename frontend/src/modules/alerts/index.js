import { Bell } from 'lucide-react';
import AlertsDashboard from '../../pages/shared/AlertsDashboard';

const alertsModule = {
  key: 'alerts',
  label: 'Alerts',
  icon: Bell,
  route: '/alerts',
  rolesAllowed: ['doctor', 'patient'],
  enabledByDefault: true,
  componentsByRole: {
    doctor: AlertsDashboard,
    patient: AlertsDashboard,
  },
  showInSidebarByRole: ['patient', 'doctor'],
  orderByRole: { doctor: 90, patient: 80 },
};

export default alertsModule;
