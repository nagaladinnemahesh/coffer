import { useEffect, useState, useRef } from "react";
import api from "../axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../styles/inbox.css";
import ComposeModal from "../components/ComposeModal";

export default function Inbox() {
  const navigate = useNavigate();
  const fetchedRef = useRef(false);

  const [messages, setMessages] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [replyLoadingId, setReplyLoadingId] = useState(null);
  const [composeData, setComposeData] = useState({
    to: "",
    subject: "",
    body: "",
  });

  // fetching inbox
  const loadInbox = (pageToken = null, silent = false, replace = false) => {
    let toastId;

    if (!silent) {
      toastId = toast.loading("Fetching emails...");
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

  // status render
  const renderStatus = (msg) => {
    if (msg.analysisStatus === "pending")
      return <span className="status pending">Analyzing…</span>;

    if (msg.analysisStatus === "failed")
      return <span className="status failed">Failed</span>;

    if (
      msg.analysisStatus === "completed" &&
      msg.analysis &&
      msg.analysis.intent
    )
      console.log("ai analysis", msg.analysis);
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

  // render
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
          <div className="email-header">
            <p className="email-from">
              <b>From:</b> {msg.from}
            </p>
            <p className="email-subject">
              <b>Subject:</b> {msg.subject}
            </p>
          </div>

          <p className="email-snippet">{msg.snippet}</p>

          {renderStatus(msg)}

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
                  <b>Suggested Actions:</b>{" "}
                  <span className="suggested-action">
                    {msg.analysis.suggested_action}
                  </span>
                </p>
              </div>

              <button
                className="reply-ai-button"
                disabled={replyLoadingId === msg.id}
                onClick={async () => {
                  if (replyLoadingId === msg.id) return;

                  let pollInterval;
                  let toastId;

                  try {
                    setReplyLoadingId(msg.id);

                    // 1️ Create reply job
                    const res = await api.post("/reply/draft", {
                      email: {
                        id: msg.id,
                        from: msg.from,
                        subject: msg.subject,
                        body: msg.snippet,
                      },
                      analysis: msg.analysis,
                      userPrompt: "reply_to_email",
                    });

                    const jobId = res.data.jobId;

                    // HARD STOP if jobId missing
                    if (!jobId) {
                      toast.error("Failed to start reply job");
                      setReplyLoadingId(null);
                      return;
                    }

                    toastId = toast.loading("Generating reply...");

                    // 2️ Poll for result
                    pollInterval = setInterval(async () => {
                      try {
                        const jobRes = await api.get(`/reply/draft/${jobId}`);

                        if (jobRes.data.status === "completed") {
                          clearInterval(pollInterval);
                          setReplyLoadingId(null);

                          setComposeData({
                            to: msg.from,
                            subject: `Re: ${msg.subject}`,
                            body: jobRes.data.result.reply,
                          });

                          setShowCompose(true);
                          toast.success("Reply ready ✨", { id: toastId });
                        }

                        if (jobRes.data.status === "failed") {
                          clearInterval(pollInterval);
                          setReplyLoadingId(null);
                          toast.error("Reply generation failed", {
                            id: toastId,
                          });
                        }
                      } catch (err) {
                        clearInterval(pollInterval);
                        setReplyLoadingId(null);
                        toast.error("Reply job failed", { id: toastId });
                      }
                    }, 1500);
                  } catch (err) {
                    if (pollInterval) clearInterval(pollInterval);
                    setReplyLoadingId(null);

                    console.error(
                      "Reply AI error:",
                      err?.response?.data || err.message
                    );

                    toast.error("Failed to generate reply");
                  }
                }}
              >
                {replyLoadingId === msg.id
                  ? "Generating…"
                  : "Reply with Coffer 🤖"}
              </button>
            </div>
          )}
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
