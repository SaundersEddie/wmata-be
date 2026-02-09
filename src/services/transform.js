// Minimal “line boxes” model for v1.
const LINE_CODES = ["RD", "BL", "YL", "OR", "GR", "SV"];

export function normalizeIncidents(raw) {
  const incidents = Array.isArray(raw?.Incidents) ? raw.Incidents : [];

  const byLine = new Map(LINE_CODES.map((c) => [c, []]));

  for (const inc of incidents) {
    const lines = Array.isArray(inc?.LinesAffected)
      ? inc.LinesAffected
      : String(inc?.LinesAffected || "")
          .split(";")
          .map((s) => s.trim())
          .filter(Boolean);

    for (const code of lines) {
      if (!byLine.has(code)) continue;
      byLine.get(code).push({
        incidentId: inc?.IncidentID ?? null,
        description: inc?.Description ?? "",
        incidentType: inc?.IncidentType ?? "",
        dateUpdated: inc?.DateUpdated ?? null,
      });
    }
  }

  const lines = LINE_CODES.map((code) => {
    const items = byLine.get(code) || [];
    return {
      code,
      status: items.length ? "Disruption" : "Normal",
      incidents: items.slice(0, 5),
    };
  });

  return { lines };
}
