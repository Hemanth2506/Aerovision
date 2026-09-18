# AeroVision

> **Aviation intelligence platform for aircraft health, predictive maintenance, flight safety, and operations.**

AeroVision is a full-stack engineering prototype that brings aircraft telemetry analysis, anomaly detection, maintenance intelligence, operational views, and interactive aircraft visualization into one interface.

## 🚀 What It Demonstrates

- **Aircraft health monitoring** with multivariate telemetry analysis
- **Predictive maintenance concepts** including RUL estimation
- **Anomaly detection** across engine and hydraulic signals
- **3D digital twin** inspection using Three.js
- **Fleet and airport operations** views
- **Flight safety intelligence** and risk visualization
- **Weather and turbulence** information views
- **Operational exports** for reports and work orders
- **WebSocket telemetry** for real-time streaming prototypes
- Role-oriented interfaces for aviation operations and engineering teams

## 🏗️ Architecture

```text
┌──────────────────────────────────┐
│ React + TypeScript + Three.js    │
│ Maps • 3D Twin • Dashboards      │
└───────────────┬──────────────────┘
                │ REST / WebSocket
                ▼
┌──────────────────────────────────┐
│ FastAPI Backend                  │
│ APIs • Validation • Telemetry    │
└───────────────┬──────────────────┘
                ▼
┌──────────────────────────────────┐
│ Python Analytics / ML Engine     │
│ RUL • Anomaly Detection • Stats  │
└──────────────────────────────────┘
```

## 🛠️ Tech Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion  
**3D & Maps:** Three.js, WebGL, Leaflet, React-Leaflet  
**Backend:** Python, FastAPI, Uvicorn, Pydantic, WebSockets  
**ML/Data:** Scikit-learn, NumPy, Pandas  
**Exports:** jsPDF, XLSX

## 📁 Structure

```text
Aerovision/
├── frontend/
│   └── src/
│       ├── components/
│       ├── data/
│       ├── services/
│       └── types/
├── backend/
│   ├── main.py
│   ├── ml_engine.py
│   └── requirements.txt
├── start.bat
└── run_platform.ps1
```

## ⚡ Run Locally

### Prerequisites

- Node.js 18+
- Python 3.10+
- Git

### Install

```bash
cd frontend
npm install

cd ../backend
pip install -r requirements.txt
```

### Start backend

```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Start frontend

```bash
cd frontend
npm run dev
```

For Windows, the repository also includes `start.bat` and `run_platform.ps1`.

## 🔐 Configuration

Optional integrations are configured through the provided `.env.example` files. **Never commit real API keys or credentials.**

## 🧠 Engineering Focus

AeroVision explores how **ML analytics + real-time data + 3D visualization + operational workflows** can be combined into a single aviation software system.

> Prototype note: aviation outputs and simulations should not be treated as certified operational or safety-critical systems.

---
**Built by Hemanth Sanjay · AI & Data Science**