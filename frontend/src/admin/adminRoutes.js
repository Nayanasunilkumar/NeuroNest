import AdminDashboard from './pages/AdminDashboard';
import ManageDoctors from './pages/ManageDoctors';
import ManagePatients from './pages/ManagePatients';
import ManageAppointments from './pages/ManageAppointments';
import AnnouncementsPage from './pages/AnnouncementsPage';
import AdminReports from './pages/reports/AdminReports';

export const adminRoutes = [
  { path: 'dashboard', element: AdminDashboard },
  { path: 'doctors', element: ManageDoctors },
  { path: 'patients', element: ManagePatients },
  { path: 'appointments', element: ManageAppointments },
  { path: 'announcements', element: AnnouncementsPage },
  { path: 'reports', element: AdminReports },
];
