import adminRoutes from "../admin/adminRoutes";
import doctorRoutes from "../doctor/doctorRoutes";
import patientRoutes from "../patient/patientRoutes";
import { ROLE_BASE_PATH } from "../shared/constants/roles";

const uniqueModules = (modules) => {
  const seen = new Set();
  return modules.filter((moduleConfig) => {
    if (seen.has(moduleConfig.key)) return false;
    seen.add(moduleConfig.key);
    return true;
  });
};

export const roleModuleRegistry = {
  admin: adminRoutes,
  doctor: doctorRoutes,
  patient: patientRoutes,
};

export const moduleRegistry = uniqueModules([
  ...patientRoutes,
  ...doctorRoutes,
  ...adminRoutes,
]);

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
