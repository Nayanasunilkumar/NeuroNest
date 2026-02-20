import { CalendarDays } from 'lucide-react';
import ManageAppointments from '../../pages/admin/ManageAppointments';

const adminAppointmentManagementModule = {
  key: 'adminAppointmentManagement',
  label: 'Appointments',
  icon: CalendarDays,
  route: '/appointment-management',
  rolesAllowed: ['admin'],
  group: 'Clinical',
  enabledByDefault: true,
  componentsByRole: {
    admin: ManageAppointments,
  },
  orderByRole: { admin: 40 },
};

export default adminAppointmentManagementModule;
