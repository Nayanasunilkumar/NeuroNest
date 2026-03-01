import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/auth";
import { saveAuth } from "../utils/auth";
import "../styles/auth.css";

const EyeIcon = ({ open }) =>
  open ? (
    <svg viewBox="0 0 24 24" width="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      const { data } = await loginUser({ email, password });
      saveAuth(data.token, data.user);
      const role = data.user.role;
      if (role === "patient")          navigate("/patient/dashboard");
      else if (role === "doctor")      navigate("/doctor/dashboard");
      else if (role === "admin")       navigate("/admin/dashboard");
      else if (role === "super_admin") navigate("/super-admin/dashboard");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background depth */}
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />
      <div className="bg-glow-card" />

      <div className="auth-center">

        {/* Card */}
        <div className="auth-card">
          <div className="auth-card-top">
            <h1 className="auth-title">
              <span className="wordmark-dot" style={{ width: 11, height: 11 }} />
              NeuroNest
            </h1>
            <p className="auth-subtitle">Sign in to your account</p>
          </div>

          {error && (
            <div className="auth-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Email */}
            <div className="field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="field">
              <div className="field-label-row">
                <label htmlFor="login-pw">Password</label>
                <Link to="/forgot-password" className="forgot-link">Forgot?</Link>
              </div>
              <div className="pw-wrap">
                <input
                  id="login-pw"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="eye-btn" onClick={() => setShowPw(!showPw)} aria-label="Toggle password">
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>

            {/* CTA */}
            <button type="submit" className="sign-in-btn" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : null}
              {loading ? "Signing in…" : "Sign In"}
            </button>

            {/* Encryption note — inside card, right below button */}
            <div className="encrypt-note">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              Your medical data is encrypted and secure
            </div>
          </form>

          {/* Divider */}
          <div className="card-divider" style={{ margin: '1.4rem 0 1.1rem' }} />

          {/* Register link */}
          <p className="auth-footer-text">
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">Create one free</Link>
          </p>

        </div>

      </div>
    </div>
  );
};

export default Login;
