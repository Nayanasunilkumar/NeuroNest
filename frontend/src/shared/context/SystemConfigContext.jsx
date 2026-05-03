import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/env";

const DEFAULT_CONFIG = {
  platformName: "NeuroNest",
  contactNumber: "+91-44-4000-0000",
  supportEmail: "support@neuronest.com",
  timezone: "Asia/Kolkata",
  language: "en-IN",
  maintenanceMode: false,
};
const SYSTEM_CONFIG_CACHE_KEY = "neuronest_system_config";

const SystemConfigContext = createContext({
  ...DEFAULT_CONFIG,
  loading: true,
  refreshConfig: async () => {},
});

export const SystemConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(() => {
    try {
      const raw = localStorage.getItem(SYSTEM_CONFIG_CACHE_KEY);
      if (!raw) return DEFAULT_CONFIG;
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_CONFIG;
    }
  });
  const [loading, setLoading] = useState(true);

  const refreshConfig = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/system-config`);
      const nextConfig = {
        platformName: data?.platform_name || DEFAULT_CONFIG.platformName,
        contactNumber: data?.contact_number || DEFAULT_CONFIG.contactNumber,
        supportEmail: data?.support_email || DEFAULT_CONFIG.supportEmail,
        timezone: data?.default_timezone || DEFAULT_CONFIG.timezone,
        language: data?.default_language || DEFAULT_CONFIG.language,
        maintenanceMode: !!data?.maintenance_mode,
      };
      setConfig(nextConfig);
      localStorage.setItem(SYSTEM_CONFIG_CACHE_KEY, JSON.stringify(nextConfig));
    } catch {
      try {
        const token = localStorage.getItem("neuronest_token");
        if (!token) throw new Error("No token for fallback");
        const { data } = await axios.get(`${API_BASE_URL}/api/admin/settings?group=general`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const nextConfig = {
          platformName: data?.platform_name?.value || DEFAULT_CONFIG.platformName,
          contactNumber: data?.contact_number?.value || DEFAULT_CONFIG.contactNumber,
          supportEmail: data?.support_email?.value || DEFAULT_CONFIG.supportEmail,
          timezone: data?.default_timezone?.value || DEFAULT_CONFIG.timezone,
          language: data?.default_language?.value || DEFAULT_CONFIG.language,
          maintenanceMode: String(data?.maintenance_mode?.value || "false").toLowerCase() === "true",
        };
        setConfig(nextConfig);
        localStorage.setItem(SYSTEM_CONFIG_CACHE_KEY, JSON.stringify(nextConfig));
      } catch {
        setConfig((prev) => prev || DEFAULT_CONFIG);
      }
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
    const handleUpdateWithPayload = (e) => {
      const detail = e?.detail;
      if (!detail || typeof detail !== "object") return;
      const merged = {
        ...config,
        ...(detail.platform_name ? { platformName: detail.platform_name } : {}),
        ...(detail.contact_number ? { contactNumber: detail.contact_number } : {}),
        ...(detail.support_email ? { supportEmail: detail.support_email } : {}),
        ...(detail.default_timezone ? { timezone: detail.default_timezone } : {}),
        ...(detail.default_language ? { language: detail.default_language } : {}),
        ...(typeof detail.maintenance_mode !== "undefined"
          ? { maintenanceMode: !!detail.maintenance_mode }
          : {}),
      };
      setConfig(merged);
      localStorage.setItem(SYSTEM_CONFIG_CACHE_KEY, JSON.stringify(merged));
      refreshConfig();
    };
    window.addEventListener("system-config-updated", handleUpdate);
    window.addEventListener("system-config-updated-payload", handleUpdateWithPayload);
    return () => {
      window.removeEventListener("system-config-updated", handleUpdate);
      window.removeEventListener("system-config-updated-payload", handleUpdateWithPayload);
    };
  }, [config, refreshConfig]);

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
