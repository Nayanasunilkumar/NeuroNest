import { CreditCard } from 'lucide-react';
import ModuleComingSoon from '../../pages/shared/ModuleComingSoon';

const AdminPaymentManagementPage = () =>
  ModuleComingSoon({
    title: 'Payments',
    description: 'Billing reconciliation, settlements, and payment exception tools are prepared.',
  });

const adminPaymentManagementModule = {
  key: 'adminPaymentManagement',
  label: 'Payments',
  icon: CreditCard,
  route: '/payment-management',
  rolesAllowed: ['admin'],
  showInSidebarByRole: [], // Hidden from sidebar
  group: 'Operations',
  enabledByDefault: true,
  componentsByRole: {
    admin: AdminPaymentManagementPage,
  },
  orderByRole: { admin: 70 },
};

export default adminPaymentManagementModule;
