import DoctorProfileView from '../../pages/patient/DoctorProfileView';

const patientDoctorProfileModule = {
  key: 'patientDoctorProfile',
  label: 'Doctor Profile',
  route: '/doctor/:doctorId',
  rolesAllowed: ['patient'],
  enabledByDefault: true,
  componentsByRole: {
    patient: DoctorProfileView,
  },
  showInSidebarByRole: [],
  orderByRole: { patient: 999 },
};

export default patientDoctorProfileModule;
