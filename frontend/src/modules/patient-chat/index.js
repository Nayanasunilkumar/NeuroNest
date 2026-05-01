import { MessageSquare } from 'lucide-react';
import DoctorChatPage from './DoctorChatPage';
import PatientChatPage from './PatientChatPage';

const patientChatModule = {
  key: 'patientChat',
  label: 'Patients Chat',
  icon: MessageSquare,
  route: '/messages',
  routeByRole: {
    doctor: '/chat',
    patient: '/messages',
    admin: '/patient-chat',
  },
  rolesAllowed: ['doctor', 'patient', 'admin'],
  enabledByDefault: true,
  componentsByRole: {
    doctor: DoctorChatPage,
    patient: PatientChatPage,
  },
  showInSidebarByRole: ['doctor', 'patient', 'admin'],
  orderByRole: { doctor: 35, patient: 70, admin: 110 },
};

export default patientChatModule;
