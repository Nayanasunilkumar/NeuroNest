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
        <div className="glass-ultra-container">
            <div className="glass-flex-center">
                
                <div className="glass-shadow-wrapper">
                    
                    {/* The main cutout glass pane */}
                    <div className="glass-main-card">
                        <h1 className="glass-title">Neuro<br/><span className="glass-title-accent">Nest</span></h1>

                        <div className="glass-body">
                            {error && <div className="glass-error-msg">{error}</div>}
                            
                            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }} className="w-100">
                                <div className="glass-input-wrapper">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="Email Address"
                                        required
                                        className="glass-input"
                                    />
                                </div>
                                <div className="glass-input-wrapper mb-2">
                                    <input
                                        type={showPw ? "text" : "password"}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Password"
                                        required
                                        className="glass-input"
                                    />
                                    <button type="button" className="glass-eye-btn" onClick={() => setShowPw(!showPw)}>
                                        <EyeIcon open={showPw} />
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="glass-footer">
                            <Link to="/forgot-password" className="glass-link opacity-75 fw-normal">Forgot Password?</Link>
                            <span className="mt-1">
                                Don't have an account? <Link to="/register" className="glass-link">Register</Link>
                            </span>
                        </div>
                    </div>

                    {/* The small pill nested in the cutout */}
                    <button className="glass-pill-button" onClick={handleSubmit} disabled={loading}>
                        {loading ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                        ) : (
                            "ENTER"
                        )}
                    </button>

                </div>

            </div>
        </div>
    );
};

export default Login;
