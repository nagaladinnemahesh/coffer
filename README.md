# Coffer – AI-Powered Email Intelligence Platform

Coffer is a smart email assistant that connects securely with Gmail to **analyze incoming emails using AI**, identify intent and urgency, and help users **respond faster with AI-generated replies** — all from a clean web dashboard.

---

## 🚀 Features (v1.2.0)

### 🔐 Secure Gmail Integration
- Google OAuth 2.0 authentication
- Read-only inbox access + send emails via Gmail API
- Secure token storage and refresh handling

### 📥 Smart Inbox
- Fetches only Inbox emails (filters out Sent, Spam, etc.)
- Background AI analysis for each email:
  - **Intent** (e.g., job offer, meeting, promotion)
  - **Urgency** (low / medium / high)
  - **Summary**
  - **Suggested action**
- Live status updates:
  - Analyzing → Analyzed (no manual refresh needed)

### 🤖 AI Reply with Coffer
- One-click **“Reply with Coffer 🤖”**
- Uses email context + AI analysis to generate a professional reply
- Opens in a compose modal (fully editable)
- Sends reply via Gmail API

### ✉️ Sent Emails
- Separate Sent view
- Emails sent via Coffer are marked with:
  > **“Sent with Coffer 🤖”**
- Avoids mixing inbox and sent messages

### 🧑 User Experience
- Clean dashboard with Gmail account status
- Gmail profile avatar support
- Compose email modal
- Secure logout and disconnect Gmail flow

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- React Router
- Axios
- CSS (custom, no UI libraries)

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Google OAuth 2.0
- Gmail API

### AI
- Google Gemini API
- Intent analysis & reply generation

### Deployment
- Backend: Render
- Frontend: Vercel
- Database: MongoDB Atlas

---

## 🧠 How It Works (High Level)

1. User logs in and connects Gmail via OAuth
2. Inbox emails are fetched from Gmail API
3. Each email is analyzed asynchronously using Gemini AI
4. Analysis results are stored and reused (no reprocessing)
5. User can:
   - View insights
   - Generate AI replies
   - Send emails via Gmail
6. Emails sent via Coffer are tracked and labeled

---

## 🔐 Security Notes

- All API routes are JWT-protected
- OAuth state validation prevents CSRF
- Tokens are refreshed securely
- No Gmail passwords are stored

---

## 📦 Versioning

- **v1.0** – Gmail OAuth + basic inbox
- **v1.1** – AI analysis + background processing
- **v1.2** – AI replies, Sent tracking, UI polish

---

## 🔮 Planned Improvements

- AI dashboard insights (daily summary, priorities)
- Custom reply prompts
- Thread-level analysis
- Labels & smart filters
- Caching and performance optimizations
- Real time Email ingestion using Gmail Push Notifications(`users.watch`)
  

---

## 👤 Author

**Mahesh Nagaladinne**  
Backend / Full Stack Developer  
Focused on scalable backend systems, cloud, and AI-integrated applications.
