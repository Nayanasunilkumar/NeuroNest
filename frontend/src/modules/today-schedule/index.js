import { CalendarDays } from 'lucide-react';
import TodaySchedulePage from './TodaySchedulePage';

const todayScheduleModule = {
  key: 'todaySchedule',
  label: "Schedule",
  icon: CalendarDays,
  route: '/schedule',
  rolesAllowed: ['doctor', 'admin'],
  enabledByDefault: true,
  componentsByRole: {
    doctor: TodaySchedulePage,
  },
  orderByRole: { doctor: 20, admin: 50 },
};

export default todayScheduleModule;
