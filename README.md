# INV▸MGR — Inventory Manager v2

A real-time inventory tracking dashboard with an AI-powered assistant, built with React + Vite.

## Features

- **Landing Page** — Marketing site with hero, features grid, CTA, and animated ticker
- **AI Console** — Chat with Claude about your inventory data with markdown rendering and typing animation
- **Stock Table** — Full inventory overview with filters, search, edit, and delete
- **Analytics** — Charts showing stock health, warehouse breakdown, and reorder priorities
- **CRUD** — Add, edit, and delete inventory items via modal

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Create a `.env` file in the project root:

```
VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

## Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── main.jsx
├── App.jsx
├── context/
│   └── InventoryContext.jsx   # State management + CRUD
├── data/
│   └── inventory.js           # Initial data + constants
├── components/
│   ├── ui.jsx                 # Shared components
│   ├── Navbar.jsx
│   ├── LandingPage.jsx
│   ├── Dashboard.jsx          # Shell with 3 tabs
│   ├── StockTable.jsx         # Table with filters + actions
│   ├── ChatPanel.jsx          # AI chat with markdown + typing
│   ├── Analytics.jsx          # Charts + stats
│   └── ItemModal.jsx          # Add/edit modal
└── styles/
    ├── global.css
    ├── navbar.css
    ├── landing.css
    ├── dashboard.css
    ├── stock-table.css
    ├── chat.css
    ├── modal.css
    └── analytics.css
```

## Tech Stack

- React 18 + Vite 6
- Recharts (charts)
- Claude API (AI assistant)
- Bebas Neue + DM Mono + DM Sans
