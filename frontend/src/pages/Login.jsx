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

        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Background depth using standard HTML/CSS + Bootstrap bg */}
            <div className="position-absolute top-0 start-0 w-100 h-100 placeholder-wave opacity-25" style={{ background: 'linear-gradient(135deg, rgba(13,110,253,0.05) 0%, rgba(101,44,203,0.05) 100%)', pointerEvents: 'none' }} />
            
            <div className="row w-100 justify-content-center position-relative" style={{ zIndex: 1, maxWidth: '500px' }}>
                <div className="col-12 px-3 px-sm-0">
                    
                    <div className="card border-0 shadow-lg rounded-4 p-4 p-sm-5 bg-white backdrop-blur">
                        <div className="text-center mb-4">
                            <h2 className="fw-bolder text-dark mb-2 d-flex align-items-center justify-content-center gap-2" style={{ letterSpacing: '-0.5px' }}>
                                <div className="rounded-circle shadow-sm" style={{ width: '12px', height: '12px', background: 'linear-gradient(135deg, #0d6efd, #6610f2)' }} />
                                NeuroNest
                            </h2>
                            <p className="text-secondary small fw-medium text-uppercase tracking-wide">Sign in to your account</p>
                        </div>

                        {error && (
                            <div className="alert alert-danger d-flex align-items-center fw-bold small p-3 rounded-3 shadow-sm border-0 mb-4" role="alert">
                                <svg width="16" height="16" className="me-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                            {/* Email */}
                            <div className="form-group mb-2">
                                <label htmlFor="login-email" className="form-label small fw-bold text-secondary text-uppercase" style={{ letterSpacing: '1px' }}>Email</label>
                                <input
                                    id="login-email"
                                    type="email"
                                    className="form-control form-control-lg bg-light border-0 shadow-sm"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    autoComplete="email"
                                    style={{ fontSize: '0.95rem' }}
                                />
                            </div>

                            {/* Password */}
                            <div className="form-group mb-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <label htmlFor="login-pw" className="form-label small fw-bold text-secondary text-uppercase mb-0" style={{ letterSpacing: '1px' }}>Password</label>
                                    <Link to="/forgot-password" className="text-decoration-none fw-bold small text-primary">Forgot?</Link>
                                </div>
                                <div className="input-group shadow-sm bg-light rounded overflow-hidden">
                                    <input
                                        id="login-pw"
                                        type={showPw ? "text" : "password"}
                                        className="form-control form-control-lg bg-light border-0"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        autoComplete="current-password"
                                        style={{ fontSize: '0.95rem' }}
                                    />
                                    <button 
                                        type="button" 
                                        className="btn btn-light border-0 text-secondary px-3" 
                                        onClick={() => setShowPw(!showPw)} 
                                        aria-label="Toggle password"
                                        style={{ backgroundColor: '#f8f9fa' }}
                                    >
                                        <EyeIcon open={showPw} />
                                    </button>
                                </div>
                            </div>

                            {/* CTA */}
                            <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold shadow-sm d-flex justify-content-center align-items-center gap-2 rounded-3" disabled={loading} style={{ background: 'linear-gradient(135deg, #0d6efd, #6610f2)', border: 'none' }}>
                                {loading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />}
                                {loading ? "Signing in…" : "Sign In"}
                            </button>

                            {/* Encryption note */}
                            <div className="d-flex align-items-center justify-content-center mt-2 text-muted fw-bold" style={{ fontSize: '0.75rem' }}>
                                <svg width="12" height="12" className="me-1 opacity-75" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                                </svg>
                                Your medical data is encrypted and secure
                            </div>
                        </form>

                        <hr className="my-4 text-muted opacity-25" />

                        {/* Register link */}
                        <p className="text-center mb-0 fw-medium text-secondary" style={{ fontSize: '0.85rem' }}>
                            Don't have an account?{" "}
                            <Link to="/register" className="text-primary fw-bold text-decoration-none ms-1">Create one free</Link>
                        </p>

                    </div>
                </div>
            </div>
        </div>
};

export default Login;
