import { Users } from 'lucide-react';
import MyPatientsPage from './MyPatientsPage';

const myPatientsModule = {
  key: 'myPatients',
  label: 'Patients',
  icon: Users,
  route: '/patients',
  rolesAllowed: ['doctor', 'admin'],
  enabledByDefault: true,
  componentsByRole: {
    doctor: MyPatientsPage,
  },
  orderByRole: { doctor: 30, admin: 60 },
};

export default myPatientsModule;
