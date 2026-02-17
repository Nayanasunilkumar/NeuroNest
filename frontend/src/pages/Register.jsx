import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
import "../styles/auth.css";

const Register = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const strength = Object.values(rules).filter(Boolean).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (strength < 5) {
      setError("Please meet all password requirements.");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        full_name: fullName,
        email,
        password,
        role: "patient",
      });

      navigate("/login");
    } catch (error) {
      console.error(error);
      setError("Registration failed. Email may already exist.");
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = () => (
    <svg viewBox="0 0 24 24" width="18">
      <path
        fill="currentColor"
        d="M12 6c-5 0-8.7 4.1-10 6 1.3 1.9 5 6 10 6 5 0 8.7-4.1 10-6-1.3-1.9-5-6-10-6zm0 10a4 4 0 110-8 4 4 0 010 8z"
      />
    </svg>
  );

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">NeuroNest</h1>
        <p className="auth-subtitle">Create Account</p>

        {error && <p className="premium-error">{error}</p>}

        <form onSubmit={handleSubmit} className="premium-form">
          {/* Full Name */}
          <div className="form-group">
            <label className="label-right">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="label-right">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="label-right">Password</label>

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                <EyeIcon />
              </button>
            </div>

            {/* Parallel Rules */}
            <div className="rules-grid">
              <span className={rules.length ? "valid" : ""}>8+ chars</span>
              <span className={rules.uppercase ? "valid" : ""}>Uppercase</span>
              <span className={rules.lowercase ? "valid" : ""}>Lowercase</span>
              <span className={rules.number ? "valid" : ""}>Number</span>
              <span className={rules.special ? "valid" : ""}>Special</span>
            </div>

            {/* Strength Bar */}
            <div className="strength-bar">
              <div
                className="strength-fill"
                style={{ width: `${(strength / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="label-right">Confirm Password</label>

            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <EyeIcon />
              </button>
            </div>
          </div>

          <button type="submit" className="premium-btn" disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
