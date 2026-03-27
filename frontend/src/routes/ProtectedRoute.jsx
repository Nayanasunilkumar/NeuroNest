import { Navigate, useLocation } from "react-router-dom";
import { getUser, isAuthenticated } from "../utils/auth";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  // 1️⃣ Not logged in
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const user = getUser();

  // 2️⃣ Logged in but user data missing
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3️⃣ Role not allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  // 4️⃣ Force first-login password reset for doctors
  if (
    user.role === "doctor" &&
    user.must_change_password &&
    location.pathname !== "/doctor/settings"
  ) {
    return (
      <Navigate
        to="/doctor/settings"
        replace
        state={{ initialTab: "account", forcePasswordChange: true }}
      />
    );
  }

  // 4️⃣ Access granted
  return children;
};

export default ProtectedRoute;
