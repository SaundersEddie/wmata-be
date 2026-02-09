// src/services/classifyIncident.js

function normalizeText(inc) {
  return `${inc?.IncidentType ?? ""} ${inc?.Description ?? ""}`.toLowerCase();
}

// Things riders usually consider real service problems
const MAJOR_PATTERNS = [
  "no service",
  "service suspended",
  "suspended",
  "shuttle",
  "single track",
  "single-track",
  "disabled train",
  "signal problem",
  "signal",
  "power",
  "smoke",
  "fire",
  "police activity",
  "medical emergency",
  "delays",
  "delay",
];

// Things that are informational / maintenance / access-related
const INFO_PATTERNS = [
  "entrance will be closed",
  "entrance closed",
  "station entrance",
  "escalator",
  "elevator",
  "replacement",
  "construction",
  "work zone",
  "advisory",
  "beginning",
  "through",
  "thru",
  "until",
];

export function classifyIncident(incident) {
  const text = normalizeText(incident);

  // Info / maintenance should not scream “the line is broken”
  if (INFO_PATTERNS.some((p) => text.includes(p))) {
    return {
      severity: "Minor",   // Normal | Minor | Major
      bucket: "info",      // info | service
    };
  }

  // Clear service-impacting problems
  if (MAJOR_PATTERNS.some((p) => text.includes(p))) {
    return {
      severity: "Major",
      bucket: "service",
    };
  }

  // Default: minor service impact
  return {
    severity: "Minor",
    bucket: "service",
  };
}
