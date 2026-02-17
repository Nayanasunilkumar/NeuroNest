import { CalendarCheck2 } from 'lucide-react';
import MyAppointments from '../../pages/patient/MyAppointments';

const myAppointmentsModule = {
  key: 'myAppointments',
  label: 'My Appointments',
  icon: CalendarCheck2,
  route: '/appointments',
  rolesAllowed: ['patient'],
  enabledByDefault: true,
  componentsByRole: {
    patient: MyAppointments,
  },
  orderByRole: { patient: 40 },
};

export default myAppointmentsModule;
