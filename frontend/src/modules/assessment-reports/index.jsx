import { Brain } from 'lucide-react';
import AssessmentPage from '../../pages/patient/Assessment';

const assessmentReportsModule = {
  key: 'assessmentReports',
  label: 'Assessment Reports',
  icon: Brain,
  route: '/assessment-reports',
  rolesAllowed: ['doctor'],
  enabledByDefault: true,
  componentsByRole: {
    doctor: AssessmentPage,
  },
  showInSidebarByRole: [],
  orderByRole: { doctor: 70 },
};

export default assessmentReportsModule;
