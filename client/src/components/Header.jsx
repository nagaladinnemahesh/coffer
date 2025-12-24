import { NavLink, useNavigate } from "react-router-dom";
import api from "../axios";
import "../styles/header.css";

export default function Header({ email }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed");
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        {/* <img className="logo" src="/logo-transparent-svg.svg" alt="Coffer" /> */}
        <NavLink to="/dashboard">
          <h1 className="logo">COFFER</h1>
        </NavLink>
      </div>

      <nav className="header-nav">
        <NavLink to="/dashboard" className="nav-link">
          Dashboard
        </NavLink>
        <NavLink to="/inbox" className="nav-link">
          Inbox
        </NavLink>
        <NavLink to="/sent" className="nav-link">
          Sent
        </NavLink>
      </nav>

      <div className="header-right">
        {email && <span className="user-email">{email}</span>}
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
