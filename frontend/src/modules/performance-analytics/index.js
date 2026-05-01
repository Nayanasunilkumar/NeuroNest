import { BarChart3 } from 'lucide-react';
import PerformanceAnalyticsPage from './PerformanceAnalyticsPage';

const performanceAnalyticsModule = {
  key: 'performanceAnalytics',
  label: 'Performance Analytics',
  icon: BarChart3,
  route: '/performance-analytics',
  rolesAllowed: ['doctor'],
  enabledByDefault: true,
  componentsByRole: {
    doctor: PerformanceAnalyticsPage,
  },
  showInSidebarByRole: ['doctor'],
  orderByRole: { doctor: 80 },
};

export default performanceAnalyticsModule;
