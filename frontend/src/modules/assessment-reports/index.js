import { Brain } from 'lucide-react';
import ModuleComingSoon from '../../pages/shared/ModuleComingSoon';

const AssessmentReportsPage = () =>
  ModuleComingSoon({
    title: 'Assessment Reports',
    description: 'Assessment reporting workflows are scaffolded and ready for release.',
  });

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
