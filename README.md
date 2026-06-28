<div align="center">
  <img src="nagar-logo.png" alt="NagarSeva Logo" width="250" />

  # 🏙️ NagarSeva
  **Aapki Awaaz, Shaher ka Vikas.**

  *Empowering citizens with AI and real-time civic governance.*
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)

  [Features](#-core-features) • [Architecture](#-system-architecture) • [Deployment](#-deployment) • [Directory Tree](#-directory-structure) • [Installation](#-quick-setup) • [API Reference](#-api-endpoints)
</div>

---

## 🎯 Problem Statement

Urban communities often face systemic challenges in reporting and managing local issues such as potholes, broken streetlights, and sanitation problems. Traditional reporting methods are fragmented and inefficient, leading to delayed responses, lack of transparency, and unresolved civic decay. There is an urgent need for a streamlined, user-friendly platform that empowers citizens to report issues effortlessly while equipping municipal administrators with robust tools to prioritize and resolve them effectively.

## 💡 The Solution: NagarSeva

**NagarSeva** is a comprehensive, full-stack web application that bridges the gap between citizens and municipal governance.

By leveraging **GPS-tagged locations**, **Cloudinary multimedia handling**, and **Google Gemini AI** for automatic categorization and severity assessment, NagarSeva transforms civic reporting into a seamless report-to-resolution workflow. The platform features interactive community maps, live status tracking, administrative dashboards, and a community authenticity system that helps crowd-source priority and trust.

---

## ✨ Core Features

### 👨‍👩‍👧‍👦 For Citizens
- **📸 Image and Video Reporting**: Upload an image or video. GPS auto-detects the location while AI analyzes the report to classify the issue and gauge severity.
- **🗺️ Interactive Live Map**: Visualize reported issues across your city with status pins, category filters, and locality-aware civic context.
- **🗳️ Community Authenticity & Verification**: Citizens can confirm, flag false, or mark duplicates. Trust score and verification state are derived from structured community input.
- **🏆 Civic Leaderboard**: Track citizen impact based on issues reported, validated, and ultimately resolved by municipal teams.
- **🔄 Live Tracking**: Follow the issue from reporting to municipal review, assignment, escalation, and resolution.

### 🏛️ For Municipal Authorities
- **🤖 AI-Powered Triage**: Gemini classifies category, issue type, severity, urgency, suggested department, and operational summaries.
- **📊 Analytics Dashboard**: Visualize departmental performance, resolution rates, and municipal issue mix with scoped dashboards.
- **👮 Officer Assignment & Escalation**: Dispatch field officers, set due dates, escalate stuck cases, and maintain an action timeline.
- **🔍 Duplicate Detection**: Detect duplicate reports within a 250m radius to reduce redundant workflows and consolidate evidence.
- **📈 Priority Engine**: Priority is derived from AI severity, urgency, community confirmation, issue age, and duplicate clustering.
- **✅ Authenticity Decision Layer**: Community signals shape trust, but municipality makes the final approve / reject / duplicate decision.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Framer Motion, Leaflet Maps, Chart.js, Lucide Icons |
| **Backend** | Node.js, Express 5.1.0, Mongoose, CommonJS |
| **Database** | MongoDB |
| **Authentication**| Firebase Auth (Client SDK + Admin token verification) |
| **AI Engine** | Google Gemini API (`gemini-2.5-flash-lite` with `gemini-2.5-flash` fallback) |
| **Speech & AI Assist** | Sarvam Speech-to-Text, Local Luna assistant |
| **Media & APIs** | Cloudinary (Images/Video), OpenCage (Reverse Geocoding) |
| **Deployment Target** | Google Cloud Run (backend), Firebase Hosting (frontend) |

---

## 📂 Directory Structure

Here is the high-level architecture of the NagarSeva mono-repo:

```text
NagarSeva/
├── <b>.github/</b>                 # Issue & PR Templates
├── <b>docs/</b>                    # Architecture diagrams and Build plans
├── <b>backend/</b>
│   ├── <b>controllers/</b>         # Core business logic (IssueControl.js, logControl.js, etc.)
│   ├── <b>models/</b>              # Mongoose schemas (Issue, Log, Officer, UserProfile)
│   ├── <b>routes/</b>              # Express API route definitions
│   ├── <b>middleware/</b>          # RBAC (Auth) and auto-logging middlewares
│   ├── <b>utils/</b>               # AI integration (analyseImage) & Geocoding
│   ├── <b>lib/</b>                 # Firebase Admin initialization
│   ├── <b>scripts/</b>             # Database seeders
│   ├── index.js             # Express application entry point
│   └── package.json         # Backend dependencies
├── <b>frontend/</b>
│   ├── <b>src/</b>
│   │   ├── <b>api/</b>             # Axios API service wrappers
│   │   ├── <b>components/</b>      # Reusable UI components (Public, Admin, Municipal)
│   │   ├── <b>contexts/</b>        # React Context providers (AuthContext)
│   │   ├── <b>data/</b>            # Static JSON/JS datasets
│   │   ├── <b>pages/</b>           # Route-level components (Dashboard, About, VotingSystem)
│   │   ├── <b>utils/</b>           # Frontend helpers (Cloudinary uploads)
│   │   ├── <b>assets/</b>          # Media and SVGs
│   │   ├── App.jsx          # Primary Router configuration
│   │   └── main.jsx         # React DOM entry
│   ├── tailwind.config.js   # Tailwind design tokens
│   └── vite.config.js       # Vite bundler configuration
└── <b>README.md</b>
```

---

## 🏗️ System Architecture

![System Architecture](./docs/Jagruk_Diagram.png)

The application utilizes a decoupled client-server architecture. The React frontend handles mapping, citizen and municipal portal UX, and authenticated issue workflows, communicating via Firebase-backed Bearer tokens to the Express backend. The backend orchestrates MongoDB persistence, Gemini AI inference, Cloudinary media uploads, and OpenCage geospatial enrichment.

---

## 🧠 AI Workflow

Every report moves through a structured AI-assisted pipeline:

1. **Citizen submits report** with image/video + location
2. **Gemini triage** generates category, issue type, severity, urgency, department, and summaries
3. **Duplicate detection** checks nearby unresolved reports
4. **Community authenticity** collects confirm / false / duplicate votes
5. **Trust score** and verification status are derived from community signals
6. **Municipal decision** approves, rejects, or marks duplicate
7. **Assignment and escalation** drive officer-side resolution

This is the current agentic core of NagarSeva.

---

## ☁️ Expansion Roadmap

These are the next justified upgrades for a larger production version of NagarSeva:

### LangGraph + LangChain
- **LangChain** for model/tool abstractions and structured civic tools
- **LangGraph** for a durable civic workflow graph:
  - triage
  - duplicate check
  - trust evaluation
  - routing
  - municipal action recommendations

This is the right path if we want stronger long-running agent workflows, human-in-the-loop review, and richer observability.

### Google Cloud / GCP
- **Cloud Run** for backend deployment and scale-out
- **Vertex AI / Gemini on Google Cloud** for enterprise-grade model routing
- **Cloud Storage** for media instead of third-party object storage
- **BigQuery** for hotspot analytics and predictive civic insights

We have not claimed these as implemented yet. They are the practical next platform upgrades.

---

## 🚢 Deployment

The current recommended production deployment path is:

- **Frontend**: Firebase Hosting
- **Backend**: Google Cloud Run
- **Auth**: Firebase Authentication
- **AI**: Gemini API via Google AI Studio
- **Database**: MongoDB Atlas

Detailed deployment instructions live in:

- [docs/GCP_DEPLOYMENT.md](./docs/GCP_DEPLOYMENT.md)

This keeps the current codebase intact while satisfying the hackathon requirement that the deployed app run on Google Cloud.

---

## 🚀 Quick Setup

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Local or Atlas)
- Firebase Project (Web & Service Account)
- Cloudinary Account
- Google Gemini API Key

### 1. Backend Configuration
```bash
# Clone the repository
git clone https://github.com/Aryan-coder06/NagarSeva.git
cd NagarSeva/backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```
*Populate `.env` with your MongoDB URI, Firebase Service Account keys, Cloudinary credentials, Gemini API key, and OpenCage key.*

```bash
# Start the backend development server
npm run dev
```

### 2. Frontend Configuration
```bash
# Open a new terminal and navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```
*Populate `.env` with your Vite backend URL and Firebase Web configuration.*

```bash
# Start the frontend development server
npm run dev
```

Access the **Frontend** at `http://localhost:5173` (or the next Vite port if occupied) and the **Backend API** at `http://localhost:3000`.

---

## 📡 API Endpoints (Backend)

NagarSeva provides a RESTful API secured by Firebase bearer token verification.

### Issues (`/api/issues`)
- `GET /api/issues` - Fetch public issues (supports pagination, geospatial filtering)
- `GET /api/issues/all` - Fetch all issues (Municipal access)
- `POST /api/issues` - Submit a new report (Triggers Gemini AI)
- `PATCH /api/issues/:id/status` - Update issue resolution status (Municipal)
- `POST /api/issues/:id/vote` - Cast authenticity vote: confirm / false / duplicate
- `PATCH /api/issues/:id/decision` - Municipal final authenticity decision
- `PATCH /api/issues/:id/assign` - Assign issue to an officer
- `PATCH /api/issues/:id/escalate` - Escalate an issue in municipal workflow

### Analytics & Logs (`/api/logs`)
- `GET /api/logs` - Fetch audit logs for system events
- `GET /api/logs/stats` - Fetch aggregate metrics for dashboards

### Users & Officers (`/api/profile`, `/api/officers`)
- `GET /api/profile/me` - Fetch current user's profile and civic score
- `POST /api/officers` - Register a new municipal field officer

### AI Utilities (`/api/ai`)
- `POST /api/ai/transcribe` - Transcribe citizen audio input with Sarvam STT

---

## 🔗 Reference Docs

- [LangGraph overview](https://docs.langchain.com/oss/javascript/langgraph/overview)
- [LangChain overview](https://docs.langchain.com/oss/javascript/langchain/overview)
- [Google Cloud Run Node.js quickstart](https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-nodejs-service)
- [Google Cloud Vertex AI Node.js reference](https://cloud.google.com/nodejs/docs/reference/vertexai/latest)

---

## 🤝 Contributing

We welcome contributions to make NagarSeva better! 
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please review our [CONTRIBUTING.md](./CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) for detailed guidelines.

---

## 📜 License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for more information.

<div align="center">
  <i>Built with passion for smarter, cleaner cities.</i>
</div>
