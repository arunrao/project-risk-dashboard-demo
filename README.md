# Project Risk Dashboard

A production-grade React application for analyzing and visualizing project portfolio risks using Next.js, Tremor, and Google's Gemini AI.

## Overview

The Project Risk Dashboard allows PMO teams to upload project data via CSV, analyze schedule and cost variances, and augment the analysis using Gemini AI. It provides a mission-control style interface to view risk distributions, drill down into specific project risks, and generate executive summaries.

![Dashboard Preview](./public/assets/dashboard-preview.png)

## Features

- **CSV Ingestion**: Upload portfolio data directly.
- **Risk Scoring**: Automated calculation of Schedule and Cost risk scores based on variance thresholds.
- **AI Integration (Gemini 2.5)**: Deep analysis of individual project rows and generation of portfolio-level "Executive Briefing" summaries.
- **Interactive Visualizations**: Risk matrices, distributions, and summary KPIs powered by Tremor charts.
- **Actionable Insights**: Expandable table rows that reveal AI-recommended actions.

## Getting Started

### Prerequisites

- Node.js > 18.x
- A Google Gemini API Key

### Installation

1. Copy the `.env.local.example` to `.env.local` (or create one):
   ```bash
   touch .env.local
   ```
2. Add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_actual_key_here
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

Navigate to `http://localhost:3000` to view the dashboard.

## Testing

The project includes both unit tests and end-to-end testing.

**Unit Tests (Jest & React Testing Library):**
```bash
npm run test
```

**End-to-End Tests (Playwright):**
```bash
npx playwright install # First time setup
npm run build          # Playwright uses the locally built production version
npx playwright test
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS v3
- **Components**: @tremor/react, lucide-react
- **Data AI**: @google/generative-ai (Gemini 2.5 Flash / Pro)
- **Parsing**: Papaparse
- **Testing**: Jest, Playwright
