import { useEffect, useState } from "react";
import "../styles/dashboard.css";
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
          <h1 className="dashboard-title">No Gmail Connected</h1>
          <p className="dashboard-subtitle">
            Connect your Gmail account to analyze and manage emails.
          </p>

          <button
            className="btn-primary"
            onClick={() => {
              const token = localStorage.getItem("token");
              if (!token) {
                showError("Session expired. Please login again.");
                return;
              }
              showSuccess("Redirecting to Google OAuth");
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
      <div className="dashboard-card">
        <div className="dashboard-header">
          {state.picture ? (
            <img src="/email/avatar" alt="avatar" className="avatar" />
          ) : (
            <div className="avatar placeholder"></div>
          )}

          <div>
            <h2 className="connected-title">Connected Gmail</h2>
            <p className="connected-email">{state.email}</p>
          </div>
        </div>

        <div className="dashboard-actions">
          <button
            className="btn-primary"
            onClick={async () => {
              try {
                await api.post("/email/send-oauth", {
                  to: "maheshnagaladinne21@gmail.com",
                  subject: "Test from Coffer",
                  body: "This email was sent using Gmail API",
                });
                showSuccess("Email sent successfully");
              } catch {
                showError("Failed to send email");
              }
            }}
          >
            Send Test Email
          </button>

          <button
            className="btn-secondary"
            onClick={() => (window.location.href = "/inbox")}
          >
            View Inbox
          </button>

          <button onClick={() => navigate("/sent")}>Sent Emails</button>

          <button
            className="btn-secondary"
            onClick={() => setShowCompose(true)}
          >
            Compose Email
          </button>

          <button
            className="btn-danger"
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
            Disconnect Gmail
          </button>
        </div>
      </div>

      <ComposeModal
        isOpen={showCompose}
        onClose={() => setShowCompose(false)}
      />
    </div>
  );
}
