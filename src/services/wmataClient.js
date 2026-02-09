import "dotenv/config";

const BASE = "https://api.wmata.com";

export async function fetchIncidents({ signal } = {}) {
  const url = `${BASE}/Incidents.svc/json/Incidents`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      api_key: process.env.WMATA_API_KEY,
      "User-Agent": "wmata-be-demo/1.0 (portfolio project)",
    },
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`WMATA ${res.status} ${res.statusText}: ${text}`);
  }

  return res.json();
}
