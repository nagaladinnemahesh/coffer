import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../axios.js";
import "../styles/composeModal.css";

export default function ComposeModal({ isOpen, onClose, initialData }) {
  const [form, setForm] = useState({
    to: "",
    subject: "",
    body: "",
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        to: initialData.to || "",
        subject: initialData.subject || "",
        body: initialData.body || "",
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSend = async () => {
    if (!form.to || !form.subject || !form.body) {
      toast.error("All fields are required");
      return;
    }

    try {
      setSending(true);
      const toastId = toast.loading("Sending email…");

      await api.post("/email/send-oauth", form);

      toast.success("Email sent successfully", { id: toastId });
      setForm({ to: "", subject: "", body: "" });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to send email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="compose-overlay">
      <div className="compose-modal">
        <div className="compose-header">
          <h3>Compose Email</h3>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="compose-body">
          <input
            type="email"
            name="to"
            placeholder="To"
            value={form.to}
            onChange={handleChange}
          />

          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={form.subject}
            onChange={handleChange}
          />

          <textarea
            name="body"
            placeholder="Write your message..."
            rows={8}
            value={form.body}
            onChange={handleChange}
          />
        </div>

        <div className="compose-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>

          <button
            className="btn-primary"
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
