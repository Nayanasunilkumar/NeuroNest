import { CalendarDays } from 'lucide-react';
import AdminAppointmentManagementPage from './AdminAppointmentManagementPage';

const adminAppointmentManagementModule = {
  key: 'adminAppointmentManagement',
  label: 'Appointments',
  icon: CalendarDays,
  route: '/appointment-management',
  rolesAllowed: ['admin'],
  group: 'Clinical',
  enabledByDefault: true,
  componentsByRole: {
    admin: AdminAppointmentManagementPage,
  },
  orderByRole: { admin: 40 },
};

export default adminAppointmentManagementModule;
