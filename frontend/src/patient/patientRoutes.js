import DashboardHome from './pages/DashboardHome';
import MyAppointments from './pages/MyAppointments';
import BookAppointment from './pages/BookAppointment';
import MedicalRecords from './pages/MedicalRecords';
import Prescriptions from './pages/Prescriptions';
import Chat from './pages/Chat';
import Profile from './pages/Profile';

export const patientRoutes = [
  { path: 'dashboard', element: DashboardHome },
  { path: 'appointments', element: MyAppointments },
  { path: 'book-appointment', element: BookAppointment },
  { path: 'medical-records', element: MedicalRecords },
  { path: 'prescriptions', element: Prescriptions },
  { path: 'chat', element: Chat },
  { path: 'profile', element: Profile },
];
