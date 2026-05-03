import adminAnnouncementsModule from "./admin-announcements";
import adminAppointmentManagementModule from "./admin-appointment-management";
import adminAssessmentManagementModule from "./admin-assessment-management";
import adminGovernanceModule from "./admin-governance";
import adminManageDoctorsModule from "./admin-manage-doctors";
import adminManagePatientsModule from "./admin-manage-patients";
import adminNotificationsModule from "./admin-notifications";
import adminReportsAnalyticsModule from "./admin-reports-analytics";
import adminReviewManagementModule from "./admin-review-management";
import alertsModule from "./alerts";
import appointmentRequestsModule from "./appointment-requests";
import assessmentModule from "./assessment";
import assessmentReportsModule from "./assessment-reports";
import bookAppointmentModule from "./book-appointment";
import clinicalArchivesModule from "./clinical-archives";
import dashboardModule from "./dashboard";
import feedbackReviewsModule from "./feedback-reviews";
import medicalRecordsModule from "./medical-records";
import myAppointmentsModule from "./my-appointments";
import myPatientsModule from "./my-patients";
import patientChatModule from "./patient-chat";
import patientDoctorProfileModule from "./patient-doctor-profile";
import patientRecordsModule from "./patient-records";
import patientTimelineModule from "./patient-timeline";
import performanceAnalyticsModule from "./performance-analytics";
import prescriptionsModule from "./prescriptions";
import profileModule from "./profile";
import settingsModule from "./settings";
import todayScheduleModule from "./today-schedule";
import writePrescriptionModule from "./write-prescription";
import { ROLE_BASE_PATH } from "../shared/constants/roles";

const uniqueModules = (modules) => {
  const seen = new Set();
  return modules.filter((moduleConfig) => {
    if (seen.has(moduleConfig.key)) return false;
    seen.add(moduleConfig.key);
    return true;
  });
};

export const moduleRegistry = uniqueModules([
  dashboardModule,
  profileModule,
  bookAppointmentModule,
  myAppointmentsModule,
  medicalRecordsModule,
  prescriptionsModule,
  patientChatModule,
  assessmentModule,
  alertsModule,
  settingsModule,
  patientDoctorProfileModule,
  todayScheduleModule,
  myPatientsModule,
  appointmentRequestsModule,
  feedbackReviewsModule,
  writePrescriptionModule,
  assessmentReportsModule,
  performanceAnalyticsModule,
  clinicalArchivesModule,
  patientTimelineModule,
  patientRecordsModule,
  adminManagePatientsModule,
  adminManageDoctorsModule,
  adminAppointmentManagementModule,
  adminReviewManagementModule,
  adminReportsAnalyticsModule,
  adminAnnouncementsModule,
  adminGovernanceModule,
  adminAssessmentManagementModule,
  adminNotificationsModule,
]);

export const roleModuleRegistry = {
  admin: moduleRegistry.filter((moduleConfig) => moduleConfig.rolesAllowed.includes("admin")),
  doctor: moduleRegistry.filter((moduleConfig) => moduleConfig.rolesAllowed.includes("doctor")),
  patient: moduleRegistry.filter((moduleConfig) => moduleConfig.rolesAllowed.includes("patient")),
};

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
  const { enabledMap = {}, sidebarOnly = false, user = null } = options;

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
