# WMATA Status Backend

A Node.js / Express backend that fetches Washington Metro (WMATA) service data, normalizes it, caches it, and exposes a cleaner API for frontend use.

This is a portfolio project focused on backend API design, external API integration, data transformation, caching, testing, and frontend-friendly response contracts.

It is **not** intended to be a public production WMATA proxy service.

---

## What This Project Does

The WMATA Status Backend sits between the WMATA APIs and a frontend application.

Instead of exposing raw WMATA responses directly, this backend:

- Fetches rail incident and accessibility outage data from WMATA
- Normalizes inconsistent upstream data into predictable API responses
- Groups rail incidents by Metro line
- Classifies service impact and severity
- Separates service-impacting incidents from informational alerts
- Aggregates elevator and escalator outages
- Caches responses to avoid unnecessary upstream API calls
- Keeps the WMATA API key safely on the backend
- Provides clean endpoints for a frontend to consume

The goal is to turn noisy transit data into something easier to display, test, and understand.

---

## Why I Built It

Raw public API data is often useful, but not always frontend-friendly.

WMATA service data can be verbose, inconsistent, and awkward to present directly in a user interface. This backend adds a transform layer so the frontend can work with a stable, simplified contract instead of handling all cleanup and classification itself.

This project demonstrates:

- Backend API design
- Third-party API integration
- Environment-based configuration
- Data normalization
- In-memory caching
- Response shaping for frontend use
- Unit and integration testing
- Mocked external API calls

---

## Features

### Rail Status

The rail status endpoint aggregates WMATA rail incident data and prepares it for UI use.

It supports:

- Rail incident aggregation
- Grouping by Metro line
- Severity assignment:
  - `Normal`
  - `Minor`
  - `Major`
- Separation of:
  - Service-impacting incidents
  - Informational alerts
- Short UI-ready summaries
- Cleaned and truncated descriptions
- Frontend-friendly response objects

### Accessibility Status

The accessibility endpoint aggregates elevator and escalator outage data.

It supports:

- Elevator outage counts
- Escalator outage counts
- Total outage counts
- Planned vs unplanned outage classification
- Readable summaries including:
  - Station name
  - Location
  - Issue description
- Sorting to prioritize unplanned and recently updated outages

### Caching

The backend refreshes WMATA data on a managed timer loop and serves cached data to the frontend.

This helps:

- Avoid exposing the WMATA API key
- Reduce unnecessary upstream API calls
- Prevent overlapping refresh jobs
- Support a stale flag if refresh fails
- Keep the frontend fast and simple

---

## API Endpoints

### Health Check

```http
GET /health
```

Example response:

```json
{
  "ok": true
}
```

---

### Metro Rail Status

```http
GET /api/status/metro
```

Example response shape:

```json
{
  "meta": {
    "lastUpdated": "2026-02-09T16:43:48.214Z",
    "stale": false
  },
  "data": {
    "lines": [
      {
        "code": "GR",
        "name": "Green",
        "color": "#00B140",
        "status": "Minor",
        "serviceIncidents": [],
        "infoAlerts": [
          {
            "severity": "Minor",
            "summary": "Station entrance closed for escalator replacement",
            "description": "...",
            "links": []
          }
        ]
      }
    ]
  }
}
```

---

### Accessibility Status

```http
GET /api/status/accessibility
```

Example response shape:

```json
{
  "meta": {
    "lastUpdated": "2026-02-09T16:43:48.214Z",
    "stale": false
  },
  "data": {
    "elevatorsDown": 9,
    "escalatorsDown": 42,
    "plannedDown": 31,
    "unplannedDown": 20,
    "totalDown": 51,
    "items": [
      {
        "unitType": "ESCALATOR",
        "bucket": "unplanned",
        "stationName": "Metro Center",
        "summary": "Station: Metro Center — Location: Escalator between street and mezzanine — Issue: Service Call",
        "estimatedReturnToService": "2026-02-11T23:59:59"
      }
    ]
  }
}
```

---

## Architecture

```text
WMATA APIs
   ↓
WMATA Client
   ↓
Transform Layer
   - classification
   - summaries
   - response hygiene
   ↓
In-Memory Cache
   ↓
Express API
   ↓
Frontend Application
```

### Why Use a Transform Layer?

The backend intentionally does more than proxy WMATA data.

The transform layer exists because upstream data is not always ideal for direct UI use. It gives the frontend a cleaner contract and keeps presentation logic out of the client where possible.

The transform layer handles:

- Classification
- Severity assignment
- Summary generation
- Data cleanup
- Response shaping
- Frontend-friendly grouping

---

## Tech Stack

- Node.js
- Express
- ES Modules
- Native `fetch`
- dotenv
- helmet
- express-rate-limit
- Jest
- Nock
- Supertest
- In-memory cache

---

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Add your WMATA API key:

```env
WMATA_API_KEY=your_key_here
```

Start the development server:

```bash
npm run dev
```

Run the production start command:

```bash
npm start
```

---

## Environment Variables

| Variable | Required | Description |
|---|---:|---|
| `WMATA_API_KEY` | Yes | WMATA API key used by the backend to request service data. |

The API key is used only on the backend and should never be exposed to the frontend.

---

## Testing

Run the test suite:

```bash
npm test
```

Test coverage includes:

- WMATA client behavior
- Metro transform logic
- Accessibility transform logic
- API status endpoints
- Mocked external API responses

External WMATA calls are mocked during tests.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the development server with nodemon. |
| `npm start` | Starts the backend with Node. |
| `npm test` | Runs the Jest test suite. |

---

## Project Scope

This project is designed as a portfolio/backend architecture example.

It is intended to demonstrate clean backend patterns, not to act as a public production service.

Current scope:

- No persistent database
- No user accounts
- No public production guarantee
- No long-term historical storage
- In-memory cache only
- Frontend-agnostic API responses

---

## Related Repositories

- Backend: `https://github.com/SaundersEddie/wmata-be`
- Frontend: `https://github.com/SaundersEddie/wmata-fe`

---

## Portfolio Notes

This project is useful as a portfolio piece because it shows more than basic CRUD.

It demonstrates how to:

- Work with third-party APIs
- Hide API keys behind a backend
- Normalize messy upstream data
- Design stable response contracts
- Add caching around external data
- Test backend logic without relying on live external services
- Build a backend that supports a separate frontend cleanly

That is the point of the project: not just fetching data, but making the data easier to use.
