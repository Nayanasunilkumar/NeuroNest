import { BrowserRouter } from "react-router-dom";

import { AlertProvider } from "../context/AlertContext";
import { CallProvider } from "../context/CallContext";
import { ModuleConfigProvider } from "../context/ModuleConfigContext";
import { SystemConfigProvider } from "../context/SystemConfigContext";
import { ThemeProvider } from "../context/ThemeContext";


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
