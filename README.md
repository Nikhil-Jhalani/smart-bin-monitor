# 🗑️ SmartBin Monitor — Municipal Waste Management Platform

> An agentic, modern, IoT-ready Smart Dustbin Monitoring System designed for municipal corporations, waste management operators, and smart city sanitation teams. Built for college startup presentations and real-world scalability.

---

## 🌟 1. Project Overview & Startup Value Proposition

Traditional municipal waste collection relies on **fixed, blind schedules**: sanitation trucks drive daily routes regardless of whether bins are completely empty or overflowing.

### Problems Solved:
1. **Overflowing Dustbins & Bad Odor:** Real-time alerting prevents public health hazards and pest accumulation.
2. **Wasted Fuel & Labor:** Cleaning crews are only dispatched to bins that actually require service.
3. **Route Optimization:** Reduces municipal fleet fuel consumption by up to **35%** and cuts urban CO₂ emissions.
4. **Accountability & Auditing:** Automated cleaning history logs record exactly when, where, and by whom each dustbin was serviced.

---

## 🚀 2. Quick Start Guide (How to Run the Application)

### Prerequisites:
- **Node.js** (v18 or higher — tested on Node.js v24)
- **npm** (v9 or higher)

### Run with a Single Command:

```bash
# 1. Navigate to the project directory:
cd /Users/nikhilkhandelwal/.gemini/antigravity/scratch/smart-bin-monitor

# 2. Start both the Backend API and Frontend web client:
npm start
```

- **Frontend Municipal Dashboard:** Open **[http://localhost:3000](http://localhost:3000)** (or `http://localhost:5001`)
- **Backend REST API:** Running at **[http://localhost:5001/api](http://localhost:5001/api)**
- **ESP32 Telemetry Endpoint:** **`POST http://localhost:5001/api/telemetry`**

> **Note on macOS Ports:** The server runs on **Port 5001** to avoid conflicts with macOS AirPlay Receiver (which uses port 5000).

---

## 📊 3. Municipal Status Color Scheme

| Status | Fill Level | Color Indicator | Meaning & Action Required |
| :--- | :--- | :--- | :--- |
| **Normal** | 0% – 39% | 🟢 **Green** | Low/empty capacity. No action required. |
| **Partially Full** | 40% – 79% | 🟡 **Yellow** | Moderate waste accumulation. Monitoring active. |
| **Cleaning Recommended** | 80% – 89% | 🟠 **Orange-Red** | Approaching threshold. Schedule for upcoming shift. |
| **Bin Almost Full** | 90% – 99% | 🔴 **Red** | High urgency dispatch notice. |
| **Urgent / Overflowing** | 100% | 🔴 **Red (Pulsing)** | Immediate dispatch required to prevent street litter. |
| **Cleaning Overdue** | Any fill level | 🟠 **Orange** | Not cleaned for &gt; 3 days (bad smell / hygiene alert). |

---

## 🏗️ 4. Project Structure

```text
smart-bin-monitor/
├── server/                       # Node.js + Express REST API Backend
│   ├── index.js                  # Server entry point & static file serving
│   ├── db.js                     # File-backed JSON database store with memory cache
│   ├── alertEngine.js            # Automated municipal threshold rules evaluation
│   ├── data/                     # Persistent JSON data files
│   │   ├── bins.json             # Dustbin records with GPS coords & fill history
│   │   ├── alerts.json           # Active & historical notification events
│   │   ├── history.json          # Verified cleaning audit logs
│   │   └── settings.json         # Threshold configuration
│   └── routes/                   # Clean RESTful API endpoints
│       ├── bins.js               # CRUD, simulate, and mark-as-cleaned actions
│       ├── alerts.js             # Listing, read/unread status, and dismissals
│       ├── history.js            # Cleaning audit logs & fuel savings metrics
│       ├── telemetry.js          # ESP32 IoT hardware ingest endpoint
│       ├── demo.js               # Teacher presentation presets & simulation ticks
│       ├── stats.js              # Aggregated KPI statistics for dashboard
│       └── settings.js           # Configurable overdue days & thresholds
│
├── src/                          # React + TypeScript + Tailwind CSS Frontend
│   ├── components/               # Modular UI components
│   │   ├── Sidebar.tsx           # Municipal navigation & live system status
│   │   ├── Navbar.tsx            # Header, demo controls, and last updated time
│   │   ├── StatsCards.tsx        # 6 Core KPI cards with green/yellow/red/orange badges
│   │   ├── BinTable.tsx          # Bins list with search, filters, table/card toggle
│   │   ├── BinVisualGauge.tsx    # 3D cylinder waste gauge with fill percentage
│   │   ├── BinDetailModal.tsx    # Detailed bin view with history & live slider
│   │   ├── MapView.tsx           # Interactive Leaflet GIS map with custom markers
│   │   ├── AlertsView.tsx        # Real-time incident & threshold dispatch list
│   │   ├── CleaningHistoryView.tsx # Environmental analytics & cleaning audit log
│   │   ├── SimulationPanel.tsx   # Teacher presentation presets & auto-fill engine
│   │   ├── HardwareDocsView.tsx  # ESP32 docs, cURL examples, & live packet tester
│   │   ├── AddBinModal.tsx       # Modal form to register new dustbins
│   │   └── SettingsModal.tsx     # Configurable thresholds modal
│   ├── services/
│   │   └── api.ts                # Client API wrapper connecting to backend
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces for Bin, Alert, Telemetry
│   ├── utils/
│   │   └── formatters.ts         # Color mapping, badge styles, and date formatters
│   ├── App.tsx                   # Main application state and tab orchestrator
│   ├── main.tsx                  # React DOM entry point
│   └── index.css                 # Tailwind CSS v4 styling & animations
│
├── firmware/                     # Microcontroller Firmware
│   └── esp32_smart_bin.ino       # Ready-to-flash C++ sketch for ESP32 + HC-SR04
│
├── dist/                         # Pre-compiled high-performance production build
├── package.json                  # Dependencies & npm scripts
├── vite.config.ts                # Vite config with Tailwind & backend proxy
└── README.md                     # Comprehensive project documentation
```

---

## 💾 5. How the Database Works

The MVP uses a **file-backed JSON database engine** (`server/db.js`) stored in `server/data/`:
- **Zero External Setup Required:** No Docker, PostgreSQL, or MongoDB installation needed for your demonstration.
- **Persistent Across Restarts:** When you adjust fill levels, mark bins as cleaned, or register new bins, changes persist to disk automatically.
- **Memory Cached:** Super-fast in-memory reads with atomic write operations.
- **Easy Reset:** The "Reset Preset" button resets all data back to the clean presentation state instantly.

---

## 🎛️ 6. How Simulated Data & Demo Mode Works

Since the physical ESP32 hardware is not yet in the field, the system includes a **Demonstration Engine** (Sections 9 & 13):

### Preset Demo Bins:
- **`BIN-001`**: 25% — Normal (Green)
- **`BIN-002`**: 55% — Partially Full (Yellow)
- **`BIN-003`**: 82% — Cleaning Recommended (Orange)
- **`BIN-004`**: 94% — Almost Full (Red)
- **`BIN-005`**: 100% — Urgent / Immediate Dispatch (Red)
- **`BIN-006`**: 42% — Cleaning Overdue (&gt; 3 days uncleaned)

### Presentation Features:
1. **Interactive Fill Sliders:** Adjust any bin's level from 0% to 100% with immediate visual updates.
2. **Dynamic Live Engine:** Toggle the engine to simulate people throwing trash into bins in real-time (+3% to +8% per interval).
3. **One-Click Scenarios:**
   - *Standard 5 Bins Preset*
   - *Rush Hour Peak Surge* (bins fill to 85%–100%)
   - *Overflow Emergency* (critical bins hit 100%)
   - *Post-Shift Reset* (all bins emptied to 0%)

---

## 🧹 7. Cleaning Management Workflow

When a sanitation worker or operator marks a bin as **"Cleaned"**:
1. Fill level resets to **0%**.
2. Status resets to **Normal (Green)**.
3. Active cleaning alerts for that bin are **automatically resolved**.
4. An immutable audit record is added to **Cleaning History** with timestamp, operator team, pre-clean fill level, and notes.
5. Environmental metrics (liters of fuel saved, avoided CO₂) are incremented.

---

## 📡 8. Future ESP32 Hardware Integration

The system includes a production-ready telemetry endpoint designed specifically for microcontrollers.

### Data Structure (Section 10 Specification):
```json
{
  "bin_id": "BIN-001",
  "fill_level": 85,
  "latitude": 28.6139,
  "longitude": 77.2090,
  "timestamp": "2026-10-02T10:00:00Z",
  "battery_level": 94,
  "device_status": "online"
}
```

### Sensor Hardware Circuit:
- **Ultrasonic Sensor (HC-SR04):** Mounted under the bin lid pointing down.
- **Formula:**
  $$\text{Fill Percentage} = \frac{\text{Total Bin Height} - \text{Measured Distance}}{\text{Total Bin Height}} \times 100$$
- **Communication:** ESP32 connects to municipal Wi-Fi or 4G GSM SIM800L module and performs an HTTP POST request to `/api/telemetry`.

### Test with cURL:
```bash
curl -X POST http://localhost:5001/api/telemetry \
  -H "Content-Type: application/json" \
  -d '{
    "bin_id": "BIN-001",
    "fill_level": 92,
    "battery_level": 88,
    "device_status": "online"
  }'
```

---

## ⚙️ 9. REST API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Server health check and timestamp |
| `GET` | `/api/bins` | List all bins (supports `status`, `priority`, `search` filters) |
| `GET` | `/api/bins/:id` | Fetch single bin with fill history and active alerts |
| `POST` | `/api/bins` | Register a new dustbin |
| `POST` | `/api/bins/:id/clean` | Mark bin as cleaned (resets fill to 0%, logs history) |
| `POST` | `/api/bins/:id/simulate` | Adjust fill level via slider (0–100) |
| `POST` | `/api/telemetry` | **ESP32 Hardware Ingest Endpoint** |
| `GET` | `/api/alerts` | List threshold alerts (filter by read/unread) |
| `PUT` | `/api/alerts/:id/read` | Mark alert as read |
| `PUT` | `/api/alerts/mark-all-read` | Mark all alerts as read |
| `GET` | `/api/history` | Fetch cleaning audit log |
| `GET` | `/api/stats` | Aggregated municipal KPIs for dashboard |
| `POST` | `/api/demo/reset` | Reset dataset to initial 5 presentation bins |
| `POST` | `/api/demo/scenario` | Apply preset scenario (`rush_hour`, `urgent_crisis`, etc.) |
| `GET` | `/api/settings` | Get alert threshold settings |
| `PUT` | `/api/settings` | Update overdue days and fill level thresholds |

---

## 🎓 10. Teacher / Viva Presentation Checklist

When demonstrating this project to your teachers or examiners:

1. **Start on the Dashboard:** Explain the 6 KPI cards and point out the color coding (**Green** = Normal, **Yellow** = Partial, **Orange** = Overdue, **Red** = Urgent).
2. **Show the 5 Demo Bins:** Explain that `BIN-001` through `BIN-005` represent the progressive lifecycle of municipal waste.
3. **Open the Live City GIS Map:** Show how markers display colored fill badges and that urgent bins pulse with an alert animation. Click a marker to open its popup and show the one-click clean action.
4. **Trigger an Alert in Front of Them:** Go to the **Demo & Simulation** tab, move a slider on `BIN-001` from 25% to 92%, and show how the **Alerts Center** instantly generates a "Bin Almost Full" alert.
5. **Demonstrate Cleaning Workflow:** Click **"Mark as Cleaned"** on `BIN-004` (94%). Show that the fill level resets to 0%, the active alert disappears, and a verified entry is added to **Cleaning History**.
6. **Show Hardware Readiness:** Navigate to the **ESP32 Hardware API** tab. Point out the ultrasonic distance formula, show the included `firmware/esp32_smart_bin.ino` sketch, and use the **Live Hardware Telemetry Tester** to send a real HTTP payload.
