import { useState } from "react";
// import axios from "axios";
import api from "../axios.js";
import { useNavigate, Link } from "react-router-dom";
import { showSuccess, showError } from "../utils/toast";
import "../styles/auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("http://localhost:3000/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      console.log(res.data.token);
      showSuccess("Login Successful");
      navigate("/dashboard");
    } catch (err) {
      // alert("Invalid credentials");
      showError("Invalid Email or Password");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Coffer</h1>
        <p className="auth-subtitle">Access you gmail securely</p>
        <form onSubmit={handleLogin}>
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
            {loading ? "Logging in.." : "Login"}
          </button>
        </form>
        <div className="auth-footer">
          Not Registered? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
}
