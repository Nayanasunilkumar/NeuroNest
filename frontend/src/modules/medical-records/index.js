import { Files } from 'lucide-react';
import MedicalRecords from '../../pages/patient/MedicalRecords';

const medicalRecordsModule = {
  key: 'medicalRecords',
  label: 'Medical Records',
  icon: Files,
  route: '/medical-records',
  rolesAllowed: ['patient'],
  enabledByDefault: true,
  componentsByRole: {
    patient: MedicalRecords,
  },
  orderByRole: { patient: 50 },
};

export default medicalRecordsModule;
