import { Calendar } from 'lucide-react';
import PatientTimelinePage from '../../pages/doctor/PatientTimeline';

const patientTimelineModule = {
  key: 'patientTimeline',
  label: 'Clinical Timeline',
  icon: Calendar,
  route: '/patient-timeline',
  rolesAllowed: ['doctor'],
  enabledByDefault: true,
  showInSidebarByRole: [], // Hide from main sidebar
  componentsByRole: {
    doctor: PatientTimelinePage,
  },
  orderByRole: { doctor: 100 },
};

export default patientTimelineModule;
