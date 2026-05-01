import { Stethoscope } from 'lucide-react';
import ManageDoctorsPage from './ManageDoctorsPage';

const adminManageDoctorsModule = {
  key: 'adminManageDoctors',
  label: 'Doctors',
  icon: Stethoscope,
  route: '/manage-doctors',
  rolesAllowed: ['admin'],
  group: 'Clinical',
  enabledByDefault: true,
  componentsByRole: {
    admin: ManageDoctorsPage,
  },
  orderByRole: { admin: 30 },
};

export default adminManageDoctorsModule;
