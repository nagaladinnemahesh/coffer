import { useEffect, useState } from "react";
import "../styles/Dashboard.css";
import api from "../axios";
import { showSuccess, showError } from "../utils/toast";
import ComposeModal from "../components/ComposeModal.jsx";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Dashboard() {
  const navigate = useNavigate();
  const [showCompose, setShowCompose] = useState(false);

  const [state, setState] = useState({
    loading: true,
    connected: false,
    email: "",
    picture: "",
  });

  useEffect(() => {
    api
      .get("/email/account")
      .then((res) => {
        setState({
          loading: false,
          connected: res.data.connected,
          email: res.data.email,
          picture: res.data.picture,
        });
      })
      .catch(() => {
        setState({
          loading: false,
          connected: false,
          email: "",
          picture: "",
        });
      });
  }, []);

  if (state.loading) {
    return <p className="loading-text">Loading dashboard…</p>;
  }

  if (!state.connected) {
    return (
      <div className="dashboard-container center">
        <div className="dashboard-card">
          <h1 className="dashboard-title">Connect your Gmail</h1>
          <p className="dashboard-subtitle">
            Coffer needs Gmail access to analyze and manage emails.
          </p>

          <button
            className="btn-primary"
            onClick={() => {
              const token = localStorage.getItem("token");
              if (!token) {
                showError("Session expired. Please login again.");
                return;
              }
              window.location.href = `${API_BASE}/email/connect?token=${token}`;
            }}
          >
            Connect Gmail
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Gmail Status */}
      <div className="dashboard-card">
        <div className="dashboard-header">
          {state.picture ? (
            <img src="/email/avatar" alt="avatar" className="avatar" />
          ) : (
            <div className="avatar placeholder"></div>
          )}

          <div>
            <h2 className="connected-title">Gmail Connected</h2>
            <p className="connected-email">{state.email}</p>
          </div>

          <button
            className="btn-danger small"
            onClick={async () => {
              try {
                await api.post("/email/disconnect");
                showSuccess("Gmail disconnected");
                window.location.reload();
              } catch {
                showError("Failed to disconnect Gmail");
              }
            }}
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="action-grid">
        <div className="action-card" onClick={() => navigate("/inbox")}>
          <h3>📥 Inbox</h3>
          <p>View analyzed incoming emails</p>
        </div>

        <div className="action-card" onClick={() => navigate("/sent")}>
          <h3>📤 Sent</h3>
          <p>Emails sent via Coffer</p>
        </div>

        <div className="action-card" onClick={() => setShowCompose(true)}>
          <h3>✉️ Compose</h3>
          <p>Write and send emails</p>
        </div>
      </div>

      {/* AI Overview */}
      <div className="dashboard-card muted">
        <h3>🤖 AI Overview</h3>
        <p>• Intent detection</p>
        <p>• Urgency classification</p>
        <p>• Smart reply suggestions</p>
        <span className="coming-soon">Coming soon</span>
      </div>

      <ComposeModal
        isOpen={showCompose}
        onClose={() => setShowCompose(false)}
      />
    </div>
  );
}
