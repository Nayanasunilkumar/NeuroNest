import dashboardModule from './dashboard';
import profileModule from './profile';
import bookAppointmentModule from './book-appointment';
import myAppointmentsModule from './my-appointments';
import medicalRecordsModule from './medical-records';
import prescriptionsModule from './prescriptions';
import assessmentModule from './assessment';
import progressTrackerModule from './progress-tracker';
import feedbackReviewsModule from './feedback-reviews';
import adminManagePatientsModule from './admin-manage-patients';
import adminManageDoctorsModule from './admin-manage-doctors';
import adminAppointmentManagementModule from './admin-appointment-management';
import adminAssessmentManagementModule from './admin-assessment-management';
import adminReportsAnalyticsModule from './admin-reports-analytics';
import adminPaymentManagementModule from './admin-payment-management';
import adminReviewManagementModule from './admin-review-management';
import adminNotificationsModule from './admin-notifications';
import adminAnnouncementsModule from './admin-announcements';
import appointmentRequestsModule from './appointment-requests';
import todayScheduleModule from './today-schedule';
import myPatientsModule from './my-patients';
import patientRecordsModule from './patient-records';
import writePrescriptionModule from './write-prescription';
import assessmentReportsModule from './assessment-reports';
import performanceAnalyticsModule from './performance-analytics';
import alertsModule from './alerts';
import patientChatModule from './patient-chat';
import patientTimelineModule from './patient-timeline';
import clinicalArchivesModule from './clinical-archives';
import settingsModule from './settings';

export const ROLE_BASE_PATH = {
  patient: '/patient',
  doctor: '/doctor',
  admin: '/admin',
  super_admin: '/super-admin',
};

export const moduleRegistry = [
  dashboardModule,
  profileModule,
  bookAppointmentModule,
  myAppointmentsModule,
  medicalRecordsModule,
  prescriptionsModule,
  assessmentModule,
  progressTrackerModule,
  feedbackReviewsModule,
  adminManagePatientsModule,
  adminManageDoctorsModule,
  adminAppointmentManagementModule,
  adminAssessmentManagementModule,
  adminReportsAnalyticsModule,
  adminPaymentManagementModule,
  adminReviewManagementModule,
  adminNotificationsModule,
  adminAnnouncementsModule,
  appointmentRequestsModule,
  todayScheduleModule,
  myPatientsModule,
  patientRecordsModule,
  writePrescriptionModule,
  assessmentReportsModule,
  performanceAnalyticsModule,
  alertsModule,
  patientChatModule,
  patientTimelineModule,
  clinicalArchivesModule,
  settingsModule,
];

const byOrderForRole = (role) => (a, b) => {
  const aOrder = a.orderByRole?.[role] ?? 999;
  const bOrder = b.orderByRole?.[role] ?? 999;
  return aOrder - bOrder;
};

export const getModuleRouteForRole = (moduleConfig, role) => {
  return moduleConfig.routeByRole?.[role] || moduleConfig.route;
};

export const getModulePathForRole = (moduleConfig, role) => {
  const base = ROLE_BASE_PATH[role] || '';
  const route = getModuleRouteForRole(moduleConfig, role);
  if (!route.startsWith('/')) {
    return `${base}/${route}`;
  }
  return `${base}${route}`;
};

export const getModuleChildRouteForRole = (moduleConfig, role) => {
  const route = getModuleRouteForRole(moduleConfig, role);
  return route.replace(/^\//, '');
};

export const isModuleEnabled = (moduleConfig, enabledMap = {}) => {
  if (Object.prototype.hasOwnProperty.call(enabledMap, moduleConfig.key)) {
    return Boolean(enabledMap[moduleConfig.key]);
  }
  return Boolean(moduleConfig.enabledByDefault);
};

export const isModuleVisibleInSidebar = (moduleConfig, role) => {
  if (!moduleConfig.rolesAllowed.includes(role)) return false;

  if (Array.isArray(moduleConfig.showInSidebarByRole)) {
    return moduleConfig.showInSidebarByRole.includes(role);
  }

  return true;
};

export const getModulesForRole = (role, options = {}) => {
  const { enabledMap = {}, sidebarOnly = false } = options;

  return moduleRegistry
    .filter((mod) => mod.rolesAllowed.includes(role))
    .filter((mod) => Boolean(mod.componentsByRole?.[role]))
    .filter((mod) => isModuleEnabled(mod, enabledMap))
    .filter((mod) => (sidebarOnly ? isModuleVisibleInSidebar(mod, role) : true))
    .sort(byOrderForRole(role));
};

export const getModuleByPathname = (pathname) => {
  return moduleRegistry.find((mod) => {
    return mod.rolesAllowed.some((role) => getModulePathForRole(mod, role) === pathname);
  });
};

export const getModuleComponentForRole = (moduleConfig, role) => {
  return moduleConfig.componentsByRole?.[role] || null;
};
