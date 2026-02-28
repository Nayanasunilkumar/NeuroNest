import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/auth";
import { saveAuth } from "../utils/auth";
import "../styles/auth.css";

const Eye = ({ open }) => open ? (
  <svg viewBox="0 0 24 24" width="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
) : (
  <svg viewBox="0 0 24 24" width="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      const response = await loginUser({ email, password });
      const { token, user } = response.data;
      saveAuth(token, user);
      if (user.role === "patient")         navigate("/patient/dashboard");
      else if (user.role === "doctor")     navigate("/doctor/dashboard");
      else if (user.role === "admin")      navigate("/admin/dashboard");
      else if (user.role === "super_admin") navigate("/super-admin/dashboard");
    } catch (err) {
      console.error(err.response?.data || err);
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split">

        {/* ── LEFT: Brand Panel ── */}
        <div className="auth-brand-panel">
          <div className="auth-brand-logo">
            <div className="auth-brand-icon">🧠</div>
            <span className="auth-brand-name">NeuroNest</span>
          </div>

          <div className="auth-brand-tagline">
            <h2>
              Healthcare,<br />
              <span>Reimagined.</span>
            </h2>
            <p>
              Connect with top neurologists, manage appointments, 
              and access your complete medical history — all in one secure place.
            </p>

            <div className="auth-trust-badges">
              <div className="trust-badge">
                <div className="trust-badge-dot" />
                HIPAA Compliant
              </div>
              <div className="trust-badge">
                <div className="trust-badge-dot" />
                End-to-End Encrypted
              </div>
              <div className="trust-badge">
                <div className="trust-badge-dot" />
                99.9% Uptime
              </div>
            </div>
          </div>

          <div className="auth-brand-grid" />
        </div>

        {/* ── RIGHT: Form Panel ── */}
        <div className="auth-form-panel">
          <div className="auth-card">

            {/* Header */}
            <div className="auth-card-header">
              <div className="auth-logo-badge">🧠</div>
              <h1 className="auth-title">Welcome back</h1>
              <p className="auth-subtitle">Sign in to your NeuroNest account</p>
            </div>

            {/* Error */}
            {error && (
              <div className="premium-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="premium-form">

              <div className="form-group">
                <label htmlFor="login-email">Email address</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <div className="password-wrapper">
                  <input
                    id="login-password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPw(!showPw)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    <Eye open={showPw} />
                  </button>
                </div>
              </div>

              <button type="submit" className="premium-btn" disabled={loading}>
                {loading && <span className="btn-spinner" />}
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="auth-footer">
              Don&rsquo;t have an account?{" "}
              <Link to="/register" className="auth-link">Create one free</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
