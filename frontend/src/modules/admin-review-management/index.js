import { Star } from 'lucide-react';
import FeedbackPage from './FeedbackPage';

const adminReviewManagementModule = {
  key: 'adminReviewManagement',
  label: 'Feedback & Reviews',
  icon: Star,
  route: '/review-management',
  rolesAllowed: ['admin', 'super_admin'],
  group: 'Operations',
  enabledByDefault: true,
  componentsByRole: {
    admin: FeedbackPage,
    super_admin: FeedbackPage,
  },
  orderByRole: { admin: 50, super_admin: 50 },
};

export default adminReviewManagementModule;
