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
        <div className="login-v8-container">
            <div className="login-v8-wrapper">
                
                {/* Accent Triangle (Light Blue) */}
                <div className="login-v8-accent-cyan-wrap">
                    <div className="login-v8-accent-cyan"></div>
                </div>
                
                {/* Dark Blue Triangle (Background) */}
                <div className="login-v8-bg-dark-wrap">
                    <div className="login-v8-bg-dark">
                        <div className="login-v8-enter-btn" onClick={handleSubmit}>
                            {loading ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                            ) : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                    <span>ENTER</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Main White Triangle */}
                <div className="login-v8-fg-wrap">
                    <div className="login-v8-fg-white">
                        
                        {/* Decorative Corner Ticks */}
                        <div className="login-v8-tick tl"></div>
                        <div className="login-v8-tick bl"></div>

                        <div className="login-v8-content">
                            <div className="login-v8-header">
                                <h2>LOG INTO<br/>SYSTEM</h2>
                                <div className="login-v8-divider"></div>
                            </div>

                            {error && <div className="login-v8-error">{error}</div>}

                            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="login-v8-form">
                                <div className="login-v8-input-group">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="LOGIN..."
                                        required
                                        className="login-v8-input"
                                    />
                                </div>
                                <div className="login-v8-input-group">
                                    <input
                                        type={showPw ? "text" : "password"}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="PASSWORD..."
                                        required
                                        className="login-v8-input pw-input"
                                    />
                                    <button type="button" className="login-v8-eye" onClick={() => setShowPw(!showPw)}>
                                        <EyeIcon open={showPw} />
                                    </button>
                                </div>

                                <div className="login-v8-actions">
                                    <Link to="/forgot-password" className="login-v8-forgot">FORGOT PASSWORD?</Link>
                                </div>
                                <div className="mt-4 pb-2">
                                    <Link to="/register" className="login-v8-register-link">Create Account</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;
