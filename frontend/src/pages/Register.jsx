import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
import "../styles/auth.css";

const EyeIcon = ({ open }) => open ? (
  <svg viewBox="0 0 24 24" width="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg viewBox="0 0 24 24" width="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const Register = () => {
  const navigate = useNavigate();

  const [fullName, setFullName]             = useState("");
  const [email, setEmail]                   = useState("");
  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState("");
  const [showPw, setShowPw]                 = useState(false);
  const [showConfirmPw, setShowConfirmPw]   = useState(false);

  const rules = {
    length:    password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number:    /[0-9]/.test(password),
    special:   /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const strength = Object.values(rules).filter(Boolean).length;

  const strengthMeta = [
    null,
    { label: "Weak",      color: "#ef4444" },
    { label: "Fair",      color: "#f97316" },
    { label: "Good",      color: "#eab308" },
    { label: "Strong",    color: "#22c55e" },
    { label: "Very Strong", color: "#10b981" },
  ][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (strength < 5) {
      setError("Please meet all password requirements.");
      return;
    }
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

  const passwordsMatch = confirmPassword && confirmPassword === password;
  const passwordsMismatch = confirmPassword && confirmPassword !== password;

  return (
    <div className="auth-page">
      <div className="auth-split">

        {/* ══ LEFT BRAND PANEL ══════════════════════════════ */}
        <div className="auth-brand-panel">
          <div className="auth-brand-logo">
            <div className="auth-brand-icon">🧠</div>
            <span className="auth-brand-name">NeuroNest</span>
          </div>

          <div className="auth-brand-tagline">
            <h2>
              Your health,<br />
              <span className="brand-gradient">in safe hands.</span>
            </h2>
            <p>
              Join thousands of patients managing their neurological care 
              with NeuroNest. Secure, fast, and built around you.
            </p>
            <div className="auth-trust-badges">
              <div className="trust-badge"><div className="trust-badge-dot" />Free to Join</div>
              <div className="trust-badge"><div className="trust-badge-dot" />HIPAA Compliant</div>
              <div className="trust-badge"><div className="trust-badge-dot" />Instant Access</div>
            </div>
          </div>

          {/* Floating decorative card */}
          <div className="auth-brand-float">
            <div className="float-icon">🏥</div>
            <div className="float-text">
              <span className="float-label">Active patients</span>
              <span className="float-value">2,400+ registered</span>
            </div>
          </div>

          <div className="auth-brand-grid" />
        </div>

        {/* ══ RIGHT FORM PANEL ══════════════════════════════ */}
        <div className="auth-form-panel">
          <div className="auth-card">

            <div className="auth-card-header">
              <div className="auth-logo-badge">🧠</div>
              <h1 className="auth-title">Create account</h1>
              <p className="auth-subtitle">Join NeuroNest — it's free</p>
            </div>

            {error && (
              <div className="premium-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="premium-form">

              {/* Full Name */}
              <div className="form-group">
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
              <div className="form-group">
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
              <div className="form-group">
                <label htmlFor="reg-pw">
                  Password
                  {password && strengthMeta && (
                    <span style={{
                      marginLeft: '8px',
                      fontSize: '0.68rem',
                      color: strengthMeta.color,
                      fontWeight: 800,
                      textTransform: 'none',
                      letterSpacing: 0
                    }}>
                      — {strengthMeta.label}
                    </span>
                  )}
                </label>
                <div className="password-wrapper">
                  <input
                    id="reg-pw"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    required
                    autoComplete="new-password"
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPw(!showPw)}>
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
                        background: `linear-gradient(to right, #ef4444, ${strengthMeta?.color ?? '#ef4444'})`
                      }}
                    />
                  </div>
                )}

                {/* Rule chips */}
                <div className="rules-grid">
                  {[
                    { key: 'length',    label: '8+ chars' },
                    { key: 'uppercase', label: 'A–Z' },
                    { key: 'lowercase', label: 'a–z' },
                    { key: 'number',    label: '0–9' },
                    { key: 'special',   label: '!@#' },
                  ].map(({ key, label }) => (
                    <span key={key} className={rules[key] ? 'valid' : ''}>
                      {rules[key] ? '✓' : ''} {label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label htmlFor="reg-confirm">Confirm Password</label>
                <div className="password-wrapper">
                  <input
                    id="reg-confirm"
                    type={showConfirmPw ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    autoComplete="new-password"
                    style={{
                      borderColor: passwordsMismatch
                        ? 'rgba(239,68,68,0.6)'
                        : passwordsMatch
                        ? 'rgba(34,197,94,0.5)'
                        : undefined
                    }}
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowConfirmPw(!showConfirmPw)}>
                    <EyeIcon open={showConfirmPw} />
                  </button>
                </div>
                {passwordsMismatch && (
                  <span style={{ fontSize:'0.78rem', color:'#fca5a5', fontWeight:600, marginTop:'2px' }}>
                    ✗ Passwords don't match
                  </span>
                )}
                {passwordsMatch && (
                  <span style={{ fontSize:'0.78rem', color:'#4ade80', fontWeight:600, marginTop:'2px' }}>
                    ✓ Passwords match
                  </span>
                )}
              </div>

              <button type="submit" className="premium-btn" disabled={loading}>
                {loading && <span className="btn-spinner" />}
                {loading ? "Creating account…" : "Create Free Account →"}
              </button>
            </form>

            <div className="auth-footer">
              Already have an account?{" "}
              <Link to="/login" className="auth-link">Sign in</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
