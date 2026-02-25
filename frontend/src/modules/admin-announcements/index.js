import { Megaphone } from 'lucide-react';
import AnnouncementsPage from '../../pages/admin/AnnouncementsPage';

const adminAnnouncementsModule = {
  key: 'adminAnnouncements',
  label: 'Announcements',
  icon: Megaphone,
  route: '/announcements',
  rolesAllowed: ['admin'],
  group: 'Administration',
  enabledByDefault: true,
  componentsByRole: {
    admin: AnnouncementsPage,
  },
  orderByRole: { admin: 80 },
};

export default adminAnnouncementsModule;
