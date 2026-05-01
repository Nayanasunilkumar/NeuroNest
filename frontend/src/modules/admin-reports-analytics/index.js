import { BarChart4 } from 'lucide-react';
import AdminReportsPage from './AdminReportsPage';

const adminReportsAnalyticsModule = {
  key: 'adminReportsAnalytics',
  label: 'Reports',
  icon: BarChart4,
  route: '/reports-analytics',
  rolesAllowed: ['admin'],
  group: 'Operations',
  enabledByDefault: true,
  componentsByRole: {
    admin: AdminReportsPage,
  },
  orderByRole: { admin: 60 },
};

export default adminReportsAnalyticsModule;
