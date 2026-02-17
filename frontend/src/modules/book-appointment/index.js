import { CalendarPlus } from 'lucide-react';
import BookAppointment from '../../pages/patient/BookAppointment';

const bookAppointmentModule = {
  key: 'bookAppointment',
  label: 'Book Appointment',
  icon: CalendarPlus,
  route: '/book',
  rolesAllowed: ['patient'],
  enabledByDefault: true,
  componentsByRole: {
    patient: BookAppointment,
  },
  orderByRole: { patient: 30 },
};

export default bookAppointmentModule;
