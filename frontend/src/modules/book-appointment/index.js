import { CalendarPlus } from 'lucide-react';
import BookAppointmentPage from './BookAppointmentPage';

const bookAppointmentModule = {
  key: 'bookAppointment',
  label: 'Book Appointment',
  icon: CalendarPlus,
  route: '/book',
  rolesAllowed: ['patient'],
  enabledByDefault: true,
  componentsByRole: {
    patient: BookAppointmentPage,
  },
  orderByRole: { patient: 30 },
};

export default bookAppointmentModule;
