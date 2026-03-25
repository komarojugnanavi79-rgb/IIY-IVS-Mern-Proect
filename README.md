# Online Medicine Reminder System

A complete MERN stack starter for a premium medical reminder platform with JWT auth, medicine scheduling, adherence tracking, caregiver alerts, browser/email notifications, health metrics, family accounts, PDF reporting, and optional SMS support.

## Tech Stack

- MongoDB + Mongoose
- Express + Node.js
- React + Vite
- Tailwind CSS
- Framer Motion
- JWT + bcrypt
- Nodemailer + Web Push API
- Optional Twilio SMS

## Folder Structure

```text
online medicine/
|-- client/
|   |-- public/
|   |   `-- sw.js
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |   |-- common/
|   |   |   |-- dashboard/
|   |   |   `-- layout/
|   |   |-- context/
|   |   |-- hooks/
|   |   |-- pages/
|   |   |-- utils/
|   |   |-- App.jsx
|   |   |-- index.css
|   |   `-- main.jsx
|   |-- .env.example
|   |-- package.json
|   `-- vite.config.js
|-- server/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- utils/
|   |   `-- server.js
|   |-- .env.example
|   `-- package.json
|-- .gitignore
|-- package.json
`-- README.md
```

## Features

- Premium glassmorphism medical UI with blue gradients, hexagon overlays, ECG line art, and animated sections
- Register/login with JWT authentication and bcrypt password hashing
- Add, edit, delete, and manage medicine schedules
- Daily dashboard with taken, missed, and snoozed medicine actions
- Exact-time reminder scheduler using server cron checks every minute
- Browser push notifications with service worker subscription support
- Email reminders with Nodemailer
- Optional Twilio SMS hooks
- Caregiver alerts for missed medicines
- Low stock detection with daily refill warnings
- Health tracking for blood pressure, sugar, weight, and notes
- Family account linking with family code
- PDF report download
- Simple AI-style suggestion engine
- Voice reminders via browser speech synthesis

## Environment Setup

### 1. Backend environment

Copy `server/.env.example` to `server/.env` and fill in the values:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/medicine-reminder
JWT_SECRET=replace-with-strong-secret
CLIENT_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-app-password
SMTP_FROM=Online Medicine Reminder <no-reply@example.com>
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@example.com
```

### 2. Frontend environment

Copy `client/.env.example` to `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_VAPID_PUBLIC_KEY=
```

## Install Commands

Run these from the project root:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

Or use the combined script:

```bash
npm run install-all
```

## Run Commands

### Start frontend and backend together

```bash
npm run dev
```

### Start them separately

```bash
npm --prefix server run dev
npm --prefix client run dev
```

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Medicines

- `GET /api/medicines`
- `POST /api/medicines`
- `PUT /api/medicines/:id`
- `DELETE /api/medicines/:id`
- `GET /api/medicines/schedule/today`
- `PATCH /api/medicines/:id/status`
- `GET /api/medicines/history`

### Profile and health

- `PUT /api/profile`
- `POST /api/profile/push-subscription`
- `GET /api/profile/health`
- `POST /api/profile/health`

### Dashboard and report

- `GET /api/dashboard`
- `GET /api/dashboard/report`

## Notes

- Generate VAPID keys for push notifications before enabling browser alerts.
- For Gmail SMTP, use an app password instead of your normal password.
- Twilio is optional; leave the values empty if you do not need SMS.
- The AI suggestion is rule-based so it works locally without external AI APIs.
- Voice reminders depend on the browser tab being open and speech synthesis being available.

## Recommended Next Improvements

- Add refresh tokens and password reset flows
- Move cron-based reminders to a queue for high-scale production usage
- Add family invite approvals and role-based permissions
- Add chart visualizations for health trends
