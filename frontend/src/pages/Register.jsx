import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
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

const Check = () => (
  <svg viewBox="0 0 24 24" width="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
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

  const strength = Object.values(rules).filter(Boolean).length;

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"][strength];
  const strengthColor = ["", "#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match. Please try again.");
      return;
    }
    if (strength < 5) {
      setError("Please meet all password requirements to continue.");
      return;
    }

    setLoading(true);
    try {
      await registerUser({ full_name: fullName, email, password, role: "patient" });
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("Registration failed. That email might already be in use.");
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
              Your health,<br />
              <span>in safe hands.</span>
            </h2>
            <p>
              Join thousands of patients managing their neurological health 
              with NeuroNest. Secure, fast, and designed around you.
            </p>

            <div className="auth-trust-badges">
              <div className="trust-badge">
                <div className="trust-badge-dot" />
                Free to Join
              </div>
              <div className="trust-badge">
                <div className="trust-badge-dot" />
                HIPAA Compliant
              </div>
              <div className="trust-badge">
                <div className="trust-badge-dot" />
                Instant Access
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
              <h1 className="auth-title">Create account</h1>
              <p className="auth-subtitle">Join NeuroNest — it's free</p>
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

            <form onSubmit={handleSubmit} className="premium-form">

              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="reg-name">Full Name</label>
                <input
                  id="reg-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr. Jane Smith"
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
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div className="form-group">
                <label htmlFor="reg-password">
                  Password
                  {password && (
                    <span style={{ marginLeft: '8px', fontSize: '0.7rem', color: strengthColor, fontWeight: 700 }}>
                      — {strengthLabel}
                    </span>
                  )}
                </label>

                <div className="password-wrapper">
                  <input
                    id="reg-password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    required
                    autoComplete="new-password"
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

                {/* Strength bar */}
                <div className="strength-bar">
                  <div
                    className="strength-fill"
                    style={{ width: `${(strength / 5) * 100}%`, background: `linear-gradient(to right, #ef4444, ${strengthColor})` }}
                  />
                </div>

                {/* Rules chips */}
                <div className="rules-grid">
                  {[
                    { key: 'length',    label: '8+ chars' },
                    { key: 'uppercase', label: 'Uppercase' },
                    { key: 'lowercase', label: 'Lowercase' },
                    { key: 'number',    label: '0–9' },
                    { key: 'special',   label: '!@#...' },
                  ].map(({ key, label }) => (
                    <span key={key} className={rules[key] ? 'valid' : ''}>
                      {rules[key] && <Check />}
                      {label}
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
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                    autoComplete="new-password"
                    style={{
                      borderColor: confirmPassword && confirmPassword !== password
                        ? 'rgba(239, 68, 68, 0.6)'
                        : confirmPassword && confirmPassword === password
                        ? 'rgba(34, 197, 94, 0.5)'
                        : undefined
                    }}
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    aria-label={showConfirmPw ? "Hide password" : "Show password"}
                  >
                    <Eye open={showConfirmPw} />
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <span style={{ fontSize: '0.78rem', color: '#fca5a5', marginTop: '2px', fontWeight: 500 }}>
                    ✗ Passwords don't match
                  </span>
                )}
                {confirmPassword && confirmPassword === password && (
                  <span style={{ fontSize: '0.78rem', color: '#4ade80', marginTop: '2px', fontWeight: 500 }}>
                    ✓ Passwords match
                  </span>
                )}
              </div>

              <button type="submit" className="premium-btn" disabled={loading}>
                {loading && <span className="btn-spinner" />}
                {loading ? "Creating account..." : "Create Free Account"}
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
