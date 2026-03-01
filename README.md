# INV▸MGR — Inventory Manager v2

Real-time inventory tracking with AI assistant, user accounts, and cloud storage.

## Features

- **User Auth** — Email/password signup and login via Firebase
- **Per-User Data** — Each user gets their own inventory stored in Firestore
- **AI Console** — Chat with Claude about your inventory (markdown + typing animation)
- **Stock Table** — Filter, add, edit, delete inventory items
- **Analytics** — Charts showing stock health, warehouse breakdown, reorder priorities
- **Real-Time Sync** — Firestore listeners keep everything in sync

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Firebase setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. Add a web app (`</>` icon) and copy the config
4. Enable **Authentication** → Email/Password
5. Create a **Firestore Database** in test mode

### 3. Environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```
VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 4. Run

```bash
npm run dev
```

### 5. Firestore Security Rules (before going live)

In Firebase Console → Firestore → Rules, replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/inventory/{itemId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Build & Deploy

```bash
npm run build
```

Deploy `dist/` to Vercel, Netlify, or Firebase Hosting.

## Project Structure

```
src/
├── main.jsx
├── App.jsx                    # Auth flow routing
├── config/
│   └── firebase.js            # Firebase init
├── context/
│   ├── AuthContext.jsx         # Auth state
│   └── InventoryContext.jsx    # Firestore CRUD + real-time sync
├── data/
│   └── inventory.js           # Seed data + constants
├── components/
│   ├── ui.jsx
│   ├── Navbar.jsx
│   ├── LandingPage.jsx
│   ├── AuthPage.jsx           # Login/Signup
│   ├── Dashboard.jsx
│   ├── StockTable.jsx
│   ├── ChatPanel.jsx
│   ├── Analytics.jsx
│   └── ItemModal.jsx
└── styles/
    ├── global.css
    ├── navbar.css
    ├── landing.css
    ├── auth.css
    ├── dashboard.css
    ├── stock-table.css
    ├── chat.css
    ├── modal.css
    └── analytics.css
```
