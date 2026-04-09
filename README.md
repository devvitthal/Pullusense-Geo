# PolluSense-Geo 🌍🌬️

**PolluSense-Geo** is a comprehensive, end-to-end IoT air quality monitoring and visualization platform. It collects real-time environmental data—including Air Quality Index (AQI), temperature, humidity, and precise GPS locations—from custom-built ESP8266 sensor nodes and visualizes them on an intuitive, interactive web dashboard.

Beyond just data collection, PolluSense-Geo aims to increase environmental awareness and empower users to make health-conscious decisions based on the air quality in their immediate surroundings.

---

## ✨ Key Features

### 📊 Real-Time Environmental Monitoring

- **Air Quality Index (AQI):** Calculates and displays real-time AQI values based on gas concentrations.
- **Climate Data:** Accurately tracks temperature and humidity levels.
- **Live Updates:** Sensor nodes push data to the backend in real-time.

### 🗺️ Interactive Maps & Geo-Tracking

- **Geo-Spatial Visualization:** View all active sensor nodes on an interactive map.
- **Saved Locations:** Users can save their favorite or most visited locations for quick access to air quality metrics.

### 📈 Historical Data & Analytics

- **Trend Analysis:** View historical data through interactive charts and tables.
- **Node History:** Dive deep into the performance and historical readings of specific sensor nodes over time.

### 🚨 Health Alerts & Push Notifications

- **Health Banners:** In-app visual alerts when air quality drops to unhealthy levels.
- **Push Notifications:** Web Push integration (Service Workers) to notify users of critical pollution spikes even when the app is closed.

### 🔐 Secure Identity Management

- **OAuth2 Integration:** Seamless login using Google accounts.
- **JWT Authentication:** Secure standard email/password registration and session management.
- **User Profiles:** Personalized dashboards and profile management.

---

## 🏗️ System Architecture & Tech Stack

The project is divided into three distinct layers:

| Layer                  | Technologies Used                                   | Description                                                                                                                   |
| :--------------------- | :-------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------- |
| **IoT / Firmware**     | ESP8266, DHT11, MQ135, TinyGPS++, Arduino IDE       | The hardware nodes that read analog/digital sensor data, attach GPS coordinates, and transmit payloads via WiFi to the cloud. |
| **Backend API**        | Java 21, Spring Boot 3, Spring Security, PostgreSQL | A robust RESTful API handling data ingestion, user authentication, OAuth2 flows, and historical data querying.                |
| **Frontend Dashboard** | React 19, TypeScript, Vite, Tailwind CSS v4         | A fast, responsive, mobile-friendly Single Page Application (SPA) providing data visualization and user interaction.          |

---

## 📁 Project Structure

```text
PolluSense-Geo/
├── Arduino/          # ESP8266 C++ firmware (DHT11 + MQ135 + GPS integrations)
├── Backend/          # Spring Boot REST API (Java 21, Gradle, PostgreSQL)
└── Frontend/         # React + TypeScript + Vite dashboard
```

---

## 🚀 Getting Started

### Prerequisites

- Java 21+
- Node.js 20+
- PostgreSQL database (local or [Neon](https://neon.tech))
- Google Cloud Console account (for OAuth2 credentials)

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/PolluSense-Geo.git
cd PolluSense-Geo
```

### 2. Backend Setup

Create a `Backend/.env` file based on `.env.example`:

```env
DB_URL=jdbc:postgresql://<host>/<db>?sslmode=require&channelBinding=require
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

JWT_SECRET=your-256-bit-hex-secret
NODE_API_KEY=your-node-api-key
```

Run the backend server:

```bash
cd Backend
./gradlew bootRun
# The API will be available at http://localhost:8080
```

### 3. Frontend Setup

```bash
cd Frontend
npm install
npm run dev
# The Dashboard will be available at http://localhost:5173
```

### 4. Hardware Node Setup (Arduino)

1. Copy `Arduino/Main/secrets.h.example` to `Arduino/Main/secrets.h`.
2. Fill in your local WiFi credentials and the Backend Server URL (with the `NODE_API_KEY`).
3. Connect your sensors (DHT11, MQ135, GPS) to the ESP8266 according to the pinout definitions.
4. Flash `Arduino/Main/Main.ino` using the Arduino IDE.

---

## 🔐 Environment Variables Reference

| Variable               | Description                                                     |
| :--------------------- | :-------------------------------------------------------------- |
| `DB_URL`               | JDBC PostgreSQL connection string                               |
| `DB_USERNAME`          | Database user                                                   |
| `DB_PASSWORD`          | Database password                                               |
| `GOOGLE_CLIENT_ID`     | Google OAuth2 client ID                                         |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret                                     |
| `JWT_SECRET`           | 256-bit hex key for signing secure JWTs                         |
| `NODE_API_KEY`         | Shared secret for authenticating automated sensor node requests |

---

## ☁️ Deployment Guide

The backend includes an optimized, multi-stage `Dockerfile` (Java 21 / Alpine).

### Running Locally with Docker

```bash
cd Backend
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

### Recommended Cloud Platforms

| Platform    | Deployment Strategy                                                          |
| :---------- | :--------------------------------------------------------------------------- |
| **Railway** | Connect GitHub repo → Railway auto-detects `Backend/Dockerfile`              |
| **Render**  | New Web Service → Docker → set env vars in the dashboard                     |
| **Fly.io**  | `cd Backend && fly launch` (reads Dockerfile automatically)                  |
| **Vercel**  | Recommended for **Frontend only**. Use `npm run build` as the build command. |

---

## 📡 API Endpoints Overview

| Method | Path                                | Auth Required | Description                                  |
| :----- | :---------------------------------- | :------------ | :------------------------------------------- |
| POST   | `/api/auth/register`                | None          | Register a new user                          |
| POST   | `/api/auth/login`                   | None          | Login, returns JWT                           |
| GET    | `/api/user/profile`                 | JWT           | Get current user profile                     |
| PUT    | `/api/user/profile`                 | JWT           | Update name / password                       |
| POST   | `/api/sensor-data`                  | API Key       | Ingest a sensor reading from an ESP8266 node |
| GET    | `/api/sensor-data/latest`           | JWT           | Latest reading per node                      |
| GET    | `/api/sensor-data/latest/{nodeId}`  | JWT           | Latest reading for a specific node           |
| GET    | `/api/sensor-data/history/{nodeId}` | JWT           | Full history for a specific node             |

---

## 📄 License & Contributing

This project is licensed under the MIT License. Feel free to fork, explore, and submit pull requests if you want to contribute to the platform!
