import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../shared/services/api/auth";
import { useSystemConfig } from "../shared/context/SystemConfigContext";
import "../shared/styles/auth.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { platformName } = useSystemConfig();
  
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !email) {
      setError("Invalid or expired reset link. Please request a new one.");
    }
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const { data } = await resetPassword({ 
        token, 
        email, 
        password 
      });
      setMessage(data.message || "Password reset successfully.");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reset password. Please try again.");
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
                Set New Password
              </p>
            </div>

            {message ? (
              <div className="text-center">
                <div className="alert alert-success border-0 rounded-3 mb-4">
                  {message}
                </div>
                <p className="text-muted small">Redirecting to login...</p>
                <Link to="/login" className="btn btn-primary w-100 fw-bold rounded-3 mt-2">
                  Go to Login Now
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="d-flex flex-column">
                {error && (
                  <div className="alert alert-danger border-0 rounded-3 mb-4">
                    {error}
                  </div>
                )}

                <div className="form-group mb-3">
                  <label className="form-label fw-bold text-secondary text-uppercase mb-2 small tracking-wider">
                    New Password
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-lg border shadow-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={!token || !email}
                    style={{ borderRadius: '10px', fontSize: '0.95rem' }}
                  />
                </div>

                <div className="form-group mb-4">
                  <label className="form-label fw-bold text-secondary text-uppercase mb-2 small tracking-wider">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-lg border shadow-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={!token || !email}
                    style={{ borderRadius: '10px', fontSize: '0.95rem' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 fw-bold rounded-3 mb-4"
                  disabled={loading || !token || !email}
                  style={{
                    background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                    border: "none"
                  }}
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>

                <div className="text-center">
                  <Link to="/login" className="text-decoration-none fw-bold small text-primary">
                    Cancel and Return to Login
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

export default ResetPassword;
