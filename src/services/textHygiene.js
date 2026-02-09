// src/services/textHygiene.js

const URL_REGEX = /\bhttps?:\/\/[^\s)]+/gi;

export function extractLinks(text = "") {
  const matches = String(text).match(URL_REGEX) || [];
  // de-dupe while preserving order
  return [...new Set(matches)];
}

export function stripLinks(text = "") {
  return String(text).replace(URL_REGEX, "").replace(/\s+/g, " ").trim();
}

export function truncate(text = "", max = 180) {
  const s = String(text).trim();
  if (s.length <= max) return s;
  return s.slice(0, Math.max(0, max - 1)).trimEnd() + "…";
}

/**
 * Creates a short, FE-friendly summary.
 * - removes URLs
 * - removes “Beginning … thru …” boilerplate (best-effort)
 * - truncates
 */
export function makeSummary(description = "", max = 120) {
  let s = stripLinks(description);

  // Best-effort removal of WMATA date-range boilerplate
  // e.g. "Beginning Mon, Sept 29th, thru March 2026. The Half Street entrance..."
  s = s.replace(/^beginning\b.*?\.\s*/i, "");
  s = s.replace(/^effective\b.*?\.\s*/i, "");

  s = s.replace(/\s+/g, " ").trim();
  return truncate(s, max);
}
