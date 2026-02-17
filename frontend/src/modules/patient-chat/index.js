import { MessageSquare } from 'lucide-react';
import Chat from '../../pages/patient/Chat';
import DoctorChat from '../../pages/doctor/DoctorChat';

const patientChatModule = {
  key: 'patientChat',
  label: 'Patient Chat',
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
    doctor: DoctorChat,
    patient: Chat,
  },
  orderByRole: { doctor: 100, patient: 70, admin: 110 },
};

export default patientChatModule;
