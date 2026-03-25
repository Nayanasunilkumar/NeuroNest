import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/env";

const DEFAULT_CONFIG = {
  platformName: "NeuroNest",
  contactNumber: "+91-44-4000-0000",
  supportEmail: "support@neuronest.com",
  timezone: "Asia/Kolkata",
  language: "en-IN",
  maintenanceMode: false,
};

const SystemConfigContext = createContext({
  ...DEFAULT_CONFIG,
  loading: true,
  refreshConfig: async () => {},
});

export const SystemConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  const refreshConfig = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/system-config`);
      setConfig({
        platformName: data?.platform_name || DEFAULT_CONFIG.platformName,
        contactNumber: data?.contact_number || DEFAULT_CONFIG.contactNumber,
        supportEmail: data?.support_email || DEFAULT_CONFIG.supportEmail,
        timezone: data?.default_timezone || DEFAULT_CONFIG.timezone,
        language: data?.default_language || DEFAULT_CONFIG.language,
        maintenanceMode: !!data?.maintenance_mode,
      });
    } catch {
      setConfig(DEFAULT_CONFIG);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshConfig();
  }, [refreshConfig]);

  useEffect(() => {
    document.title = config.platformName || DEFAULT_CONFIG.platformName;
  }, [config.platformName]);

  useEffect(() => {
    const handleUpdate = () => {
      refreshConfig();
    };
    window.addEventListener("system-config-updated", handleUpdate);
    return () => window.removeEventListener("system-config-updated", handleUpdate);
  }, [refreshConfig]);

  const value = useMemo(
    () => ({
      ...config,
      loading,
      refreshConfig,
    }),
    [config, loading, refreshConfig],
  );

  return <SystemConfigContext.Provider value={value}>{children}</SystemConfigContext.Provider>;
};

export const useSystemConfig = () => useContext(SystemConfigContext);

