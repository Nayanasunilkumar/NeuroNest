import { Navigate } from 'react-router-dom';
import { useModuleConfig } from '../hooks/useModuleConfig';
import { isModuleEnabled } from '../modules/moduleRegistry';

const ModuleRouteGuard = ({ moduleConfig, role, children }) => {
  const { enabledMap } = useModuleConfig();

  if (!moduleConfig.rolesAllowed.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  if (!isModuleEnabled(moduleConfig, enabledMap)) {
    return <Navigate to="/404" replace />;
  }

  return children;
};

export default ModuleRouteGuard;
