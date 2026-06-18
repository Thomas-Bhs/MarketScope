# MarketScope

MarketScope is a modern financial analysis web application that transforms raw market data into clear, actionable insights.

It combines live stock data, AI-generated analysis, and an elegant UI to provide a smooth exploratory experience.

---

## Features

- 🔍 Company search (name, ticker, sector)
- 🎯 AI-powered company analysis
- 📈 Interactive price chart (7d / 1m / 6m)
- 📰 Latest company news with article links
- ⚡ Async loading states with custom loader
- 🧠 Server-side caching via Next.js Data Cache (survives Vercel cold starts)
- 🎨 Responsive premium UI (glassmorphism + smooth transitions)
- 🌙 Dark-mode optimized interface

---

## Architecture Overview

MarketScope is built with a modular architecture:

- `app/` — Next.js App Router pages
- `app/api/` — Backend routes (Next.js Route Handlers)
- `components/` — Reusable UI components (Carousel, CompanyCard, Footer, Loader)
- `services/` — Client-side API abstraction layer
- `lib/` — Shared server-side utilities (news fetching)
- `domain/` — Typed models and mappers
- `app/utils/` — UI and data utilities

### Data Flow

1. User selects a company from the carousel  
2. User clicks on **"Analyze"**  
3. The analysis section is revealed with a loading state  
4. AI analysis is fetched via `/api/analysis`  
5. Company profile is fetched via Finnhub  
6. Price data is fetched via `/api/prices` (based on selected range: 7d / 1m / 6m)  
7. Data is rendered inside `CompanyCard` (score, summary, chart, news)  
8. Loader disappears once the analysis request resolves (success or error)

---

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- React
- TypeScript
- TailwindCSS
- Victory Charts

### Backend
- Next.js Route Handlers
- External APIs:
  - Finnhub API
  - News API
  - AI analysis endpoint

### UX & Performance
- Server-side caching via Next.js Data Cache (`unstable_cache` + `next.revalidate`)
- AI analysis timeout (10s) with graceful fallback
- Loading fallback protection
- Smooth scroll transitions
- Responsive layout
- Scroll containment
- Optimized async effects

---

## Getting Started

### 1️ - Clone repository

git clone https://github.com/your-username/marketscope.git
cd marketscope

### 2 - Install dependencies

npm install

### 3 - Create .env.local

FINNHUB_API_KEY=your_key_here
MARKETAUX_API_TOKEN=your_key_here
HF_API_KEY=your_key_here
ALPHA_VANTAGE_API_KEY=your_key_here
AI_ENABLED=true

### 4 - Run development server

npm run dev

App will be available at : 
http://localhost:3000

---

## Live Demo

[Visit MarketScope](https://market-scope-ai.vercel.app)
---

## Future Improvements

Planned or possible enhancements to evolve MarketScope further:

- Enhanced chart interactions (zoom, tooltips, animations)
- Expand company dataset with sector filters
- Progressive Web App (PWA) support
- Authentication layer for saved watchlists
- Skeleton loading for the carousel
- Upgrade Alpha Vantage to a premium plan to lift the 25 req/day limit

These improvements would move the project closer to a production-grade financial dashboard.

---

## Author

  Thomas Bourchis

	•	GitHub: https://github.com/Thomas-Bhs
	•	LinkedIn: https://www.linkedin.com/in/thomas-bourc-his-09b056b4/


