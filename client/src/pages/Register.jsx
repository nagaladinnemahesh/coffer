import { useState } from "react";
import api from "../axios.js";
import { useNavigate, Link } from "react-router-dom";
import "../styles/auth.css";
import { showSuccess, showError } from "../utils/toast";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/register", {
        email,
        password,
      });
      showSuccess("Account created successfully");
      navigate("/login");
    } catch (err) {
      showError("User already exists");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Coffer</h1>
        <p className="auth-subtitle">Create your account</p>
        <form onSubmit={handleRegister}>
          <div className="auth-group">
            <label>Email</label>
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="auth-btn" disabled={loading}>
            {loading ? "Creating account.." : "Register"}
          </button>
        </form>
        <div className="auth-footer">
          Already Registered? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
