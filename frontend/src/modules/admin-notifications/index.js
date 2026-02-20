import { Bell } from 'lucide-react';
import ModuleComingSoon from '../../pages/shared/ModuleComingSoon';

const AdminNotificationsPage = () =>
  ModuleComingSoon({
    title: 'Notifications',
    description: 'Notification templates, delivery queues, and channel controls are prepared.',
  });

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
