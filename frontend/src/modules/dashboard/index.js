import { LayoutDashboard } from 'lucide-react';
import PatientDashboardPage from './PatientDashboardPage';
import DoctorDashboardPage from './DoctorDashboardPage';
import AdminDashboardPage from './AdminDashboardPage';

const dashboardModule = {
  key: 'dashboard',
  label: 'Dashboard',
  icon: LayoutDashboard,
  route: '/dashboard',
  rolesAllowed: ['patient', 'doctor', 'admin'],
  group: 'Clinical',
  enabledByDefault: true,
  componentsByRole: {
    patient: PatientDashboardPage,
    doctor: DoctorDashboardPage,
    admin: AdminDashboardPage,
  },
  orderByRole: { patient: 10, doctor: 10, admin: 10 },
};

export default dashboardModule;
