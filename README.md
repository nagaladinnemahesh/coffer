# Coffer – AI-Powered Email Intelligence Platform

Coffer is a smart email productivity platform that connects securely with Gmail to **analyze incoming emails using AI**, identify intent and urgency, and help users **respond faster with AI-generated replies** — all from a clean web dashboard.

From **v1.3.0**, Coffer uses a **dedicated AI microservice (CIS – Content Intelligence Service)** to handle all intelligence workflows independently.

---

## 🚀 Features (v1.3.0)

### 🔐 Secure Gmail Integration
- Google OAuth 2.0 authentication
- Secure Gmail Inbox access (read-only) and email sending via Gmail API
- Access token refresh handling with no manual re-login

### 📥 Smart Inbox
- Fetches **Inbox-only emails** (filters out Sent, Spam, Promotions)
- Background AI analysis for each email:
  - **Intent** (job offer, payment follow-up, meeting, promotion, etc.)
  - **Urgency** (low / medium / high)
  - **Summary**
  - **Suggested action**
- Progressive UI updates:
  - Analyzing → Analyzed (no page refresh required)

### 🤖 AI Reply with Coffer
- One-click **“Reply with Coffer 🤖”**
- Uses:
  - Original email context
  - AI analysis results
  - Optional user instruction
- Generates a professional reply
- Opens in a compose modal (fully editable)
- Sends email via Gmail API

### ✉️ Sent Emails
- Separate Sent Emails view
- Emails sent via Coffer are marked with:
  **“Sent with Coffer 🤖”**
- Prevents mixing Inbox and Sent messages

### 🧠 Content Intelligence Service (CIS) – NEW
- Dedicated AI microservice built with **FastAPI + Python**
- Handles:
  - Email intent classification
  - Urgency detection
  - Summary generation
  - AI reply drafting
- Job-based asynchronous architecture:
  - `pending → completed → failed`
- Stores AI results in MongoDB for reuse
- Enables AI evolution without redeploying Coffer

### 🧑 User Experience
- Clean command-center style dashboard
- Gmail profile avatar support
- Compose email modal
- Secure logout and Gmail disconnect flow

---

## 🛠 Tech Stack

### Frontend
- React (Vite)
- React Router
- Axios
- Custom CSS (no UI libraries)

### Backend (Coffer)
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Google OAuth 2.0
- Gmail API

### AI Microservice (CIS)
- Python
- FastAPI
- MongoDB
- Google Gemini AI
- Async job-based processing

### Deployment
- Coffer Backend: Render
- CIS (AI Service): Render
- Frontend: Vercel
- Database: MongoDB Atlas

---

## 🧠 How It Works (High Level)

1. User logs in and connects Gmail via OAuth
2. Inbox emails are fetched from Gmail API
3. Each email is sent to **CIS** for asynchronous AI analysis
4. CIS processes content using Gemini AI and stores results
5. UI polls and updates analysis status progressively
6. User can:
   - View insights
   - Generate AI replies
   - Send emails via Gmail
7. Emails sent via Coffer are tracked and labeled

---

## 🔐 Security Notes

- All API routes are JWT-protected
- OAuth state validation prevents CSRF
- Access tokens are refreshed securely
- No Gmail passwords are stored
- AI logic is isolated from authentication and user data

---

## 📦 Versioning

- **v1.0** – Gmail OAuth + basic inbox
- **v1.1** – Background AI analysis and persistence
- **v1.2** – AI replies, Sent tracking, UI polish
- **v1.3** – Dedicated AI microservice (CIS), async jobs, architecture decoupling

---

## 🔮 Planned Improvements

- AI dashboard insights (daily summaries, priorities)
- Custom reply prompts
- Thread-level analysis
- Smart labels & filters
- Performance caching
- Real-time email ingestion using Gmail Push Notifications (`users.watch`)
- Queue-based processing (Redis / PubSub)

---

## 👤 Author

**Mahesh Nagaladinne**  
Backend / Full Stack Developer  
Focused on scalable backend systems, cloud architecture, and production-grade AI integrations.
