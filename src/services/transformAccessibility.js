// src/services/transformAccessibility.js
import { makeSummary, stripLinks, extractLinks, truncate } from "./textHygiene.js";

function normUnitType(value) {
  const v = String(value || "").toLowerCase();
  if (v.includes("elev")) return "ELEVATOR";
  if (v.includes("escal")) return "ESCALATOR";
  return "UNKNOWN";
}

export function transformAccessibility(raw) {
  const incidents = Array.isArray(raw?.ElevatorIncidents) ? raw.ElevatorIncidents : [];

  const items = incidents.map((inc) => {
    // WMATA fields vary a bit; keep this tolerant
    const unitType = normUnitType(inc?.UnitType);
    const desc =
      inc?.SymptomDescription ||
      inc?.LocationDescription ||
      inc?.Description ||
      "";

    const links = extractLinks(desc);
    const cleaned = stripLinks(desc);

    return {
      unitType, // ELEVATOR | ESCALATOR | UNKNOWN
      stationCode: inc?.StationCode ?? null,
      stationName: inc?.StationName ?? null,
      unitName: inc?.UnitName ?? null,
      location: inc?.LocationDescription ?? null,
      symptom: inc?.SymptomDescription ?? null,

      summary: makeSummary(desc, 120),
      description: truncate(cleaned, 600),
      links,

      dateOutOfService: inc?.DateOutOfServ ?? null,
      dateUpdated: inc?.DateUpdated ?? null,
      estimatedReturnToService: inc?.EstimatedReturnToService ?? null,
    };
  });

  const elevatorsDown = items.filter((i) => i.unitType === "ELEVATOR").length;
  const escalatorsDown = items.filter((i) => i.unitType === "ESCALATOR").length;

  return {
    elevatorsDown,
    escalatorsDown,
    totalDown: items.length,
    items: items.slice(0, 100), // cap so payload stays sane
  };
}
