# FinSight

AI-powered personal finance management with voice-enabled expense capture, financial analytics, and offline-capable PWA behavior.

---

## Overview

FinSight is built for users who want a smarter, faster way to track spending and monitor financial health. The application combines expense management, real-time analytics, AI-backed recommendations, and Firebase persistence into a responsive web experience.

Key capabilities:
- Expense logging by manual input or voice
- Auto-category detection for spending
- Dashboard analytics with charts and trends
- Savings and investment guidance
- Offline support with Firestore persistence

---

## Live Demo

The project is hosted on Vercel:

https://finsight-ai-finance-manager.vercel.app/

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Firebase Configuration](#firebase-configuration)
- [Development](#development)
- [Production](#production)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

### Expense Management
- Manual expense entry with merchant, category, date, and notes
- Voice-based expense capture with natural language parsing
- Automatic expense categorization across key spending groups
- Search and filter for faster transaction recovery
- Cloud sync through Firestore

### Analytics and Insights
- Financial dashboard with totals, balances, and savings rate
- Category breakdown using visual charts
- Weekly spend trends and comparison
- AI-driven expense analysis with tailored suggestions

### Financial Planning
- Personalized allocation recommendations
- Investment suggestion module
- Financial goal planning and progress tracking
- Wealth projection and simulation tools

### UX and Platform
- Responsive layout for desktop and mobile
- PWA-ready installable experience
- Offline persistence via IndexedDB
- Real-time status and toast notifications

---

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- Firebase Authentication + Firestore
- Recharts
- React Router DOM
- Axios
- Vite PWA Plugin

---

## Architecture

The application is structured to separate UI, business logic, and platform integration:

- `src/components/` — reusable UI and feature components
- `src/pages/` — route-based views like Dashboard, Expenses, Analytics
- `src/hooks/` — custom hooks such as voice recognition and expense parsing
- `src/services/` — data access, AI services, theme and settings logic
- `src/context/` — global state providers
- `src/firebase.js` — Firebase initialization and persistence handling

This layout supports modular development and simplifies feature extension.

---

## Project Structure

```text
src/
├── components/
│   ├── common/          # Business-facing shared components
│   ├── layout/          # Page structure and navigation
│   └── ui/              # Generic UI primitives
├── context/             # React context providers
├── hooks/               # Custom hooks and feature logic
├── pages/               # Application views / routes
├── services/            # Backend and AI helpers
├── utils/               # Utility functions and helpers
├── firebase.js          # Firebase configuration and persistence
└── main.jsx             # Application entry point
```

---

## Installation

### Prerequisites

- Node.js 16+
- npm or yarn

### Setup

```bash
git clone https://github.com/AyushBaware/finsight-ai-finance-manager.git
cd finsight-ai-finance-manager
npm install
```

---

## Firebase Configuration

Firebase is initialized in `src/firebase.js` using the current `finsight-web` project configuration.

To use your own Firebase project:
1. Create a Firebase project
2. Enable Google Authentication
3. Create a Firestore database
4. Replace the config values in `src/firebase.js`

The app includes offline persistence handling using Firestore and IndexedDB.

---

## Development

```bash
npm run dev
```

Open the local URL shown by Vite (typically `http://localhost:5173`).

### Recommended Browser

For the best voice recognition experience, use Chrome or Microsoft Edge. Localhost is treated as a secure context, so microphone access should work without HTTPS.

---

## Production

```bash
npm run build
npm run preview
```

---

## Deployment

This section explains the recommended deployment options for FinSight.

### Deploy to Vercel

Vercel is the easiest option for deploying a Vite application.

```bash
npm install -g vercel
vercel
```

When prompted, select the current project directory and set the framework to `Vite`.

### Deploy to Firebase Hosting

Firebase Hosting is the preferred option when using Firestore and Firebase Authentication.

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

During `firebase init hosting`, choose your Firebase project and configure the public directory as `dist`.

### Deploy to Netlify

```bash
npm run build
```

Then deploy the generated `dist/` folder to Netlify using the web UI or the Netlify CLI.

---

## Troubleshooting

- **Voice recognition does not work:** verify microphone permission, use Chrome/Edge, and ensure the browser input device is correct.
- **SpeechRecognition unsupported:** Firefox has limited Web Speech API support for recognition.
- **Offline persistence issues:** check IndexedDB availability and browser storage settings.
- **Firestore sync issues:** inspect browser console for Firebase errors and validate authentication status.

---

## License

MIT License
