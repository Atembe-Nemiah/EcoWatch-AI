# EcoSmart AI

**Intelligent Waste Identification, Resource-Recovery Guidance & Experimental Device Monitoring**

An AI-powered environmental intelligence platform that helps communities report environmental pollution, analyse waste through AI-assisted classification, recommend resource-recovery pathways, and monitor experimental IoT sensor readings.

## Features

- 🗂️ **Waste Report Submission** — Upload images and descriptions of environmental waste
- 🤖 **AI-Assisted Classification** — Automatic waste categorisation with uncertainty labelling
- ♻️ **Resource Recovery Recommendations** — Category-to-pathway mapping for responsible waste handling
- 👤 **Human Review & Correction** — Reviewers can confirm or correct AI suggestions
- 📡 **IoT Device Monitoring** — ESP32 telemetry ingestion with experimental MQ-6 sensor readings
- 📊 **Environmental Dashboard** — Real-time statistics, charts and activity tracking

## Important Disclaimer

This is a **hackathon prototype** for decision support and monitoring. It does not control industrial equipment. AI suggestions are suggestions only — human review confirms. The MQ-6 readings are **experimental gas-sensor responses**, not certified methane or biogas measurements.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript, Chart.js |
| Backend | Node.js, Express.js |
| Database | SQLite (better-sqlite3) |
| AI | Gemini API (vision-capable model) |
| IoT | ESP32 REST API telemetry |

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- (Optional) Gemini API key for AI features

### Installation

```bash
# Clone or navigate to the project
cd eco-watch-ai

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env and add your AI_API_KEY if available

# Start the server
npm start
```

The application will be available at **http://localhost:3000**

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `DATABASE_PATH` | SQLite database path | `./data/ecowatch.sqlite` |
| `AI_API_KEY` | Gemini API key (optional) | — |
| `AI_MODEL` | AI model name | `gemini-2.0-flash` |
| `DEVICE_SECRET` | ESP32 device auth secret | — |
| `SESSION_SECRET` | Session secret | — |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/reports` | Create waste report |
| GET | `/api/reports` | List reports |
| GET | `/api/reports/:id` | Get report detail |
| POST | `/api/reports/:id/analyse` | Trigger AI analysis |
| PATCH | `/api/reports/:id/review` | Submit review |
| GET | `/api/recovery-routes` | List recovery routes |
| GET | `/api/devices` | List devices |
| POST | `/api/device/telemetry` | Receive ESP32 telemetry |
| GET | `/api/devices/:id/telemetry` | Device telemetry history |
| GET | `/api/dashboard/summary` | Dashboard data |

## Project Structure

```
eco-watch-ai/
├── public/          # Frontend assets
│   ├── index.html
│   ├── css/styles.css
│   └── js/          # Client-side JavaScript
├── src/             # Backend source
│   ├── server.js
│   ├── config/      # Database configuration
│   ├── routes/      # API route definitions
│   ├── controllers/ # Request handlers
│   ├── services/    # Business logic
│   ├── middleware/   # Auth, upload, error handling
│   └── validators/  # Request validation
├── database/        # SQL schema
├── uploads/         # Uploaded images
└── data/            # SQLite database
```

## Demo Mode

The application seeds demo data on first start, including:
- Sample waste reports with categories
- Pre-configured recovery routes
- A registered ESP32 device with telemetry readings
- Default admin and reviewer accounts

**Default login:** admin@ecowatch.local (Demo mode — no password required)

## License

ISC — Hackathon prototype

