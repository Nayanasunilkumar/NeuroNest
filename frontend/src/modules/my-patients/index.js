import { Users } from 'lucide-react';
import MyPatients from '../../pages/doctor/MyPatients';

const myPatientsModule = {
  key: 'myPatients',
  label: 'My Patients',
  icon: Users,
  route: '/patients',
  rolesAllowed: ['doctor', 'admin'],
  enabledByDefault: true,
  componentsByRole: {
    doctor: MyPatients,
  },
  orderByRole: { doctor: 50, admin: 60 },
};

export default myPatientsModule;
