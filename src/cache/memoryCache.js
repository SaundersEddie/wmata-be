let cache = {
  value: null,
  lastUpdated: null,
  stale: true,
};

export function getCache() {
  return cache;
}

export function setCache(value) {
  cache = {
    value,
    lastUpdated: new Date().toISOString(),
    stale: false,
  };
}

export function markStale() {
  cache = { ...cache, stale: true };
}
