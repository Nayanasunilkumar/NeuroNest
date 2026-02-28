import { Files } from 'lucide-react';
import MedicalRecords from '../../pages/patient/MedicalRecords';

const medicalRecordsModule = {
  key: 'medicalRecords',
  label: 'Medical Records',
  icon: Files,
  route: '/medical-records',
  rolesAllowed: ['patient', 'doctor'],
  enabledByDefault: true,
  componentsByRole: {
    patient: MedicalRecords,
    doctor: MedicalRecords,
  },
  showInSidebarByRole: ['patient'],
  orderByRole: { patient: 50, doctor: 110 },
};

export default medicalRecordsModule;
