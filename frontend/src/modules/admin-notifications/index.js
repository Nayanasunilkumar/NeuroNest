import { Bell } from 'lucide-react';
import AdminNotificationsPage from './AdminNotificationsPage';

const adminNotificationsModule = {
  key: 'adminNotifications',
  label: 'Notifications',
  icon: Bell,
  route: '/notifications',
  rolesAllowed: [],
  enabledByDefault: true,
  componentsByRole: {
    admin: AdminNotificationsPage,
  },
  orderByRole: { admin: 90 },
};

export default adminNotificationsModule;
