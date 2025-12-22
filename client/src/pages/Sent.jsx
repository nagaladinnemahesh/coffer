import { useEffect, useState } from "react";
import api from "../axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../styles/inbox.css"; //

export default function Sent() {
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadSent = (pageToken = null) => {
    const toastId = toast.loading("Fetching sent emails...");
    setLoading(true);

    api
      .get("/email/sent", { params: { pageToken } })
      .then((res) => {
        setMessages((prev) => {
          const map = new Map();
          [...prev, ...res.data.messages].forEach((m) => map.set(m.id, m));
          return Array.from(map.values());
        });

        setNextPageToken(res.data.nextPageToken || null);
        toast.success("Sent emails loaded", { id: toastId });
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load sent emails", { id: toastId });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSent();
  }, []);

  return (
    <div className="inbox-container">
      <div className="top-actions">
        <button onClick={() => navigate("/dashboard")}>← Back</button>
      </div>

      <h1>Sent Emails</h1>

      {messages.map((msg) => (
        <div key={msg.id} className="email-card">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <p className="email-from">
              <b>To:</b> {msg.to}
            </p>

            {msg.sentViaCoffer && (
              <span className="badge-coffer">Sent with Coffer 🤖</span>
            )}
          </div>

          <p className="email-subject">
            <b>Subject:</b> {msg.subject}
          </p>

          <p className="email-snippet">{msg.snippet}</p>
        </div>
      ))}
    </div>
  );
}
