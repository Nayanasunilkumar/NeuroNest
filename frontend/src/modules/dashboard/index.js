import { LayoutDashboard } from 'lucide-react';
import DashboardHome from '../../pages/patient/DashboardHome';
import DoctorDashboard from '../../pages/doctor/DoctorDashboard';
import AdminDashboard from '../../pages/admin/AdminDashboard';

const dashboardModule = {
  key: 'dashboard',
  label: 'Dashboard',
  icon: LayoutDashboard,
  route: '/dashboard',
  rolesAllowed: ['patient', 'doctor', 'admin'],
  group: 'Clinical',
  enabledByDefault: true,
  componentsByRole: {
    patient: DashboardHome,
    doctor: DoctorDashboard,
    admin: AdminDashboard,
  },
  orderByRole: { patient: 10, doctor: 10, admin: 10 },
};

export default dashboardModule;
