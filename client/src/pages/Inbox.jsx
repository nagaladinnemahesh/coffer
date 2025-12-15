import { useEffect, useState } from "react";
// import axios from "axios";
import api from "../axios";

export default function Inbox() {
  const [messages, setMessages] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // load inbox
  const loadInbox = (pageToken = null) => {
    setLoading(true);

    api
      .get("http://localhost:3000/email/inbox", {
        params: { pageToken },
      })
      .then((res) => {
        setMessages((prev) => [...prev, ...res.data.messages]);
        setNextPageToken(res.data.nextPageToken || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadInbox();
  });

  return (
    <div style={{ padding: "24px" }}>
      <h1>Inbox</h1>

      {messages.map((msg) => (
        <div
          key={msg.id}
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
