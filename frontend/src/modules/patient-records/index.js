import { FileSearch } from 'lucide-react';
import PatientRecordsPage from './PatientRecordsPage';

const patientRecordsModule = {
  key: 'patientRecords',
  label: 'Patient Records',
  icon: FileSearch,
  route: '/patient-records',
  rolesAllowed: ['doctor', 'admin'],
  enabledByDefault: true,
  showInSidebarByRole: ['admin'],
  componentsByRole: {
    doctor: PatientRecordsPage,
  },
  orderByRole: { doctor: 999, admin: 999 },
};

export default patientRecordsModule;
