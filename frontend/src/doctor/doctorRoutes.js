import DoctorDashboard from './pages/DoctorDashboard';
import MyPatients from './pages/MyPatients';
import AppointmentRequests from './pages/AppointmentRequests';
import PatientHub from './pages/PatientHub';
import DoctorChat from './pages/DoctorChat';
import Profile from './pages/Profile';
import ClinicalArchives from './pages/ClinicalArchives';

export const doctorRoutes = [
  { path: 'dashboard', element: DoctorDashboard },
  { path: 'my-patients', element: MyPatients },
  { path: 'requests', element: AppointmentRequests },
  { path: 'patient-hub', element: PatientHub },
  { path: 'chat', element: DoctorChat },
  { path: 'profile', element: Profile },
  { path: 'archives', element: ClinicalArchives },
];
