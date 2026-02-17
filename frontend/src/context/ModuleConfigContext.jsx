import { useEffect, useMemo, useState } from 'react';
import { fetchModuleConfig } from '../services/moduleConfigService';
import { ModuleConfigContext } from './moduleConfigContextObject';

export const ModuleConfigProvider = ({ children }) => {
  const [enabledMap, setEnabledMap] = useState({});
  const [loading, setLoading] = useState(false);

  const refreshModuleConfig = async () => {
    setLoading(true);
    try {
      const serverMap = await fetchModuleConfig();
      setEnabledMap(serverMap);
    } catch (error) {
      // Fallback to local defaults from registry when API is unavailable.
      console.error('Failed to load module config; falling back to defaults.', error);
      setEnabledMap({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshModuleConfig();
  }, []);

  const value = useMemo(
    () => ({ enabledMap, loading, refreshModuleConfig }),
    [enabledMap, loading],
  );

  return <ModuleConfigContext.Provider value={value}>{children}</ModuleConfigContext.Provider>;
};
