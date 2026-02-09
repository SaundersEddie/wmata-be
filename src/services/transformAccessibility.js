// src/services/transformAccessibility.js
import {
  extractLinks,
  stripLinks,
  makeSummary,
  truncate,
} from "./textHygiene.js";

function normUnitType(value) {
  const v = String(value || "").toLowerCase();
  if (v.includes("elev")) return "ELEVATOR";
  if (v.includes("escal")) return "ESCALATOR";
  return "UNKNOWN";
}

function classifyAccess(symptom = "") {
  const s = String(symptom || "").toLowerCase();

  // Treat these as planned/known work rather than surprise outages
  const plannedWords = [
    "modernization",
    "preventive",
    "inspection",
    "safety inspection",
    "pm inspection",
    "preventative", // just in case
  ];

  if (plannedWords.some((w) => s.includes(w))) return "planned";
  return "unplanned";
}

function toTime(value) {
  const t = Date.parse(value);
  return Number.isFinite(t) ? t : 0;
}

export function transformAccessibility(raw, { limit = 50 } = {}) {
  const incidents = Array.isArray(raw?.ElevatorIncidents)
    ? raw.ElevatorIncidents
    : [];

  const items = incidents.map((inc) => {
    const unitType = normUnitType(inc?.UnitType);

    const stationName = inc?.StationName ?? null;
    const location = inc?.LocationDescription ?? null;
    const symptom = inc?.SymptomDescription ?? null;

    // Build a useful human sentence. This avoids summaries like “Other”.
    const desc = [
      stationName && `Station: ${stationName}`,
      location && `Location: ${location}`,
      symptom && `Issue: ${symptom}`,
    ]
      .filter(Boolean)
      .join(" — ");

    const links = extractLinks(desc);
    const cleaned = stripLinks(desc);

    const bucket = classifyAccess(symptom);

    return {
      unitType, // ELEVATOR | ESCALATOR | UNKNOWN
      bucket,   // planned | unplanned

      stationCode: inc?.StationCode ?? null,
      stationName,
      unitName: inc?.UnitName ?? null,

      location,
      symptom,

      summary: makeSummary(desc, 140),
      description: truncate(cleaned, 600),
      links,

      dateOutOfService: inc?.DateOutOfServ ?? null,
      dateUpdated: inc?.DateUpdated ?? null,
      estimatedReturnToService: inc?.EstimatedReturnToService ?? null,
    };
  });

  // Sort: unplanned first, then most recently updated, then most recently out of service
  items.sort((a, b) => {
    if (a.bucket !== b.bucket) return a.bucket === "unplanned" ? -1 : 1;

    const au = toTime(a.dateUpdated);
    const bu = toTime(b.dateUpdated);
    if (au !== bu) return bu - au;

    const ao = toTime(a.dateOutOfService);
    const bo = toTime(b.dateOutOfService);
    return bo - ao;
  });

  const elevatorsDown = items.filter((i) => i.unitType === "ELEVATOR").length;
  const escalatorsDown = items.filter((i) => i.unitType === "ESCALATOR").length;

  const plannedDown = items.filter((i) => i.bucket === "planned").length;
  const unplannedDown = items.filter((i) => i.bucket === "unplanned").length;

  const safeLimit = Math.min(Math.max(Number(limit) || 50, 0), 200);

  return {
    elevatorsDown,
    escalatorsDown,
    totalDown: items.length,

    plannedDown,
    unplannedDown,

    items: items.slice(0, safeLimit),
  };
}
