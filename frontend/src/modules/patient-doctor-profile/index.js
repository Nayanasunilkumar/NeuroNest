import DoctorProfileViewPage from './DoctorProfileViewPage';

const patientDoctorProfileModule = {
  key: 'patientDoctorProfile',
  label: 'Doctor Profile',
  route: '/doctor/:doctorId',
  rolesAllowed: ['patient'],
  enabledByDefault: true,
  componentsByRole: {
    patient: DoctorProfileViewPage,
  },
  showInSidebarByRole: [],
  orderByRole: { patient: 999 },
};

export default patientDoctorProfileModule;
