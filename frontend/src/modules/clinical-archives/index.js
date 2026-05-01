import { Folder } from 'lucide-react';
import ClinicalArchivesPage from './ClinicalArchivesPage';

const clinicalArchivesModule = {
  key: 'clinicalArchives',
  label: 'Clinical Archives',
  icon: Folder,
  route: '/clinical-archives',
  rolesAllowed: ['doctor'],
  enabledByDefault: true,
  showInSidebarByRole: [],
  componentsByRole: {
    doctor: ClinicalArchivesPage,
  },
  orderByRole: { doctor: 101 },
};

export default clinicalArchivesModule;
