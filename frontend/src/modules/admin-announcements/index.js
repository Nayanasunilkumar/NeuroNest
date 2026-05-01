import { Megaphone } from 'lucide-react';
import AdminAnnouncementsPage from './AdminAnnouncementsPage';

const adminAnnouncementsModule = {
  key: 'adminAnnouncements',
  label: 'Announcements',
  icon: Megaphone,
  route: '/announcements',
  rolesAllowed: ['admin'],
  group: 'Administration',
  enabledByDefault: true,
  componentsByRole: {
    admin: AdminAnnouncementsPage,
  },
  orderByRole: { admin: 80 },
};

export default adminAnnouncementsModule;
