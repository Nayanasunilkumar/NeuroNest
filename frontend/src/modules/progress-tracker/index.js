import { Activity } from 'lucide-react';
import ModuleComingSoon from '../../pages/shared/ModuleComingSoon';

const ProgressTrackerPage = () =>
  ModuleComingSoon({
    title: 'Progress Tracker',
    description: 'Trackers for vitals, recovery goals, and milestones are queued for enablement.',
  });

const progressTrackerModule = {
  key: 'progressTracker',
  label: 'Progress Tracker',
  icon: Activity,
  route: '/progress-tracker',
  rolesAllowed: ['patient'],
  enabledByDefault: true,
  componentsByRole: {
    patient: ProgressTrackerPage,
  },
  orderByRole: { patient: 78 },
};

export default progressTrackerModule;
