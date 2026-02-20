import { ClipboardList } from 'lucide-react';
import ModuleComingSoon from '../../pages/shared/ModuleComingSoon';

const AdminAssessmentManagementPage = () =>
  ModuleComingSoon({
    title: 'Assessment Management',
    description: 'Assessment templates, lifecycle, and governance controls are scaffolded.',
  });

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
