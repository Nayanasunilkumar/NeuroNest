import { createContext } from 'react';

export const ModuleConfigContext = createContext({
  enabledMap: {},
  loading: false,
  refreshModuleConfig: async () => {},
});
