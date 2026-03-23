import { ClipboardCheck } from 'lucide-react';
import AssessmentPage from '../../pages/patient/Assessment';

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
  isVisible: (user) => user?.role !== 'patient' || user?.email === 'nezrinnoushad20@gmail.com',
  orderByRole: { patient: 75 },
};

export default assessmentModule;
