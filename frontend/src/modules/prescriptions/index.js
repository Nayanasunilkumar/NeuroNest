import { Pill } from 'lucide-react';
import Prescriptions from '../../pages/patient/Prescriptions';

const prescriptionsModule = {
  key: 'prescriptions',
  label: 'Prescriptions',
  icon: Pill,
  route: '/prescriptions',
  rolesAllowed: ['patient'],
  enabledByDefault: true,
  componentsByRole: {
    patient: Prescriptions,
  },
  orderByRole: { patient: 60 },
};

export default prescriptionsModule;
