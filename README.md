# INV▸MGR — Inventory Manager

A real-time inventory tracking dashboard with an AI-powered assistant, built with React + Vite.

## Features

- **Landing Page** — Marketing site with hero, features grid, CTA, and animated ticker
- **AI Console** — Chat with Claude about your inventory data (stock levels, reorder priorities, warehouse issues)
- **Stock Table** — Full inventory overview with status badges and stock level bars

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for Production

```bash
npm run build
npm run preview
```

The built files will be in the `dist/` directory, ready to deploy to any static host (Vercel, Netlify, Cloudflare Pages, etc).

## Project Structure

```
inventory-manager/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx              # Entry point
    ├── App.jsx               # Root component / page routing
    ├── data/
    │   └── inventory.js      # Stock data, AI prompt, quick prompts
    ├── components/
    │   ├── ui.jsx            # Shared micro-components (Logo, StatusBadge, StockBar)
    │   ├── Navbar.jsx        # Navigation bar
    │   ├── LandingPage.jsx   # Marketing / landing page
    │   ├── Dashboard.jsx     # App shell (header, alerts, tab switching)
    │   ├── StockTable.jsx    # Inventory data table
    │   └── ChatPanel.jsx     # AI chat interface
    └── styles/
        ├── global.css        # Variables, reset, animations
        ├── navbar.css
        ├── landing.css
        ├── dashboard.css
        ├── stock-table.css
        └── chat.css
```

## Tech Stack

- **React 18** — UI framework
- **Vite 6** — Build tool & dev server
- **Claude API** — AI-powered inventory assistant
- **Bebas Neue + DM Mono + DM Sans** — Typography

## Notes

- The AI chat calls the Anthropic API directly from the browser. For production, you'd want to proxy this through a backend to protect your API key.
- Stock data is currently hardcoded in `src/data/inventory.js`. Swap it with a real API or database connection.
