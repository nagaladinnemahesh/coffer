import { useEffect, useState } from "react";
import axios from "axios";
import "./styles/Dashboard.css";

export default function Dashboard() {
  const [state, setState] = useState({
    loading: true,
    connected: false,
    email: "",
    picture: "",
  });

  useEffect(() => {
    axios
      .get("http://localhost:3000/email/account")
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
          onClick={() =>
            (window.location.href = "http://localhost:3000/email/connect")
          }
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
          <img
            src="http://localhost:3000/email/avatar"
            alt="avatar"
            className="avatar"
          />
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
            onClick={() =>
              axios
                .get("http://localhost:3000/email/send-oauth")
                .then(() => alert("Email sent"))
            }
          >
            Send Test Email
          </button>

          <button
            className="btn-secondary"
            onClick={() => {
              axios
                .post("http://localhost:3000/email/disconnect")
                .then(() => window.location.reload());
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
