import { useEffect, useState, useRef } from "react";
import api from "../axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import React from "react";
import "../styles/inbox.css";
import ComposeModal from "../components/ComposeModal";

export default function Inbox() {
  const navigate = useNavigate();
  const fetchedRef = useRef(false);

  const [messages, setMessages] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({
    to: "",
    subject: "",
    body: "",
  });

  const loadInbox = (pageToken = null, silent = false, replace = false) => {
    let toastId;

    if (!silent) {
      toastId = toast.loading("Fetching emails...");
      // setLoading(true);
    }

    setLoading(true);

    api
      .get("/email/inbox", { params: { pageToken } })
      .then((res) => {
        if (replace) {
          setMessages(res.data.messages);
        } else {
          setMessages((prev) => {
            const map = new Map();
            [...prev, ...res.data.messages].forEach((m) => map.set(m.id, m));
            return Array.from(map.values());
          });
        }

        setNextPageToken(res.data.nextPageToken || null);
        setLoading(false);

        if (!silent) toast.success("Inbox loaded", { id: toastId });
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        if (!silent) toast.error("Failed to load inbox", { id: toastId });
      });
  };

  const renderStatus = (msg) => {
    if (msg.analysisStatus === "pending")
      return <span className="status pending">Analyzing…</span>;

    if (msg.analysisStatus === "failed")
      return <span className="status failed">Failed</span>;

    if (msg.analysisStatus === "completed")
      return <span className="status completed">Analyzed</span>;

    return null;
  };

  // Initial load
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    loadInbox();
  }, []);

  // Auto refresh while pending
  useEffect(() => {
    const hasPending = messages.some((m) => m.analysisStatus === "pending");

    if (!hasPending) return;

    const interval = setInterval(() => {
      loadInbox(null, true, true);
    }, 5000);

    return () => clearInterval(interval);
  }, [messages]);

  return (
    <div className="inbox-container">
      <div className="top-actions">
        <button onClick={() => navigate("/dashboard")}>← Back</button>
        <button
          onClick={() =>
            api.post("/email/disconnect").then(() => {
              navigate("/dashboard");
            })
          }
        >
          Disconnect Gmail
        </button>
      </div>

      <h1>Inbox</h1>

      {messages.map((msg) => (
        <div key={msg.id} className="email-card">
          <p className="email-from">
            <b>From:</b> {msg.from}
          </p>
          <p className="email-subject">
            <b>Subject:</b> {msg.subject}
          </p>
          <p className="email-snippet">{msg.snippet}</p>

          {renderStatus(msg)}

          {/* AI Analysis (ATTACHED) */}
          {msg.analysisStatus === "completed" && msg.analysis && (
            <div className="analysis-section">
              <div className="analysis-header">🤖 AI Analysis</div>

              <div className="analysis-content">
                <p>
                  <b>Intent:</b> {msg.analysis.intent}
                </p>
                <p>
                  <b>Urgency:</b>{" "}
                  <span className={`urgency ${msg.analysis.urgency}`}>
                    {msg.analysis.urgency}
                  </span>
                </p>
                <p>
                  <b>Summary:</b> {msg.analysis.summary}
                </p>
                <p>
                  <b>Suggested Action:</b> {msg.analysis.suggestedAction}
                </p>
              </div>
            </div>
          )}
          <button
            className="reply-ai-button"
            onClick={async () => {
              try {
                const res = await api.post("/email/reply-ai", {
                  email: {
                    from: msg.from,
                    subject: msg.subject,
                    snippet: msg.snippet,
                  },
                  analysis: msg.analysis,
                  userPrompt: "Write a professional reply",
                });

                setComposeData({
                  to: msg.from,
                  subject: `Re: ${msg.subject}`,
                  body: res.data.reply,
                });

                setShowCompose(true);
              } catch (err) {
                toast.error("Failed to generate reply");
              }
            }}
          >
            Reply with Coffer 🤖
          </button>
        </div>
      ))}

      {showCompose && (
        <ComposeModal
          isOpen={showCompose}
          initialData={composeData}
          onClose={() => setShowCompose(false)}
        />
      )}

      {loading && <p className="loading-text">Gathering emails…</p>}

      {nextPageToken && !loading && (
        <button onClick={() => loadInbox(nextPageToken)}>Load More</button>
      )}
    </div>
  );
}
