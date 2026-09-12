# AeroVision — Enterprise Aviation Intelligence & Command Center

AeroVision is a full-stack Aircraft Health Monitoring (AHM), Integrated Operations Control (IOC), and Predictive Maintenance (MRO/CAMO) engineering platform. Built with a React + TypeScript + Three.js frontend and a FastAPI + Scikit-Learn analytical backend, AeroVision provides commercial airlines and flight operations teams with real-time telemetry diagnostics, Remaining Useful Life (RUL) prognostics, 3D digital twin subsystem inspection, and AI flight assistance.

---

## Overview

Modern commercial aviation produces gigabytes of high-frequency sensor telemetry per flight across turbofan engines, hydraulic loops, environmental control, and flight guidance systems. AeroVision unifies real-time fleet radar tracking, predictive failure kinetics, ATA chapter work order dispatching, and 3D digital twin engineering into a single operational interface.

## Problem

Aviation maintenance, fleet operations, and safety monitoring frequently suffer from:
- **Reactive Maintenance**: Aircraft on Ground (AOG) events caused by unanticipated component degradation (e.g., turbine blade thermal creep, hydraulic pressure decay).
- **Siloed Operational Data**: Radar tracking, flight telemetry, maintenance work orders, and weather intelligence reside in disconnected proprietary systems.
- **High Cognitive Overhead**: Operators, flight dispatchers, and CAMO engineers must manually cross-reference Quick Reference Handbooks (QRH), flight data monitoring exceedances, and airport congestion.

## Solution

AeroVision addresses these challenges through:
- **Predictive Health Monitoring**: Automated Remaining Useful Life (RUL) prognostics and multivariate anomaly scoring to detect subsystem degradation before hardware failure occurs.
- **Unified Operations Cockpit**: Leaflet-based global radar tracking, METAR/TAF weather decoding, and real-time turbofan telemetry streaming in a single responsive command dashboard.
- **3D Digital Twin Visualizer**: WebGL/Three.js interactive aircraft airframe with thermal heatmap overlays, exploded subsystem inspection, and fault injection simulation.
- **Operational Export Suite**: Automated generation of Executive Intelligence Briefings (PDF), ATA work orders (Excel/CSV), and flight telemetry logs.

---

## Key Features

- **🌐 Global Fleet Radar & Flight Tracking**: Leaflet-powered radar with live aircraft positioning, Great Circle route plotting, waypoint navigation, 120 NM ETOPS diversion range rings, and SIGMET storm overlays.
- **🤖 Predictive Maintenance & Prognostics**:
  - Remaining Useful Life (RUL) Weibull estimation with confidence intervals.
  - Multi-variable anomaly classification on EGT, N2 spool vibration harmonics, and hydraulic pressure.
  - ATA Chapter work order dispatch (ATA 72 Engines, ATA 29 Hydraulics, ATA 32 Landing Gear, ATA 21 Pressurization).
- **🛸 3D Digital Twin Subsystem Inspector (Three.js)**:
  - Interactive 3D aircraft model with 360° orbit controls and rotating turbofan blades.
  - Render modes: Solid, Wireframe, X-Ray, and Thermal Heatmap.
  - Subsystem fault injection simulation (HPT Thermal Creep, Hydraulic Circuit B Pressure Drop, Fuel Nozzle Clogging, Pitot Icing).
- **🛡️ Flight Safety Intelligence & SMS (ICAO Annex 19)**:
  - 5×5 Hazard Risk Matrix for operational risk assessment.
  - FOQA / FDM exceedance analytics for high descent rates, unstabilized approaches, and flap overspeeds.
  - Interactive Quick Reference Handbook (QRH) checklists.
- **🧠 AeroAI Aviation Copilot**:
  - Aviation-specialized AI assistant for AMM, FCOM, and emergency diversion analysis.
  - Synthetic ATC VHF radio voice readback with authentic squelch sound effects.
- **🏢 Airport Operations Hub**: Real-time runway throughput, crosswind vector breakdown, and gate turnaround Gantt tracking (Deplaning, Refueling, Catering, Baggage, Boarding, Pushback).
- **⛅ Weather & Turbulence Intelligence**: Live METAR & TAF decoders, flight category indicators (VFR, MVFR, IFR), and severe weather SIGMET bulletins.
- **🌿 Fuel Optimization & Sustainability**: FMS Cost Index (CI) optimization, Continuous Descent Operations (CDO) tracking, and Sustainable Aviation Fuel (SAF) lifecycle CO2 calculator.
- **👥 Role-Based Personas**: Dedicated operational views for Chief Airline Operations Controller, Lead CAMO Engineer, Director of Flight Safety, Airport Operations Administrator, and VP Flight Operations.

---

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Bundler & Tooling**: Vite 5, PostCSS, Autoprefixer
- **Styling**: Tailwind CSS, Lucide Icons, Framer Motion
- **3D Graphics**: Three.js WebGL rendering engine
- **Mapping & Geodata**: Leaflet & React-Leaflet with CartoDB Dark Matter tiles
- **Data Visualization**: Chart.js & React-Chartjs-2
- **Document & Data Export**: jsPDF, jsPDF-AutoTable, SheetJS (XLSX)
- **Audio Synthesis**: Web Audio API (ATC radio static burst generator)

### Backend
- **Framework**: Python 3.12, FastAPI, Starlette
- **Server**: Uvicorn ASGI server
- **Validation**: Pydantic v2
- **Analytics & ML**: Scikit-Learn, NumPy, Pandas
- **Networking**: WebSockets for real-time telemetry streaming, CORS middleware

---

## Architecture

```text
       ┌────────────────────────────────────────────────────────┐
       │             Browser Client (React 18 / Vite)           │
       │  - Leaflet World Radar      - Three.js 3D Twin         │
       │  - Telemetry Telemetry Dash - Chart.js Visualizations  │
       │  - AeroAI Voice Assistant   - PDF & Excel Exporters    │
       └──────────────────────────┬─────────────────────────────┘
                                  │ HTTP / REST & WebSockets
                                  ▼
       ┌────────────────────────────────────────────────────────┐
       │             FastAPI Backend (Port 8000)                │
       │  - Route Endpoints: /api/maintenance, /api/ai          │
       │  - WebSocket Telemetry Stream: /ws/telemetry           │
       └──────────────────────────┬─────────────────────────────┘
                                  │
                                  ▼
       ┌────────────────────────────────────────────────────────┐
       │          AI / Machine Learning Prognostics Engine      │
       │  - Weibull Hazard Rate Kinetics                        │
       │  - Multivariate Isolation & Threshold Anomaly Detector │
       │  - Turbofan RUL Estimator (Thermal Creep & Vib Stress) │
       └────────────────────────────────────────────────────────┘
```

---

## Project Structure

```text
Aerovision/
├── .gitignore                     # Git exclusions (dependencies, .env, build outputs)
├── README.md                      # Project documentation and architecture guide
├── run_platform.ps1               # PowerShell dual-service launcher
├── start.bat                      # Windows Batch dual-service launcher
├── backend/
│   ├── .env.example               # Backend environment variable template
│   ├── main.py                    # FastAPI application, routes, and WebSocket server
│   ├── ml_engine.py               # Machine learning prognostics and anomaly detection
│   └── requirements.txt           # Python dependencies
└── frontend/
    ├── .env.example               # Frontend environment variable template
    ├── index.html                 # HTML entry point
    ├── package.json               # Node.js dependencies and scripts
    ├── postcss.config.js          # PostCSS configuration
    ├── tailwind.config.js         # Tailwind styling tokens
    ├── tsconfig.json              # TypeScript root configuration
    ├── tsconfig.node.json         # TypeScript Vite configuration
    ├── vercel.json                # Vercel SPA routing rewrite rules
    ├── vite.config.ts             # Vite build configuration
    └── src/
        ├── App.tsx                # Main platform layout, routing, and persona switcher
        ├── index.css              # Global styles and radar animations
        ├── main.tsx               # React DOM entry point
        ├── components/
        │   ├── AIReroute/         # Intelligent flight rerouting simulator
        │   ├── ATC/               # Air Traffic Control voice and frequency panel
        │   ├── AeroAI/            # AI Copilot assistant with AMM/FCOM integration
        │   ├── Airport/           # Airport radar, runway throughput, and turnarounds
        │   ├── Cockpit/           # Cockpit instrumentation & master warnings
        │   ├── Communications/    # ACARS / CPDLC message log
        │   ├── DigitalTwin/       # Three.js 3D aircraft viewer & fault injector
        │   ├── Executive/         # C-Suite KPI dashboard & reliability analytics
        │   ├── Fleet/             # Leaflet fleet radar & dual-engine telemetry
        │   ├── Fuel/              # Fuel sustainability, Cost Index & SAF calculator
        │   ├── Maintenance/       # Predictive MRO, RUL curves & ATA work orders
        │   ├── Reports/           # Export center for PDF briefings and spreadsheets
        │   ├── Safety/            # ICAO 5x5 hazard matrix, FOQA & QRH checklists
        │   ├── Weather/           # METAR/TAF weather radar & crosswind calculator
        │   └── common/            # Reusable header, navigation, and modal components
        ├── data/                  # Static fleet, airport, and checklist datasets
        ├── services/              # API clients, ML connector, export, and telemetry
        └── types/                 # Shared TypeScript interfaces and aviation types
```

---

## Environment Variables

Safe templates are provided in both the `frontend/` and `backend/` directories.

### Frontend (`frontend/.env.example`)
```env
# AeroAI Copilot optional external LLM providers
VITE_OPENAI_API_KEY=
VITE_GEMINI_API_KEY=

# Aviation Weather API Key (optional)
VITE_WEATHER_API_KEY=

# Backend API URL (defaults to local FastAPI backend)
VITE_API_BASE_URL=http://localhost:8000
```

### Backend (`backend/.env.example`)
```env
# Optional external LLM providers
OPENAI_API_KEY=
GEMINI_API_KEY=

# Live Aviation Data Sources (optional)
OPENSKY_USERNAME=
OPENSKY_PASSWORD=
AVIATIONSTACK_API_KEY=

# Server Configuration
PORT=8000
HOST=0.0.0.0
DEBUG=True
```

> **Note**: Never commit your actual `.env` files containing live keys. `.env` is ignored by `.gitignore`.

---

## Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10, v3.11, or v3.12
- **Git**: Installed and configured

### 1. Clone the Repository
```bash
git clone https://github.com/Hemanth2506/Aerovision.git
cd Aerovision
```

### 2. Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### 3. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
cd ..
```

---

## Running Locally

### Option A: Using the Automated Launchers (Windows)

#### Via Batch File:
Double-click `start.bat` or run:
```cmd
start.bat
```

#### Via PowerShell:
```powershell
.\run_platform.ps1
```

### Option B: Running Services Individually

#### Start Backend (FastAPI):
```bash
cd backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
- API Server: `http://localhost:8000`
- Interactive API Documentation (Swagger): `http://localhost:8000/docs`

#### Start Frontend (React + Vite):
```bash
cd frontend
npm run dev
```
- Web Application: `http://localhost:5173`

---

## Deployment

### Option 1: Frontend on GitHub Pages (Automated CI/CD)
The repository includes an automated workflow in [`.github/workflows/deploy-pages.yml`](file:///.github/workflows/deploy-pages.yml) that builds and deploys AeroVision on every push to `main`:
1. In your GitHub repository, navigate to **Settings** → **Pages**.
2. Under **Build and deployment** → **Source**, select **GitHub Actions**.
3. Every push to `main` builds the Vite frontend and deploys it to:
   **`https://hemanth2506.github.io/Aerovision/`**

### Option 2: Backend on Render Free Web Service
AeroVision includes a turnkey [`render.yaml`](file:///render.yaml) Blueprint to deploy the Python FastAPI backend on Render's Free tier:
1. Go to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Blueprint** (or **New +** → **Web Service**).
3. Connect your repository: `Hemanth2506/Aerovision`.
4. Configure the Web Service:
   - **Root Directory**: `backend`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: `Free`
   - **Health Check Path**: `/health`
5. Click **Deploy Web Service** to launch the live API backend!

### Option 3: Docker Compose (Local or Cloud VM)
Run the entire production stack in isolated containers:
```bash
docker compose up --build -d
```
- Frontend: `http://localhost:5173`
- Backend API & Swagger: `http://localhost:8000/docs`

### Option 4: Static Hosting for Frontend (Vercel / Netlify)
The frontend can also be deployed independently to Vercel or Netlify:
```bash
cd frontend
npm run build
```
Point the build directory to `dist/`. SPA client-side routing is configured via [`frontend/vercel.json`](file:///frontend/vercel.json).

---

## Future Improvements

- **ADS-B Live Stream Integration**: Integration with live OpenSky Network / FlightAware WebSocket feeds.
- **Expanded 3D CAD Models**: High-fidelity GLTF airframe and interior cabin models for specific aircraft types (A350-1000, B777X).
- **Automated NOTAM Parsing**: Natural language parsing of raw Notice to Airmen (NOTAM) bulletins.
- **Flight Simulator Telemetry Bridge**: UDP connector for MSFS 2024 and X-Plane 12 flight simulation data.

---

## License

This project is licensed under the MIT License - see the LICENSE file for details if provided, or use in accordance with project development terms.
