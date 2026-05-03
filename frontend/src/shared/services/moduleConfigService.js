import api from '../api/axios';

export const fetchModuleConfig = async () => {
  const response = await api.get('/api/modules/config');
  const entries = Array.isArray(response?.data) ? response.data : [];

  // Expected shape: [{ moduleKey: "dashboard", isEnabled: true }]
  return entries.reduce((acc, item) => {
    if (item?.moduleKey) {
      acc[item.moduleKey] = Boolean(item.isEnabled);
    }
    return acc;
  }, {});
};
