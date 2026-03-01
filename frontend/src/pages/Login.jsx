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

    const NODES = 38;
    const nodes = Array.from({ length: NODES }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 2.2 + 1,
      pulse: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const t = Date.now() / 1000;

      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        n.pulse += 0.025;
      });

      // draw edges
      for (let i = 0; i < NODES; i++) {
        for (let j = i + 1; j < NODES; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.14;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(139,92,246,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // draw nodes
      nodes.forEach((n) => {
        const pulse = (Math.sin(n.pulse) + 1) / 2;
        const r = n.r + pulse * 1.2;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167,139,250,${0.25 + pulse * 0.35})`;
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

        {/* ══ LEFT BRAND PANEL ══════════════════════════════ */}
        <div className="auth-brand-panel">
          {/* Top corner wordmark */}
          <div className="brand-wordmark">
            <span className="wordmark-dot" />
            <span className="wordmark-text">NeuroNest</span>
          </div>

          <div className="auth-brand-tagline">
            <div className="tagline-eyebrow">
              <span className="eyebrow-line" />
              Next-Gen Neurology Platform
            </div>
            <h2>
              Healthcare,<br />
              <span className="brand-gradient">Reimagined.</span>
            </h2>
            <p>
              Connect with top neurologists, manage appointments,
              and access your complete health record — all in one secure platform.
            </p>

            <div className="auth-trust-badges">
              <div className="trust-badge">
                <div className="trust-badge-dot" />HIPAA Compliant
              </div>
              <div className="trust-badge">
                <div className="trust-badge-dot" />End-to-End Encrypted
              </div>
              <div className="trust-badge">
                <div className="trust-badge-dot" />99.9% Uptime
              </div>
            </div>
          </div>

          {/* Stats floating card */}
          <div className="auth-brand-float">
            <div className="float-pulse-ring" />
            <div className="float-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="float-text">
              <span className="float-label">Appointments today</span>
              <span className="float-value">12 confirmed</span>
            </div>
          </div>

          {/* Live vitals strip */}
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

        {/* ══ RIGHT FORM PANEL ════════════════════════════= */}
        <div className="auth-form-panel">
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

              <div className={`form-group ${focused === "pw" ? "group-focused" : ""}`}>
                <label htmlFor="login-pw">Password</label>
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
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPw(!showPw)}
                    aria-label="Toggle password"
                  >
                    <EyeIcon open={showPw} />
                  </button>
                </div>
              </div>

              <div className="form-meta">
                <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
              </div>

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
            </form>

            <div className="auth-divider">
              <span />
              <p>New to NeuroNest?</p>
              <span />
            </div>

            <div className="auth-footer">
              <Link to="/register" className="auth-register-btn">
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
