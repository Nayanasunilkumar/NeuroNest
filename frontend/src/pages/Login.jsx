import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../shared/services/api/axios";
import { useSystemConfig } from "../shared/context/SystemConfigContext";
import "../shared/styles/auth.css";

const EyeIcon = ({ open }) =>
  open ? (
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
  const { platformName } = useSystemConfig();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking'); 
  const [warmupSeconds, setWarmupSeconds] = useState(0);
  const warmupIntervalRef = useRef(null);

  useEffect(() => {
    let checkCount = 0;
    const checkServer = async () => {
      try {
        const res = await axios.get('/api/health', { timeout: 30000 });
        if (res.status === 200) {
          setServerStatus('online');
        }
      } catch {
        setServerStatus('warming-up');
      }
    };
    checkServer();
    const interval = setInterval(() => {
      if (serverStatus !== 'online' && checkCount < 15) {
        checkCount++;
        checkServer();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [serverStatus]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setWarmupSeconds(0);

    const formEmail = email.trim().toLowerCase();
    const maxRetries = 3;
    let attempt = 0;

    const timerId = setTimeout(() => {
      warmupIntervalRef.current = setInterval(() => {
        setWarmupSeconds(prev => prev + 1);
      }, 1000);
    }, 4000);

    while (attempt < maxRetries) {
      try {
        const response = await axios.post('/api/auth/login', {
          email: formEmail,
          password,
        }, {
          timeout: 55000 
        });

        clearTimeout(timerId);
        if (warmupIntervalRef.current) clearInterval(warmupIntervalRef.current);

        const { token, user } = response.data;
        localStorage.setItem('neuronest_token', token);
        localStorage.setItem('neuronest_user', JSON.stringify(user));

        if (user.role === 'admin') navigate('/admin/dashboard');
        else if (user.role === 'doctor') {
            if (user.must_change_password) {
                navigate("/doctor/settings", { state: { initialTab: "account", forcePasswordChange: true } });
            } else {
                navigate('/doctor/dashboard');
            }
        }
        else navigate('/patient/dashboard');
        
        return; 
      } catch (err) {
        attempt++;
        const isNetworkError = !err.response;
        const isTimeout = err.code === 'ECONNABORTED';
        const isServerWarming = isNetworkError || isTimeout || (err.response && err.response.status >= 500);

        if (isServerWarming && attempt < maxRetries) {
          const waitTime = attempt * 2000;
          setError(`Server is warming up... Retrying (Attempt ${attempt}/${maxRetries}) in ${waitTime/1000}s...`);
          await new Promise(r => setTimeout(r, waitTime));
          continue;
        }

        clearTimeout(timerId);
        if (warmupIntervalRef.current) clearInterval(warmupIntervalRef.current);
        setWarmupSeconds(0);

        let msg = "Unable to sign in.";
        if (err.response) {
          msg = err.response.data?.message || `Error ${err.response.status}: Login failed.`;
        } else if (isTimeout) {
          msg = "Connection timed out. The server is still warming up. Please try again.";
        } else {
          msg = "Network error. Please check your connection or verify the server is online.";
        }
        
        setError(msg);
        break;
      }
    }
    setLoading(false);
  };

  return (
    <div className="nn-auth-container">
      <div className="nn-auth-orb nn-auth-orb-1" />
      <div className="nn-auth-orb nn-auth-orb-2" />

      <div className="nn-auth-card">
        <header className="nn-auth-header">
          <div className="nn-auth-logo-wrap">
            <div className="nn-auth-logo-dot" />
            <h1 className="nn-auth-title">{platformName || "NeuroNest"}</h1>
          </div>
          <p className="nn-auth-subtitle">Sign in to your account</p>
        </header>

        {(serverStatus === 'warming-up' || loading) && !error && (
            <div className="nn-auth-info">
                <div className="spinner-border spinner-border-sm" role="status" />
                <div style={{ lineHeight: '1.4' }}>
                    <strong>First visit today?</strong> Hang tight — the server is waking up. This usually takes about 30 seconds on the free tier.
                </div>
            </div>
        )}

        {error && (
          <div className="nn-auth-error">
            <svg viewBox="0 0 24 24" width="16" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="nn-auth-form" autoComplete="off">
          <div className="nn-auth-field">
            <label className="nn-auth-label">Email Address</label>
            <input
              type="email"
              name="neuronest-login-email"
              className="nn-auth-input"
              placeholder="name@company.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoFocus
              autoComplete="off"
            />
          </div>

          <div className="nn-auth-field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="nn-auth-label">Password</label>
              <Link to="/forgot-password" size="small" className="nn-auth-forgot">
                Forgot password?
              </Link>
            </div>
            <div className="nn-auth-input-wrap">
              <input
                type={showPw ? "text" : "password"}
                name="neuronest-login-password"
                className="nn-auth-input"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="nn-auth-eye"
                onClick={() => setShowPw(!showPw)}
              >
                <EyeIcon open={showPw} />
              </button>
            </div>
          </div>

          <button type="submit" className="nn-auth-btn" disabled={loading}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="spinner-border spinner-border-sm" />
                {warmupSeconds > 0 ? `Connecting (${warmupSeconds}s)...` : "Signing In..."}
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <footer className="nn-auth-footer">
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <svg viewBox="0 0 24 24" width="14" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            Medical data is encrypted and secure
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
            Don't have an account?{" "}
            <Link to="/register" className="nn-auth-link">
              Create one free
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Login;
