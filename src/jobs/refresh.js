// src/jobs/refresh.js
import { fetchIncidents } from "../services/wmataClient.js";
import { transformMetroIncidents } from "../services/transformMetro.js";
import { setCache, markStale } from "../cache/memoryCache.js";

export async function refreshOnce() {
  try {
    const raw = await fetchIncidents();
    const metro = transformMetroIncidents(raw);

    setCache({
      metro,
    });

    return { ok: true };
  } catch (err) {
    markStale();
    return { ok: false, error: err?.message || String(err) };
  }
}
