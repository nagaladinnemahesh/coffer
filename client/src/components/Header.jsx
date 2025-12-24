import { useNavigate } from "react-router-dom";
import "../styles/header.css";

export default function Header() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="header">
      <h2 className="logo">Coffer</h2>

      <button className="logout-btn" onClick={logout}>
        Logout
      </button>
    </header>
  );
}
