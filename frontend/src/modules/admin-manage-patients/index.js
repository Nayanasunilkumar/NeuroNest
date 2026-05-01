import { Users } from 'lucide-react';
import ManagePatientsPage from './ManagePatientsPage';

const adminManagePatientsModule = {
  key: 'adminManagePatients',
  label: 'Patients',
  icon: Users,
  route: '/manage-patients',
  rolesAllowed: ['admin'],
  group: 'Clinical',
  enabledByDefault: true,
  componentsByRole: {
    admin: ManagePatientsPage,
  },
  orderByRole: { admin: 20 },
};

export default adminManagePatientsModule;
