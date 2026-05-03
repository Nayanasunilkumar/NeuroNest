import { BrowserRouter } from "react-router-dom";

import { AlertProvider } from "../shared/context/AlertContext";
import { CallProvider } from "../shared/context/CallContext";
import { ModuleConfigProvider } from "../shared/context/ModuleConfigContext";
import { SystemConfigProvider } from "../shared/context/SystemConfigContext";
import { ThemeProvider } from "../shared/context/ThemeContext";


export default function AppProviders({ children }) {
  return (
    <ModuleConfigProvider>
      <ThemeProvider>
        <SystemConfigProvider>
          <BrowserRouter>
            <AlertProvider>
              <CallProvider>{children}</CallProvider>
            </AlertProvider>
          </BrowserRouter>
        </SystemConfigProvider>
      </ThemeProvider>
    </ModuleConfigProvider>
  );
}
