import { BarChart3 } from 'lucide-react';
import ModuleComingSoon from '../../pages/shared/ModuleComingSoon';

const PerformanceAnalyticsPage = () =>
  ModuleComingSoon({
    title: 'Performance Analytics',
    description: 'Analytics module is prepared for phased enablement by role.',
  });

const performanceAnalyticsModule = {
  key: 'performanceAnalytics',
  label: 'Performance Analytics',
  icon: BarChart3,
  route: '/performance-analytics',
  rolesAllowed: ['doctor', 'admin'],
  enabledByDefault: false,
  componentsByRole: {
    doctor: PerformanceAnalyticsPage,
    admin: PerformanceAnalyticsPage,
  },
  orderByRole: { doctor: 80, admin: 90 },
};

export default performanceAnalyticsModule;
