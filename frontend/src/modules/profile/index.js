import { User } from 'lucide-react';
import PatientProfilePage from './PatientProfilePage';
import DoctorProfilePage from './DoctorProfilePage';

const profileModule = {
  key: 'profile',
  label: 'Profile',
  icon: User,
  route: '/profile',
  rolesAllowed: ['patient', 'doctor'],
  showInSidebarByRole: ['patient', 'doctor'],
  enabledByDefault: true,
  componentsByRole: {
    patient: PatientProfilePage,
    doctor: DoctorProfilePage,
  },
  orderByRole: { patient: 20, doctor: 20 },
};

export default profileModule;
