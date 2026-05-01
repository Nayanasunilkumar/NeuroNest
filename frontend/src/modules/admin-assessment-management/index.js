import { ClipboardList } from 'lucide-react';
import AdminAssessmentManagementPage from './AdminAssessmentManagementPage';

const adminAssessmentManagementModule = {
  key: 'adminAssessmentManagement',
  label: 'Assessment Management',
  icon: ClipboardList,
  route: '/assessment-management',
  rolesAllowed: [],
  enabledByDefault: true,
  componentsByRole: {
    admin: AdminAssessmentManagementPage,
  },
  orderByRole: { admin: 50 },
};

export default adminAssessmentManagementModule;
