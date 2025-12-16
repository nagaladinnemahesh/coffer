import { useEffect, useState } from "react";
// import axios from "axios";
import api from "../axios";
// import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Inbox() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // load inbox
  const loadInbox = (pageToken = null) => {
    const toastId = toast.loading("Fetching emails...");
    setLoading(true);

    api
      .get("http://localhost:3000/email/inbox", {
        params: { pageToken },
      })
      .then((res) => {
        setMessages((prev) => {
          const map = new Map();
          [...prev, ...res.data.messages].forEach((m) => {
            map.set(m.id, m);
          });
          return Array.from(map.values());
        });
        setNextPageToken(res.data.nextPageToken || null);
        toast.success("Inbox loaded", { id: toastId });
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load inbox", { id: toastId });
        setLoading(false);
      });
  };

  useEffect(() => {
    loadInbox();
  }, []);

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <button onClick={() => navigate("/dashboard")}>← Back</button>

        <button
          onClick={() => {
            api.post("/email/disconnect").then(() => {
              navigate("/dashboard");
            });
          }}
        >
          Disconnect Gmail
        </button>
      </div>
      <h1>Inbox</h1>

      {messages.map((msg, index) => (
        <div
          key={`${msg.id}-${index}`}
          style={{
            padding: "12px",
            borderBottom: "1px solid #ddd",
            marginBottom: "8px",
          }}
        >
          <p>
            <b>From:</b> {msg.from}
          </p>
          <p>
            <b>Subject:</b> {msg.subject}
          </p>
          <p style={{ color: "#555" }}>{msg.snippet}</p>
        </div>
      ))}

      {loading && <p>Gathering Emails...</p>}

      {nextPageToken && !loading && (
        <button onClick={() => loadInbox(nextPageToken)}>Load More</button>
      )}
    </div>
  );
}
