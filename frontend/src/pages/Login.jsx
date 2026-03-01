import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/auth";
import { saveAuth } from "../utils/auth";
import "../styles/auth.css";

const EyeIcon = ({ open }) =>
  open ? (
    <svg viewBox="0 0 24 24" width="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

/* Star rating component */
const Stars = ({ count = 5 }) => (
  <div className="stars-row">
    {Array.from({ length: count }).map((_, i) => (
      <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

/* Animated neural network canvas */
const NeuralCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let W, H;

    const resize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const NODES = 45;
    const nodes = Array.from({ length: NODES }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32,
      r: Math.random() * 2.4 + 1,
      pulse: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        n.pulse += 0.022;
      });

      // draw edges
      for (let i = 0; i < NODES; i++) {
        for (let j = i + 1; j < NODES; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.16;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(139,92,246,${alpha})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      }

      // draw nodes
      nodes.forEach((n) => {
        const pulse = (Math.sin(n.pulse) + 1) / 2;
        const r = n.r + pulse * 1.4;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167,139,250,${0.22 + pulse * 0.38})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="neural-canvas" />;
};

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState(null);

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
      setError("Invalid credentials. Please verify and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <NeuralCanvas />

      {/* Ambient orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="auth-split">

        {/* ══ LEFT BRAND PANEL ═════════════════════════════ */}
        <div className="auth-brand-panel">
          {/* Top wordmark */}
          <div className="brand-wordmark">
            <span className="wordmark-dot" />
            <span className="wordmark-text">NeuroNest</span>
            <span className="wordmark-tag">Healthcare Platform</span>
          </div>

          {/* Center hero — vertically centered, richer layout */}
          <div className="auth-brand-hero">
            {/* Glow blob behind text */}
            <div className="hero-glow-blob" />

            <div className="tagline-eyebrow">
              <span className="eyebrow-line" />
              Next-Gen Neurology Platform
              <span className="eyebrow-line eyebrow-line-right" />
            </div>

            <h2>
              Healthcare,<br />
              <span className="brand-gradient">Reimagined.</span>
            </h2>

            <p className="hero-desc">
              Connect with top neurologists, manage appointments,
              and access your complete health record — all in one
              secure, HIPAA-compliant platform.
            </p>

            {/* Feature bullet list */}
            <ul className="hero-features">
              <li>
                <span className="feature-check">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                </span>
                Real-time specialist consultations
              </li>
              <li>
                <span className="feature-check">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                </span>
                AI-assisted diagnostic reports
              </li>
              <li>
                <span className="feature-check">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                </span>
                Encrypted health record management
              </li>
            </ul>

            <div className="auth-trust-badges">
              <div className="trust-badge"><div className="trust-badge-dot" />HIPAA Compliant</div>
              <div className="trust-badge"><div className="trust-badge-dot" />End-to-End Encrypted</div>
              <div className="trust-badge"><div className="trust-badge-dot" />99.9% Uptime</div>
            </div>
          </div>

          {/* Stats floating card */}
          <div className="auth-brand-float">
            <div className="float-pulse-ring" />
            <div className="float-icon-wrap">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="float-text">
              <span className="float-label">Appointments today</span>
              <span className="float-value">12 confirmed</span>
            </div>
          </div>

          {/* Vitals strip (bottom) */}
          <div className="vitals-strip">
            <div className="vital-item">
              <span className="vital-num">4,200+</span>
              <span className="vital-lbl">Patients Served</span>
            </div>
            <div className="vital-divider" />
            <div className="vital-item">
              <span className="vital-num">98%</span>
              <span className="vital-lbl">Satisfaction Rate</span>
            </div>
            <div className="vital-divider" />
            <div className="vital-item">
              <span className="vital-num">120+</span>
              <span className="vital-lbl">Specialists</span>
            </div>
          </div>

          <div className="auth-brand-grid" />
        </div>

        {/* ══ RIGHT FORM PANEL ══════════════════════════════ */}
        <div className="auth-form-panel">

          {/* Social proof strip — above card */}
          <div className="social-proof-strip">
            <div className="proof-avatars">
              {["#7c3aed","#0e7490","#059669","#d97706"].map((c, i) => (
                <span key={i} className="proof-avatar" style={{ background: c, zIndex: 4 - i }} />
              ))}
            </div>
            <div className="proof-text">
              <Stars />
              <span><strong>4.9</strong> · Trusted by <strong>4,200+</strong> patients</span>
            </div>
            <div className="proof-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              HIPAA
            </div>
          </div>

          <div className="auth-card">
            {/* Holo border sweep */}
            <div className="holo-sweep" />

            <div className="auth-card-header">
              <div className="auth-badge-ring">
                <div className="auth-badge-pulse" />
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,1)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <h1 className="auth-title">Welcome back</h1>
              <p className="auth-subtitle">Sign in to your NeuroNest account</p>
            </div>

            {error && (
              <div className="premium-error">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="premium-form">
              {/* Email */}
              <div className={`form-group ${focused === "email" ? "group-focused" : ""}`}>
                <label htmlFor="login-email">Email Address</label>
                <div className="input-wrap">
                  <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className={`form-group ${focused === "pw" ? "group-focused" : ""}`}>
                <div className="label-row">
                  <label htmlFor="login-pw">Password</label>
                  <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
                </div>
                <div className="input-wrap password-wrapper">
                  <svg className="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  <input
                    id="login-pw"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Your password"
                    required
                    autoComplete="current-password"
                    onFocus={() => setFocused("pw")}
                    onBlur={() => setFocused(null)}
                  />
                  <button type="button" className="eye-btn" onClick={() => setShowPw(!showPw)} aria-label="Toggle password visibility">
                    <EyeIcon open={showPw} />
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" className="premium-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="btn-spinner" />
                    Authenticating…
                  </>
                ) : (
                  <>
                    Sign In
                    <svg className="btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>

              {/* Encryption microcopy */}
              <div className="encryption-note">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Your medical data is protected with end-to-end encryption
              </div>
            </form>

            <div className="auth-divider">
              <span />
              <p>New to NeuroNest?</p>
              <span />
            </div>

            <div className="auth-footer">
              <Link to="/register" className="auth-register-btn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
                Create a free account
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
