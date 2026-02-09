import { fetchIncidents } from "../services/wmataClient.js";
import { normalizeIncidents } from "../services/transform.js";
import { setCache, markStale } from "../cache/memoryCache.js";

export async function refreshOnce() {
  try {
    const raw = await fetchIncidents();
    const normalized = normalizeIncidents(raw);
    setCache(normalized);
    return { ok: true };
  } catch (err) {
    markStale();
    return { ok: false, error: err?.message || String(err) };
  }
}
