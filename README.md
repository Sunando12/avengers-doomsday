# 🛡️ Avengers: Doomsday — Mission Command Center

> A premium, interactive web application for Marvel fans to track heroes, manage missions, monitor threat levels, and sync events with Google Calendar.

![Theme: Doomsday Dark](https://img.shields.io/badge/Theme-Doomsday%20Dark-e63946)
![Vite](https://img.shields.io/badge/Vite-5.x-646cff)
![Chart.js](https://img.shields.io/badge/Chart.js-4.x-ff6384)

---

## ✨ Features

- **5 Premium Themes** — Doomsday Dark, Infinity Stones, Multiverse Madness, Stark Tech, Asgardian Gold
- **Interactive Particle Background** — Canvas-based floating nodes that react to cursor movement with a toggle for reduced motion
- **Hero Roster** — Add, edit, delete, filter, and search heroes with beautiful glassmorphic cards
- **Mission Control (Kanban)** — Drag-and-drop mission board with planning, active, critical, and completed columns
- **Interactive Charts** — Threat gauge, readiness doughnut, mission trends, power distribution, radar comparisons, and more (Chart.js)
- **Google Calendar Integration** — OAuth 2.0 flow to fetch, create, and delete events on your Google Calendar
- **Demo Mode** — Fully functional with mock data when no Google credentials are configured
- **Local Persistence** — All data (heroes, missions, events, theme) saved to localStorage
- **Responsive Design** — Mobile-first layout that works on phones, tablets, and desktops
- **Toast Notifications & Modal Dialogs** — Instant user feedback for all actions

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
cd avengers-doomsday
npm install
```

### 2. Configure Google Calendar (Optional)

```bash
cp .env.example .env
```

Edit `.env` with your Google Cloud Console credentials. See the detailed guide below.

### 3. Run

```bash
npm run dev
```

The app opens at `http://localhost:5173`.

---

## 🔑 Google Calendar Setup Guide

### Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Name it (e.g., "Avengers Doomsday") and click **Create**

### Step 2: Enable the Google Calendar API
1. Navigate to **APIs & Services** → **Library**
2. Search for **Google Calendar API**
3. Click **Enable**

### Step 3: Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. If prompted, configure the **OAuth consent screen** first:
   - User Type: **External**
   - Fill in required fields (app name, email)
   - Add scope: `https://www.googleapis.com/auth/calendar.events`
4. Back in Credentials, create the OAuth Client:
   - Application type: **Web application**
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:5173`
5. Copy the **Client ID**

### Step 4: Create an API Key
1. Click **Create Credentials** → **API Key**
2. Restrict the key to **Google Calendar API** only
3. Copy the **API Key**

### Step 5: Configure the App
Paste both values into your `.env` file:
```env
VITE_GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=AIzaSy...
```

---

## 📁 Project Structure

```
avengers-doomsday/
├── index.html              # Main HTML (full app shell)
├── vite.config.js          # Vite configuration
├── .env.example            # Environment variables template
├── package.json            # Dependencies
├── public/                 # Static assets
└── src/
    ├── main.js             # App entry — orchestrates all modules
    ├── styles/
    │   └── main.css        # Complete design system & themes
    ├── modules/
    │   ├── particles.js    # Canvas particle background
    │   ├── themes.js       # Theme switcher & persistence
    │   ├── modal.js        # Modal dialog system
    │   ├── toast.js        # Toast notifications
    │   ├── storage.js      # localStorage persistence
    │   ├── calendar.js     # Google Calendar integration
    │   └── charts.js       # All Chart.js instances
    └── data/
        └── mock-data.js    # Default heroes, missions & events
```

---

## 🎨 Themes

| Theme | Accent | Vibe |
|-------|--------|------|
| Doomsday Dark | `#e63946` Red | Default — menacing and bold |
| Infinity Stones | `#a855f7` Purple | Cosmic and mystical |
| Multiverse Madness | `#06b6d4` Cyan | Dimensional and electric |
| Stark Tech | `#3b82f6` Blue | Clean and futuristic |
| Asgardian Gold | `#d4a017` Gold | Regal and divine |

---

## 📜 License

MIT — Built with ❤️ for Marvel fans.
