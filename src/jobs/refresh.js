import { fetchIncidents, fetchElevatorIncidents } from "../services/wmataClient.js";
import { transformMetroIncidents } from "../services/transformMetro.js";
import { transformAccessibility } from "../services/transformAccessibility.js";
import { setCache, markStale } from "../cache/memoryCache.js";

export async function refreshOnce() {
  try {
    const [railRaw, accessRaw] = await Promise.all([
      fetchIncidents(),
      fetchElevatorIncidents(),
    ]);

    setCache({
      metro: transformMetroIncidents(railRaw),
      accessibility: transformAccessibility(accessRaw),
    });

    return { ok: true };
  } catch (err) {
    markStale();
    return { ok: false, error: err?.message || String(err) };
  }
}
