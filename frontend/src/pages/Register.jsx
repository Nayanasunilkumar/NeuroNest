import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
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

const Register = () => {
  const navigate = useNavigate();

  const [fullName, setFullName]               = useState("");
  const [email, setEmail]                     = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState("");
  const [showPw, setShowPw]                   = useState(false);
  const [showConfirmPw, setShowConfirmPw]     = useState(false);

  const rules = {
    length:    password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number:    /[0-9]/.test(password),
    special:   /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  const strength     = Object.values(rules).filter(Boolean).length;
  const strengthMeta = [
    null,
    { label: "Weak",       color: "#ef4444" },
    { label: "Fair",       color: "#f97316" },
    { label: "Good",       color: "#eab308" },
    { label: "Strong",     color: "#22c55e" },
    { label: "Very Strong",color: "#10b981" },
  ][strength];

  const passwordsMatch    = confirmPassword && confirmPassword === password;
  const passwordsMismatch = confirmPassword && confirmPassword !== password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Passwords don't match."); return; }
    if (strength < 5) { setError("Please meet all password requirements."); return; }
    setLoading(true);
    try {
      await registerUser({ full_name: fullName, email, password, role: "patient" });
      navigate("/login");
    } catch {
      setError("Registration failed. That email may already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />
      <div className="bg-glow-card" />

      <div className="auth-center">
        {/* Wordmark */}
        <div className="auth-wordmark">
          <span className="wordmark-dot" />
          <span>NeuroNest</span>
        </div>

        {/* Card */}
        <div className="auth-card">
          <div className="auth-card-top">
            <h1 className="auth-title">Create account</h1>
            <p className="auth-subtitle">Join NeuroNest — it's free</p>
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

            {/* Full Name */}
            <div className="field">
              <label htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Jane Smith"
                required
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div className="field">
              <label htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
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
              <label htmlFor="reg-pw">
                Password
                {password && strengthMeta && (
                  <span className="strength-label" style={{ color: strengthMeta.color }}>
                    {strengthMeta.label}
                  </span>
                )}
              </label>
              <div className="pw-wrap">
                <input
                  id="reg-pw"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  autoComplete="new-password"
                />
                <button type="button" className="eye-btn" onClick={() => setShowPw(!showPw)} aria-label="Toggle password">
                  <EyeIcon open={showPw} />
                </button>
              </div>

              {/* Strength bar */}
              {password && (
                <div className="strength-bar">
                  <div
                    className="strength-fill"
                    style={{
                      width: `${(strength / 5) * 100}%`,
                      background: `linear-gradient(to right, #ef4444, ${strengthMeta?.color ?? "#ef4444"})`,
                    }}
                  />
                </div>
              )}

              {/* Rule chips */}
              <div className="rules-grid">
                {[
                  { key: "length",    label: "8+ chars" },
                  { key: "uppercase", label: "A–Z" },
                  { key: "lowercase", label: "a–z" },
                  { key: "number",    label: "0–9" },
                  { key: "special",   label: "!@#" },
                ].map(({ key, label }) => (
                  <span key={key} className={rules[key] ? "rule-chip valid" : "rule-chip"}>
                    {rules[key] ? "✓ " : ""}{label}
                  </span>
                ))}
              </div>
            </div>

            {/* Confirm Password */}
            <div className="field">
              <label htmlFor="reg-confirm">Confirm Password</label>
              <div className="pw-wrap">
                <input
                  id="reg-confirm"
                  type={showConfirmPw ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  autoComplete="new-password"
                  className={passwordsMismatch ? "input-error" : passwordsMatch ? "input-success" : ""}
                />
                <button type="button" className="eye-btn" onClick={() => setShowConfirmPw(!showConfirmPw)} aria-label="Toggle confirm password">
                  <EyeIcon open={showConfirmPw} />
                </button>
              </div>
              {passwordsMismatch && <span className="field-hint hint-error">✗ Passwords don't match</span>}
              {passwordsMatch    && <span className="field-hint hint-success">✓ Passwords match</span>}
            </div>

            <button type="submit" className="sign-in-btn" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : null}
              {loading ? "Creating account…" : "Create Free Account"}
            </button>

            {/* Encryption note */}
            <div className="encrypt-note">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              Your medical data is encrypted and secure
            </div>
          </form>

          <div className="card-divider" style={{ margin: '1.4rem 0 1.1rem' }} />

          <p className="auth-footer-text">
            Already have an account?{" "}
            <Link to="/login" className="auth-link">Sign in</Link>
          </p>

          {/* Trust row — inside card */}
          <div className="card-trust-row" style={{ marginTop: '1.1rem' }}>
            <span className="trust-dot" />Free to Join
            <span className="trust-sep" />
            <span className="trust-dot" />HIPAA Compliant
            <span className="trust-sep" />
            <span className="trust-dot" />Instant Access
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
