import { User } from 'lucide-react';
import PatientProfile from '../../pages/patient/Profile';
import DoctorProfile from '../../pages/doctor/Profile';
import ModuleComingSoon from '../../pages/shared/ModuleComingSoon';

const ProfilePlaceholder = () =>
  ModuleComingSoon({
    title: 'Admin Profile',
    description: 'Admin profile management module.',
  });

const profileModule = {
  key: 'profile',
  label: 'Profile',
  icon: User,
  route: '/profile',
  rolesAllowed: ['patient', 'doctor', 'admin'],
  enabledByDefault: true,
  componentsByRole: {
    patient: PatientProfile,
    doctor: DoctorProfile,
    admin: ProfilePlaceholder,
  },
  orderByRole: { patient: 20, doctor: 20, admin: 20 },
};

export default profileModule;
