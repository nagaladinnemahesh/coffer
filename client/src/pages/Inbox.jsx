import { useEffect, useState } from "react";
import axios from "axios";

export default function Inbox() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:3000/email/inbox")
      .then((res) => {
        setMessages(res.data.messages);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading inbox..</p>;

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
    </div>
  );
}
