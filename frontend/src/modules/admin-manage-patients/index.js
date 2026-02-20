import { Users } from 'lucide-react';
import ManagePatients from '../../pages/admin/ManagePatients';

const adminManagePatientsModule = {
  key: 'adminManagePatients',
  label: 'Patients',
  icon: Users,
  route: '/manage-patients',
  rolesAllowed: ['admin'],
  group: 'Clinical',
  enabledByDefault: true,
  componentsByRole: {
    admin: ManagePatients,
  },
  orderByRole: { admin: 20 },
};

export default adminManagePatientsModule;
