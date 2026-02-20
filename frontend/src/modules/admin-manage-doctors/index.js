import { Stethoscope } from 'lucide-react';
import ManageDoctors from '../../pages/admin/ManageDoctors';

const adminManageDoctorsModule = {
  key: 'adminManageDoctors',
  label: 'Doctors',
  icon: Stethoscope,
  route: '/manage-doctors',
  rolesAllowed: ['admin'],
  group: 'Clinical',
  enabledByDefault: true,
  componentsByRole: {
    admin: ManageDoctors,
  },
  orderByRole: { admin: 30 },
};

export default adminManageDoctorsModule;
