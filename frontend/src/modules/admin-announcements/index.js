import { Megaphone } from 'lucide-react';
import ModuleComingSoon from '../../pages/shared/ModuleComingSoon';

const AdminAnnouncementsPage = () =>
  ModuleComingSoon({
    title: 'Announcements',
    description: 'Organization-wide communication publishing workflows are ready for rollout.',
  });

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
