import { BarChart4 } from 'lucide-react';
import ModuleComingSoon from '../../pages/shared/ModuleComingSoon';

const AdminReportsAnalyticsPage = () =>
  ModuleComingSoon({
    title: 'Reports',
    description: 'Operational reports and organization analytics are ready for enablement.',
  });

const adminReportsAnalyticsModule = {
  key: 'adminReportsAnalytics',
  label: 'Reports',
  icon: BarChart4,
  route: '/reports-analytics',
  rolesAllowed: ['admin'],
  group: 'Operations',
  enabledByDefault: true,
  componentsByRole: {
    admin: AdminReportsAnalyticsPage,
  },
  orderByRole: { admin: 60 },
};

export default adminReportsAnalyticsModule;
