import { Brain } from 'lucide-react';
import AssessmentReportsPage from './AssessmentReportsPage';

const assessmentReportsModule = {
  key: 'assessmentReports',
  label: 'Assessment Reports',
  icon: Brain,
  route: '/assessment-reports',
  rolesAllowed: ['doctor'],
  enabledByDefault: true,
  componentsByRole: {
    doctor: AssessmentReportsPage,
  },
  showInSidebarByRole: [],
  orderByRole: { doctor: 70 },
};

export default assessmentReportsModule;
