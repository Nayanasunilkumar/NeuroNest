import { ClipboardCheck } from 'lucide-react';
import AssessmentPage from './AssessmentPage';

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
