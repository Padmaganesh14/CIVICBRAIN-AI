# CivicBrain AI - Municipal Governance Decision Intelligence Platform

> **AI Decision Intelligence for Smarter Municipal Governance**
> Making Municipal Decisions Faster, Smarter and Data-Driven.

---

## 🏛️ Hackathon Overview

**CivicBrain AI** elevates traditional citizen grievance reporting into an executive-level **AI Decision Support Platform**. It seamlessly bridges citizen complaint intake (via text, voice, and media) with automated municipal decision intelligence:

- **Gemini 2.5 AI Complaint Classification**: Auto-assigns department, predicts priority, and outputs confidence metrics.
- **Explainable AI (XAI) Panel**: Explains *why* a priority or budget was assigned with contextual bullet points.
- **Duplicate Match Engine**: Computes similarity scores and enables 1-click ticket merging.
- **Smart Budget Allocation Engine**: Priority Score formula = $0.35 \text{Vol} + 0.30 \text{Sev} + 0.20 \text{Impact} + 0.10 \text{Trend} + 0.05 \text{Cost}$ with interactive "What-If" budget impact simulation.
- **Resource Allocation Engine**: Staff & heavy equipment gap analysis (e.g. +3 Engineers for Ward 18).
- **Interactive Timeline Heatmap**: Time-series map slider demonstrating complaint cluster emergence over time.
- **🚨 Emergency Auto-Flag System**: Automatic alert trigger when >100 complaints occur in 2 hours with direct Commissioner notification.
- **Floating AI Commissioner Copilot**: Conversational assistant powered by Gemini.
- **Executive PDF Governance Exporter**: Instant signed PDF municipal report generation.

---

## 📁 Repository Structure

```text
CIVICBRIAN AI/
├── client/                 # Frontend React 19 + Vite + Tailwind CSS Application
│   ├── src/
│   │   ├── components/     # Navbar, DemoStoryBar, Copilot, Simulator, Heatmap, PDF
│   │   ├── pages/          # Landing, Citizen, Official, RaiseComplaint, Budget, Insights
│   │   ├── services/       # Gemini AI Client & Intelligent Solver Fallback
│   │   ├── utils/          # Math formulas & Multi-Language (EN, TA, HI, ML)
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── server/                 # Backend Node.js + Express API
    ├── controllers/        # Gemini AI & Complaint controllers
    ├── routes/             # RESTful API endpoints
    ├── index.js
    └── package.json
```

---

## 🚀 Quick Start & Local Execution

### 1. Backend Server Setup
```bash
cd server
npm install
npm run dev
# Server running on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
# App running on http://localhost:3000
```

---

## 🚀 Production Deployment (Vercel & Render)

1. **Frontend (Vercel)**:
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Set Environment Variable: `VITE_GEMINI_API_KEY` (optional)

2. **Backend (Render / Railway)**:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Set Environment Variable: `GEMINI_API_KEY` (optional)
