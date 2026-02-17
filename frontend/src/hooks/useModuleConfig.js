import { useContext } from 'react';
import { ModuleConfigContext } from '../context/moduleConfigContextObject';

export const useModuleConfig = () => useContext(ModuleConfigContext);
