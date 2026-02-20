import { ClipboardCheck } from 'lucide-react';
import ModuleComingSoon from '../../pages/shared/ModuleComingSoon';

const AssessmentPage = () =>
  ModuleComingSoon({
    title: 'Assessment',
    description: 'Patient assessment workflows are prepared for the next rollout phase.',
  });

const assessmentModule = {
  key: 'assessment',
  label: 'Assessment',
  icon: ClipboardCheck,
  route: '/assessment',
  rolesAllowed: ['patient'],
  enabledByDefault: true,
  componentsByRole: {
    patient: AssessmentPage,
  },
  orderByRole: { patient: 75 },
};

export default assessmentModule;
