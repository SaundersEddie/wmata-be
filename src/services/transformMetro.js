// src/services/transformMetro.js
import { METRO_LINES } from "../constants/metroLines.js";
import { classifyIncident } from "./classifyIncident.js";
import {
  extractLinks,
  stripLinks,
  makeSummary,
  truncate,
} from "./textHygiene.js";

function parseLinesAffected(value) {
  if (!value) return [];
  return String(value)
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function transformMetroIncidents(raw) {
  const incidents = Array.isArray(raw?.Incidents) ? raw.Incidents : [];

  const buckets = Object.fromEntries(
    Object.entries(METRO_LINES).map(([code, meta]) => [
      code,
      {
        code,
        name: meta.name,
        color: meta.color,
        status: "Normal", // Normal | Minor | Major
        serviceIncidents: [],
        infoAlerts: [],
      },
    ])
  );

  for (const inc of incidents) {
    const affectedLines = parseLinesAffected(inc?.LinesAffected);
    if (affectedLines.length === 0) continue;

    const { severity, bucket } = classifyIncident(inc);

    const rawDesc = inc?.Description ?? "";
    const links = extractLinks(rawDesc);
    const cleaned = stripLinks(rawDesc);

    const item = {
      id: inc?.IncidentID ?? null,
      type: inc?.IncidentType ?? "Unknown",
      severity, // Minor | Major
      summary: makeSummary(rawDesc, 120),
      description: truncate(cleaned, 600), // FE can expand later if you add a details view
      links,
      updated: inc?.DateUpdated ?? null,
    };

    for (const code of affectedLines) {
      if (!buckets[code]) continue;

      if (bucket === "info") buckets[code].infoAlerts.push(item);
      else buckets[code].serviceIncidents.push(item);

      // Promote line status: Normal < Minor < Major
      const current = buckets[code].status;
      if (severity === "Major") buckets[code].status = "Major";
      else if (current === "Normal") buckets[code].status = "Minor";
    }
  }

  // Keep payload tidy (and FE fast)
  for (const line of Object.values(buckets)) {
    line.serviceIncidents = line.serviceIncidents.slice(0, 5);
    line.infoAlerts = line.infoAlerts.slice(0, 5);
  }

  return { lines: Object.values(buckets) };
}
