import { Navigate, Route, Routes } from "react-router-dom";

import SessionManager from "../shared/components/SessionManager";
import AlertPopup from "../shared/components/AlertPopup";
import AdminLayout from "../layouts/AdminLayout";
import PatientLayout from "../layouts/PatientLayout";
import DoctorLayout from "../layouts/doctor/DoctorLayout";
import PatientHub from "../doctor/pages/PatientHub";
import Forbidden from "../pages/Forbidden";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import Register from "../pages/Register";
import VideoConsultation from "../shared/pages/VideoConsultation";
import { adminRoutes } from "../admin/adminRoutes";
import { patientRoutes } from "../patient/patientRoutes";
import { doctorRoutes } from "../doctor/doctorRoutes";
import ModuleRouteGuard from "../routes/ModuleRouteGuard";
import ProtectedRoute from "../routes/ProtectedRoute";
import {
  getModuleChildRouteForRole,
  getModuleComponentForRole,
  roleModuleRegistry,
} from "../modules/moduleRegistry";


const renderRoleRoutes = (role) => {
  const modules = roleModuleRegistry[role] || [];

  return modules
    .filter((moduleConfig) => moduleConfig.rolesAllowed.includes(role))
    .map((moduleConfig) => {
      const ModuleComponent = getModuleComponentForRole(moduleConfig, role);
      if (!ModuleComponent) return null;

      return (
        <Route
          key={`${role}-${moduleConfig.key}`}
          path={getModuleChildRouteForRole(moduleConfig, role)}
          element={
            <ModuleRouteGuard moduleConfig={moduleConfig} role={role}>
              <ModuleComponent />
            </ModuleRouteGuard>
          }
        />
      );
    })
    .filter(Boolean);
};


export default function AppRouter() {
  return (
    <>
      <AlertPopup />
      <SessionManager />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/403" element={<Forbidden />} />
        <Route path="/404" element={<NotFound />} />

        <Route
          path="/patient"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <PatientLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          {patientRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={<route.element />} />
          ))}
          {renderRoleRoutes("patient")}
        </Route>

        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          {doctorRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={<route.element />} />
          ))}
          {renderRoleRoutes("doctor")}
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          {adminRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={<route.element />} />
          ))}
          {renderRoleRoutes("admin")}
        </Route>

        <Route
          path="/consultation/:roomId"
          element={
            <ProtectedRoute allowedRoles={["patient", "doctor"]}>
              <VideoConsultation />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
