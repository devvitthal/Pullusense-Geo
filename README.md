# PolluSense-Geo

An IoT air quality monitoring platform that collects real-time sensor data from ESP8266 nodes and visualises it on a web dashboard with AQI, temperature, humidity, and GPS location.

---

## Project Structure

```
Pullusense-Geo/
├── Arduino/          # ESP8266 firmware (DHT11 + MQ135 + GPS)
├── Backend/          # Spring Boot REST API (Java 21, PostgreSQL)
└── Frontend/         # React + TypeScript + Vite dashboard
```

---

## Tech Stack

| Layer    | Technology                                    |
| -------- | --------------------------------------------- |
| Firmware | ESP8266, DHT11, MQ135, TinyGPS++, ArduinoJson |
| Backend  | Spring Boot 4, Spring Security, JWT, OAuth2   |
| Database | PostgreSQL (Neon cloud)                       |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4   |

---

## Getting Started

### Prerequisites

- Java 21+
- Node.js 20+
- A PostgreSQL database (local or [Neon](https://neon.tech))
- Google OAuth2 credentials

### 1. Clone

```bash
git clone https://github.com/your-org/Pullusense-Geo.git
cd Pullusense-Geo
```

### 2. Backend

Create `Backend/.env` (see `Backend/.env.example`):

```env
DB_URL=jdbc:postgresql://<host>/<db>?sslmode=require&channelBinding=require
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

JWT_SECRET=your-256-bit-hex-secret
NODE_API_KEY=your-node-api-key
```

Run the backend:

```bash
cd Backend
./gradlew bootRun
# API available at http://localhost:8080
```

### 3. Frontend

```bash
cd Frontend
npm install
npm run dev
# Dashboard available at http://localhost:5173
```

### 4. Arduino

1. Copy `Arduino/Main/secrets.h.example` to `Arduino/Main/secrets.h` and fill in your WiFi credentials and server URL.
2. Flash `Arduino/Main/Main.ino` to your ESP8266 via Arduino IDE.

---

## Environment Variables

| Variable               | Description                        |
| ---------------------- | ---------------------------------- |
| `DB_URL`               | JDBC PostgreSQL connection string  |
| `DB_USERNAME`          | Database user                      |
| `DB_PASSWORD`          | Database password                  |
| `GOOGLE_CLIENT_ID`     | Google OAuth2 client ID            |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret        |
| `JWT_SECRET`           | 256-bit hex key for signing JWTs   |
| `NODE_API_KEY`         | Shared secret for sensor node auth |

---

## Deploying the Backend

The backend includes a multi-stage `Dockerfile` (Java 21 / Alpine). Build and run locally:

```bash
cd Backend

# Build
docker build -t pollusense-geo-backend .

# Run (pass all secrets as env vars — never bake them into the image)
docker run -p 8080:8080 \
  -e DB_URL="jdbc:postgresql://..." \
  -e DB_USERNAME="..." \
  -e DB_PASSWORD="..." \
  -e GOOGLE_CLIENT_ID="..." \
  -e GOOGLE_CLIENT_SECRET="..." \
  -e JWT_SECRET="..." \
  -e NODE_API_KEY="..." \
  pollusense-geo-backend
```

### Recommended cloud platforms

| Platform             | How to deploy                                                   |
| -------------------- | --------------------------------------------------------------- |
| **Railway**          | Connect GitHub repo → Railway auto-detects `Backend/Dockerfile` |
| **Render**           | New Web Service → Docker → set env vars in dashboard            |
| **Fly.io**           | `cd Backend && fly launch` (reads Dockerfile automatically)     |
| **Google Cloud Run** | `gcloud run deploy` after pushing to Artifact Registry          |

> **Note:** Vercel does not support Spring Boot / Docker containers. Use one of the platforms above for the backend.

---

## API Endpoints

| Method | Path                                | Auth    | Description                 |
| ------ | ----------------------------------- | ------- | --------------------------- |
| POST   | `/api/auth/register`                | Public  | Register a new user         |
| POST   | `/api/auth/login`                   | Public  | Login, returns JWT          |
| GET    | `/api/user/profile`                 | JWT     | Get current user profile    |
| PUT    | `/api/user/profile`                 | JWT     | Update name / password      |
| POST   | `/api/sensor-data`                  | API Key | Ingest a sensor reading     |
| GET    | `/api/sensor-data/latest`           | JWT     | Latest reading per node     |
| GET    | `/api/sensor-data/latest/{nodeId}`  | JWT     | Latest reading for one node |
| GET    | `/api/sensor-data/history/{nodeId}` | JWT     | Full history for one node   |

---

## License

MIT
