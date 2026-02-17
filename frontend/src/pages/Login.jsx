import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/auth";
import "../styles/auth.css";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const response = await loginUser({
        email,
        password,
      });

      const { token, user } = response.data;

      // ✅ FIXED: Store using SAME key as axios interceptor
      localStorage.setItem("neuronest_token", token);
      localStorage.setItem("neuronest_user", JSON.stringify(user));

      // ✅ Redirect by role
      if (user.role === "patient") {
        navigate("/patient/dashboard");
      } else if (user.role === "doctor") {
        navigate("/doctor/dashboard");
      } else if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "super_admin") {
        navigate("/super-admin/dashboard");
      }
    } catch (err) {
      console.error(err.response?.data || err);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = () => (
    <svg viewBox="0 0 24 24" width="18">
      <path
        fill="currentColor"
        d="M12 6c-5 0-8.7 4.1-10 6 1.3 1.9 5 6 10 6 5 0 8.7-4.1 10-6-1.3-1.9-5-6-10-6zm0 10a4 4 0 110-8 4 4 0 010 8z"
      />
    </svg>
  );

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">NeuroNest</h1>
        <p className="auth-subtitle">Secure Login</p>

        {error && <p className="premium-error">{error}</p>}

        <form onSubmit={handleSubmit} className="premium-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                <EyeIcon />
              </button>
            </div>
          </div>

          <button type="submit" className="premium-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-footer">
          Don’t have an account?{" "}
          <Link to="/register" className="auth-link">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
