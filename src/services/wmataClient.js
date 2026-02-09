// src/services/wmataClient.js
import "dotenv/config";

const BASE = "https://api.wmata.com";

function requireApiKey() {
  const key = process.env.WMATA_API_KEY;
  if (!key) throw new Error("WMATA_API_KEY is missing");
  return key;
}

export async function fetchIncidents({ signal } = {}) {
  const res = await fetch(`${BASE}/Incidents.svc/json/Incidents`, {
    headers: {
      api_key: requireApiKey(),
      "User-Agent": "wmata-be-demo/1.0 (portfolio)",
    },
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`WMATA ${res.status} ${res.statusText}: ${text}`);
  }

  return res.json();
}
