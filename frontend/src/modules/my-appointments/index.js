import { CalendarCheck2 } from 'lucide-react';
import MyAppointmentsPage from './MyAppointmentsPage';

const myAppointmentsModule = {
  key: 'myAppointments',
  label: 'My Appointments',
  icon: CalendarCheck2,
  route: '/appointments',
  rolesAllowed: ['patient'],
  enabledByDefault: true,
  componentsByRole: {
    patient: MyAppointmentsPage,
  },
  orderByRole: { patient: 40 },
};

export default myAppointmentsModule;
