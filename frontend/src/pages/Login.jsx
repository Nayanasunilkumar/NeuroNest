import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../shared/services/api/axios";
import { API_BASE_URL } from "../config/env";
import { useSystemConfig } from "../shared/context/SystemConfigContext";
import "../shared/styles/auth.css";

const EyeIcon = ({ open }) =>
  open ? (
    <svg viewBox="0 0 24 24" width="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  const [serverStatus, setServerStatus] = useState('checking'); // 'checking', 'online', 'warming-up', 'offline'
  const [warmupSeconds, setWarmupSeconds] = useState(0);
  const warmupIntervalRef = useRef(null);

  // Pre-warm the server and check status
  useEffect(() => {
    let checkCount = 0;
    const checkServer = async () => {
      try {
        await axios.get('/api/modules/config', { timeout: 8000 });
        setServerStatus('online');
      } catch (err) {
        if (err.code === 'ECONNABORTED' || !err.response) {
          setServerStatus('warming-up');
        } else {
          setServerStatus('online'); // If we got a response, even a 4xx, it's alive
        }
      }
    };
    checkServer();
    const interval = setInterval(() => {
      if (serverStatus !== 'online' && checkCount < 10) {
        checkCount++;
        checkServer();
      }
    }, 15000);
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

    // Start a visual timer if login takes long
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
          timeout: 55000 // Timeout before Render's 60s limit
        });

        clearTimeout(timerId);
        clearInterval(warmupIntervalRef.current);

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
        clearInterval(warmupIntervalRef.current);
        setWarmupSeconds(0);

        let msg = "Unable to sign in.";
        if (err.response) {
          msg = err.response.data?.message || `Error ${err.response.status}: Login failed.`;
        } else if (isTimeout) {
          msg = "Connection timed out. The server is still warming up. Please wait a few more seconds and try again.";
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
    <div
      className="container-fluid min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{
          background: "radial-gradient(circle at 20% 80%, rgba(120,119,198,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,119,198,0.1) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />

      <div className="nn-auth-card p-4 p-md-5" style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "480px" }}>
        <div className="text-center mb-4">
          <div className="d-flex align-items-center justify-content-center mb-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "40px", height: "40px", backgroundColor: "rgba(99, 102, 241, 0.1)" }}
            >
              <div className="rounded-circle" style={{ width: "10px", height: "10px", backgroundColor: "#6366f1" }} />
            </div>
            <h1 className="h3 mb-0 ms-2 fw-bold" style={{ color: "#1e293b", letterSpacing: "-0.02em" }}>
              {platformName || "NeuroNest"}
            </h1>
          </div>
          <p className="text-uppercase fw-bold mb-0" style={{ fontSize: "12px", color: "#64748b", letterSpacing: "0.05em" }}>
            Sign in to your account
          </p>
        </div>

        {serverStatus === 'warming-up' && !error && (
            <div className="alert alert-info py-2 px-3 mb-4 d-flex align-items-center" style={{ fontSize: '13px', borderRadius: '12px', border: 'none', backgroundColor: '#eff6ff', color: '#1d4ed8' }}>
                <div className="spinner-border spinner-border-sm me-2" role="status" />
                <span>Backend is waking up (Free Tier). Please wait...</span>
            </div>
        )}

        {error && (
          <div className="nn-error-bubble mb-4 d-flex align-items-start">
            <div className="me-2 mt-1">
              <svg viewBox="0 0 24 24" width="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <span style={{ fontSize: "13px", lineHeight: "1.4" }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="d-grid gap-4">
          <div className="nn-input-group">
            <label className="nn-input-label">Email</label>
            <input
              type="email"
              className="nn-input-field"
              placeholder="name@company.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="nn-input-group">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="nn-input-label mb-0">Password</label>
              <Link to="/forgot-password" style={{ fontSize: "12px", fontWeight: "600", color: "#6366f1", textDecoration: "none" }}>
                Forgot password?
              </Link>
            </div>
            <div className="position-relative">
              <input
                type={showPw ? "text" : "password"}
                className="nn-input-field pe-5"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button
                type="button"
                className="position-absolute end-0 top-50 translate-middle-y border-0 bg-transparent px-3 text-muted"
                onClick={() => setShowPw(!showPw)}
                style={{ height: "100%", zIndex: 5 }}
              >
                <EyeIcon open={showPw} />
              </button>
            </div>
          </div>

          <button type="submit" className="nn-btn-primary py-3 fw-bold" disabled={loading} style={{ borderRadius: "12px" }}>
            {loading ? (
              <div className="d-flex align-items-center justify-content-center">
                <span className="spinner-border spinner-border-sm me-2" />
                {warmupSeconds > 0 ? `Connecting... (${warmupSeconds}s)` : "Signing In..."}
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="text-center mt-5">
          <div className="d-flex align-items-center justify-content-center mb-4 text-muted" style={{ fontSize: "12px" }}>
            <svg viewBox="0 0 24 24" width="14" fill="none" stroke="currentColor" strokeWidth="2" className="me-2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            Your medical data is encrypted and secure
          </div>
          <p className="mb-0 text-muted" style={{ fontSize: "13px" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#6366f1", fontWeight: "600", textDecoration: "none" }}>
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
