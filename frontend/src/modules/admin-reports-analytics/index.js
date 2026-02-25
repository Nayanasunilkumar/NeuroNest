import { BarChart4 } from 'lucide-react';
import AdminReports from '../../pages/admin/reports/AdminReports';

const adminReportsAnalyticsModule = {
  key: 'adminReportsAnalytics',
  label: 'Reports',
  icon: BarChart4,
  route: '/reports-analytics',
  rolesAllowed: ['admin'],
  group: 'Operations',
  enabledByDefault: true,
  componentsByRole: {
    admin: AdminReports,
  },
  orderByRole: { admin: 60 },
};

export default adminReportsAnalyticsModule;
