# SugarNXT

## Overview
SugarNXT is a real-time AI-powered Command Center for sugar manufacturing plants. It monitors critical machines, predicts failures, and provides operators with a unified dashboard for zero-touch, cane-to-bag automation. Built for the AI-Driven Smart Sugar Factory Hackathon, it leverages advanced AI, 3D visualization, and real-time analytics to eliminate unplanned downtime and maximize efficiency.

## Features
- **Live Command Center Dashboard:** Animated KPIs, real-time plant health, ROI savings ticker, live telemetry charts, and critical failure simulation.
- **3D Digital Factory Twin:** Interactive 3D factory floor with live machine status, steam effects, and immersive inspection panels.
- **AI Alert Engine:** Multi-layer anomaly detection, actionable alerts, severity filtering, session retention, and export options.
- **AI Chat Assistant:** Natural language queries with live sensor context, critical alert badges, and quick query chips.
- **Predictive Failure Countdown:** Per-machine timers, urgency badges, animated progress bars, and accelerated countdowns for critical states.
- **Alert Sound & Notifications:** Web Audio alarms and browser push notifications for critical events.
- **Analytics Page:** Efficiency trends, risk history, alert heatmaps, health indicators, and maintenance cost breakdowns.
- **Alerts Management:** Card and terminal views, severity filters, export, clear/dismiss, and real-time alert counts.

## Architecture
- **Presentation Layer:** Next.js 15 (App Router), React 19, TypeScript
- **Component Layer:** Modular components for dashboard, digital twin, analytics, alerts, and more
- **State Management:** React Context API for machines, alerts, KPIs, session state
- **Logic/Hooks:** Custom hooks for simulation, risk calculation, spike detection, trend analysis, alert generation, and ROI tracking
- **Utilities:** Thresholds and risk calculators for machine-specific logic
- **Rendering Engines:** Recharts (2D charts), Three.js + React Three Fiber (3D), Framer Motion (animations), Tailwind CSS (styling), Web Audio API, Notification API

## Technology Stack
| Technology           | Role                          |
|---------------------|-------------------------------|
| Next.js 15.1.0      | React framework, routing       |
| React 19.0.0        | UI, hooks, context             |
| TypeScript 5.x      | Type safety                    |
| Tailwind CSS 3.4.x  | Styling                        |
| Framer Motion 12.x  | Animations                     |
| Three.js 0.183.x    | 3D rendering                   |
| React Three Fiber 9.x| Three.js bindings              |
| @react-three/drei 10.x| 3D controls/effects           |
| Recharts 3.x        | Charts                         |
| Lucide React 0.575.x| Icons                          |
| Web Audio API       | Alarm sounds                   |
| Notification API    | Push notifications             |
| Bun                 | Package manager                |

## Project Structure
- `app/` — Main pages: dashboard, digital twin, analytics, alerts
- `components/` — UI components: AIChatAssistant, AlertNotificationEngine, ROITicker, DigitalTwin, etc.
- `context/` — FactoryContext for global state
- `hooks/` — Custom hooks for simulation and logic
- `utils/` — Thresholds and risk calculation utilities

## Setup & Installation
1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   ```
2. Install dependencies:
   ```bash
   bun install
   ```
3. Start the development server:
   ```bash
   bun run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage
- Use the dashboard for live KPIs, alerts, and ROI tracking.
- Explore the 3D digital twin for machine status and inspection.
- Trigger critical failure simulation for demo/testing.
- Chat with the AI assistant for predictive insights.
- Export alerts and analytics for maintenance and reporting.

## Future Roadmap
- IoT sensor integration (MQTT, Node.js API)
- Real-time backend (WebSocket, REST)
- Time-series database (InfluxDB, TimescaleDB)
- ML predictive models (TensorFlow.js, scikit-learn)
- Multi-factory deployment (AWS IoT Core, Azure IoT Hub)
- Mobile app (React Native/PWA)

## Hackathon & Team
- Built for: AI-Driven Smart Sugar Factory Hackathon (Feb 2026)
- Team Name: DreamWork
- Demo URL: coming....

## License
[Specify your license here]

---
*SugarNXT v1.0 — Built for the AI-Driven Smart Sugar Factory Hackathon Challenge*

---

## References
- See `HACKATHON_PPT_CONTENT.md` for detailed pitch, features, architecture, and demo script.
