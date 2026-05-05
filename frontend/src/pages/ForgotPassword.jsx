import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../shared/services/api/auth";
import { useSystemConfig } from "../shared/context/SystemConfigContext";
import "../shared/styles/auth.css";

const ForgotPassword = () => {
  const { platformName } = useSystemConfig();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const { data } = await forgotPassword({ email: email.trim().lower() });
      setMessage(data.message || "Reset instructions sent to your email.");
    } catch (err) {
      const status = err?.response?.status;
      const detail = err?.response?.data?.message || err?.message;
      setError(`Error (${status || 'Network'}): ${detail || 'Please try again later.'}`);
    } finally {
      setLoading(false);
    }
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
          background:
            "radial-gradient(circle at 20% 80%, rgba(120,119,198,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,119,198,0.1) 0%, transparent 50%)",
          pointerEvents: "none",
        }}
      />

      <div
        className="row w-100 justify-content-center position-relative"
        style={{ zIndex: 1, maxWidth: "420px" }}
      >
        <div className="col-12 px-3 px-sm-0">
          <div
            className="card border-0 rounded-4 p-4 p-sm-5 bg-white shadow-lg"
            style={{ backdropFilter: "blur(10px)" }}
          >
            <div className="text-center mb-5">
              <h2 className="fw-bolder text-dark mb-3 d-flex align-items-center justify-content-center gap-2">
                <div
                  className="rounded-circle"
                  style={{
                    width: "10px",
                    height: "10px",
                    background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
                  }}
                />
                {platformName || "NeuroNest"}
              </h2>
              <p className="text-secondary fw-medium text-uppercase small tracking-wider">
                Reset your password
              </p>
            </div>

            {message ? (
              <div className="text-center py-4">
                <div 
                  className="rounded-circle bg-emerald-50 text-emerald-500 mx-auto mb-4 d-flex align-items-center justify-content-center"
                  style={{ width: '64px', height: '64px' }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h4 className="fw-bold text-dark mb-3">Email Sent!</h4>
                <p className="text-muted mb-4 px-3" style={{ fontSize: '0.95rem' }}>
                  {message}
                </p>
                <Link to="/login" className="btn btn-primary w-100 fw-bold rounded-3 py-2 shadow-sm">
                  Back to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="d-flex flex-column">
                <p className="text-muted mb-4 text-center px-2" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                  Enter your email address and we'll send you instructions to reset your password.
                </p>

                {error && (
                  <div 
                    className="alert d-flex align-items-center fw-bold p-3 rounded-3 mb-4 border-0"
                    style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}
                    role="alert"
                  >
                    <svg width="16" height="16" className="me-2 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span style={{ fontSize: '0.85rem' }}>{error}</span>
                  </div>
                )}

                <div className="form-group mb-4">
                  <label className="form-label fw-bold text-secondary text-uppercase mb-3 small tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-lg border shadow-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    style={{ borderRadius: '10px', fontSize: '0.95rem' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 fw-bold rounded-3 mb-4"
                  disabled={loading}
                  style={{
                    background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                    border: "none"
                  }}
                >
                  {loading ? "Processing..." : "Send Reset Link"}
                </button>

                <div className="text-center">
                  <Link to="/login" className="text-decoration-none fw-bold small text-primary">
                    Return to Login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
