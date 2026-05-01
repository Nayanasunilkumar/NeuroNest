import { Files } from 'lucide-react';
import MedicalRecordsPage from './MedicalRecordsPage';

const medicalRecordsModule = {
  key: 'medicalRecords',
  label: 'Medical Records',
  icon: Files,
  route: '/medical-records',
  rolesAllowed: ['patient', 'doctor'],
  enabledByDefault: true,
  componentsByRole: {
    patient: MedicalRecordsPage,
    doctor: MedicalRecordsPage,
  },
  showInSidebarByRole: ['patient'],
  orderByRole: { patient: 50, doctor: 110 },
};

export default medicalRecordsModule;
