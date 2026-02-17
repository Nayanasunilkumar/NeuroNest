import { CalendarDays } from 'lucide-react';
import TodaySchedule from '../../pages/doctor/TodaySchedule';

const todayScheduleModule = {
  key: 'todaySchedule',
  label: "Today's Schedule",
  icon: CalendarDays,
  route: '/schedule',
  rolesAllowed: ['doctor', 'admin'],
  enabledByDefault: true,
  componentsByRole: {
    doctor: TodaySchedule,
  },
  orderByRole: { doctor: 40, admin: 50 },
};

export default todayScheduleModule;
