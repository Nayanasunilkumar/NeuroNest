import { ShieldAlert } from 'lucide-react';
import GovernanceRouter from './GovernanceRouter';

const adminGovernanceModule = {
  key: 'adminGovernance',
  label: 'Doctor Oversight',
  icon: ShieldAlert,
  route: '/governance/*', // Use wildcard for sub-routes
  rolesAllowed: ['admin', 'super_admin'],
  group: 'Governance',
  enabledByDefault: true,
  componentsByRole: {
    admin: GovernanceRouter,
    super_admin: GovernanceRouter,
  },
  showInSidebarByRole: [], // Not in main sidebar
  orderByRole: { admin: 100, super_admin: 100 },
};

export default adminGovernanceModule;
