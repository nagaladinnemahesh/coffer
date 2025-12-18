import { useEffect, useState } from "react";
import "../styles/Dashboard.css";
import api from "../axios";
import { showSuccess, showError } from "../utils/toast";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Dashboard() {
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
        console.log("account data:", res.data);
      })
      .catch(() => {
        setState({ loading: false, connected: false, email: "", picture: "" });
      });
  }, []);

  if (state.loading) {
    return <p>Loading...</p>;
  }

  if (!state.connected) {
    return (
      <div className="dashboard-container">
        <h1 className="dashboard-title">No Gmail Connected</h1>
        <button
          className="btn-primary"
          onClick={() => {
            const token = localStorage.getItem("token");
            // console.log("TOKEN:", localStorage.getItem("token"));

            if (!token) {
              // alert("please login again");
              showError("session expired, please login again");
              return;
            }
            showSuccess("Redirecting to google oauth");
            window.location.href = `${API_BASE}/email/connect?token=${token}`;
          }}
        >
          Connect Gmail
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        {state.picture ? (
          <img src="/email/avatar" alt="avatar" className="avatar" />
        ) : (
          <div className="avatar placeholder"></div>
        )}
        <div>
          <h1 style={{ margin: 0 }}>Connected Gmail</h1>
          <p style={{ margin: 0 }}>{state.email}</p>
        </div>

        <div style={{ marginTop: "24px" }}>
          <button
            className="btn-primary"
            onClick={async () => {
              try {
                await api.post("email/send-oauth", {
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
            onClick={async () => {
              try {
                await api.post("/email/disconnect");
                showSuccess("Gmail disconnected");
                window.location.reload();
              } catch {
                showError("Failed to disconnect gmail");
              }
              // api
              //   .post("http://localhost:3000/email/disconnect")
              //   .then(() => window.location.reload());
            }}
          >
            Disconnect Gmail
          </button>

          <button
            className="btn-secondary"
            onClick={() => (window.location.href = "inbox")}
          >
            View Inbox
          </button>

          <button
            className="btn-secondary"
            onClick={() => alert("Compose coming soon!")}
          >
            Compose Email
          </button>
        </div>
      </div>
    </div>
  );
}
