WMATA Status Backend

A Node.js / Express backend that aggregates, normalizes, and caches Washington Metro (WMATA) service data into a clean, frontend-friendly API.

This project is a concept / portfolio application designed to demonstrate backend architecture, API integration, data transformation, caching, and testing — not a production proxy service.

Goals

Consume WMATA APIs safely without exposing API keys

Normalize noisy, inconsistent upstream data into a stable contract

Add real commuter value (severity, summaries, accessibility context)

Avoid excessive upstream polling via caching

Be fully testable and frontend-agnostic

Features
🚆 Rail (Metro) Status

Aggregates WMATA rail incidents

Groups by line (Red, Blue, Green, etc.)

Assigns severity:

Normal

Minor

Major

Separates:

Service-impacting incidents

Informational alerts

Generates short, UI-ready summaries

Cleans and truncates long WMATA descriptions

♿ Accessibility (Elevators & Escalators)

Aggregates elevator and escalator outages

Counts:

elevators down

escalators down

total outages

Classifies outages as:

planned (modernization, inspections, preventive maintenance)

unplanned (unexpected service interruptions)

Produces readable summaries combining station, location, and issue

Sorted to prioritize unplanned and recently updated outages

🧠 Smart Caching

Backend polls WMATA on a timed loop (not cron)

Cached results served to frontend

Prevents:

API key exposure

upstream rate abuse

Supports “stale” flag if refresh fails

API Endpoints
Health Check
GET /health


Returns:

{ "ok": true }

Rail Status
GET /api/status/metro


Response (example):

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

Accessibility Status
GET /api/status/accessibility


Response (example):

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

Architecture Overview
WMATA APIs
   ↓
wmataClient
   ↓
Transform Layer
   - classification
   - summaries
   - hygiene
   ↓
In-Memory Cache
   ↓
Express API

Why a transform layer?

WMATA data is:

verbose

inconsistent

not UI-friendly

This backend intentionally adds value instead of acting as a dumb proxy.

Scheduling Strategy

Uses a self-managed setTimeout loop (not cron)

Prevents overlapping refreshes

Adjusts cadence based on time of day

Resilient to process pauses and local development quirks

Tech Stack

Node.js (ES Modules)

Express

Native fetch

Jest (unit + integration tests)

Nock (HTTP mocking)

In-memory cache (no persistence)

Testing
npm test


Test coverage includes:

WMATA client behavior

Metro transform logic

Accessibility transform logic

API status endpoints

All external API calls are mocked.

Environment Variables

Create a .env file:

WMATA_API_KEY=your_key_here


The API key is never exposed to the frontend.

Scope & Intent

This project is not intended for public production use

No data is persisted

Designed to showcase backend engineering practices and patterns