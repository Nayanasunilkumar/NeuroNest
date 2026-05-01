import { Pill } from 'lucide-react';
import PrescriptionsPage from './PrescriptionsPage';

const prescriptionsModule = {
  key: 'prescriptions',
  label: 'Prescriptions',
  icon: Pill,
  route: '/prescriptions',
  rolesAllowed: ['patient'],
  enabledByDefault: true,
  componentsByRole: {
    patient: PrescriptionsPage,
  },
  orderByRole: { patient: 60 },
};

export default prescriptionsModule;
