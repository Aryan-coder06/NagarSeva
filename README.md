<div align="center">
  <img src="NAGAR%20LOGO.png" alt="NagarSeva Logo" width="250" />

  # 🏙️ NagarSeva (Jagruk)
  **Smart Community Issue Reporting System**

  *Empowering citizens with AI and real-time civic governance.*
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)

  [Features](#-core-features) • [Architecture](#-system-architecture) • [Directory Tree](#-directory-structure) • [Installation](#-quick-setup) • [API Reference](#-api-endpoints)
</div>

---

## 🎯 Problem Statement

Urban communities often face systemic challenges in reporting and managing local issues such as potholes, broken streetlights, and sanitation problems. Traditional reporting methods are fragmented and inefficient, leading to delayed responses, lack of transparency, and unresolved civic decay. There is an urgent need for a streamlined, user-friendly platform that empowers citizens to report issues effortlessly while equipping municipal administrators with robust tools to prioritize and resolve them effectively.

## 💡 The Solution: NagarSeva

**NagarSeva** (formerly *Jagruk*) is a comprehensive, full-stack web application that bridges the gap between citizens and municipal governance. 

By leveraging **GPS-tagged locations**, **Cloudinary multimedia handling**, and **Google Gemini AI** for automatic categorization and severity assessment, NagarSeva transforms civic reporting into a seamless 30-second process. The platform features interactive community maps, real-time tracking, administrative dashboards, and a community voting system to crowd-source priority validation.

---

## ✨ Core Features

### 👨‍👩‍👧‍👦 For Citizens
- **📸 One-Tap Smart Reporting**: Snap a photo of an issue. GPS auto-detects the location while AI analyzes the image to classify the problem and gauge severity.
- **🗺️ Interactive Live Map**: Visualize all reported issues across your city in real-time with cluster mapping and status pins.
- **🗳️ Community Voting & Verification**: Upvote critical issues to boost their priority score. Verify municipal resolution claims to build trust.
- **🏆 Civic Leaderboard**: Earn points for active participation, verified reports, and civic engagement.
- **🔔 Live Tracking**: Push notifications at every step of the resolution pipeline.

### 🏛️ For Municipal Authorities
- **🤖 AI-Powered Triage**: Machine learning automatically routes issues to the correct department, minimizing bureaucratic delays.
- **📊 Analytics Dashboard**: Comprehensive data visualization of departmental performance, resolution rates, and geographical hotspots.
- **👮 Officer Assignment**: Dispatch field officers dynamically based on proximity and workload balancing.
- **🔍 Duplicate Detection**: Advanced algorithms detect duplicate reports within a 250m radius, clustering them to prevent redundant workflows.
- **📈 Priority Engine**: A dynamic scoring system (0-100) calculates urgency based on AI severity, community votes, age, and duplicate clustering.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Framer Motion, Leaflet Maps, Chart.js, Lucide Icons |
| **Backend** | Node.js, Express 5.1.0, Mongoose, CommonJS |
| **Database** | MongoDB |
| **Authentication**| Firebase Auth (Client + Admin SDK custom claims) |
| **AI Engine** | Google Gemini API (gemini-2.5-flash / fallback chain) |
| **Media & APIs** | Cloudinary (Images/Video), OpenCage (Reverse Geocoding) |

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

The application utilizes a decoupled client-server architecture. The React frontend handles rich mapping and 3D UI experiences, communicating securely via Bearer tokens (Firebase) to the Express backend. The backend acts as an orchestrator—interfacing with MongoDB for state, Gemini AI for inference, and OpenCage for spatial intelligence.

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
git clone https://github.com/tilakjain619/Smart-Community-Issue-Reporting-System.git
cd Smart-Community-Issue-Reporting-System/backend

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

Access the **Frontend** at `http://localhost:5174` (or `5173`) and the **Backend API** at `http://localhost:3000`.

---

## 📡 API Endpoints (Backend)

NagarSeva provides a robust RESTful API secured by Firebase Custom Claims.

### Issues (`/api/issues`)
- `GET /api/issues` - Fetch public issues (supports pagination, geospatial filtering)
- `GET /api/issues/all` - Fetch all issues (Municipal access)
- `POST /api/issues` - Submit a new report (Triggers Gemini AI)
- `PATCH /api/issues/:id/status` - Update issue resolution status (Municipal)
- `POST /api/issues/:id/vote` - Upvote or verify an issue (Citizen)

### Analytics & Logs (`/api/logs`)
- `GET /api/logs` - Fetch audit logs for system events
- `GET /api/logs/stats` - Fetch aggregate metrics for dashboards

### Users & Officers (`/api/profile`, `/api/officers`)
- `GET /api/profile/me` - Fetch current user's profile and civic score
- `POST /api/officers` - Register a new municipal field officer

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
