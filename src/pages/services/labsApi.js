const BASE = "http://localhost:8000/api/labs";

export async function fetchLabs(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}?${query}`);
  if (!res.ok) throw new Error("Failed to load labs");
  return res.json();
}

export async function fetchLabFilters() {
  const res = await fetch(`${BASE}/filters`);
  if (!res.ok) throw new Error("Failed to load lab filters");
  return res.json();
}

export async function fetchCitiesByState(state) {
  const res = await fetch(`${BASE}/cities?state=${encodeURIComponent(state)}`);
  if (!res.ok) throw new Error("Failed to load cities");
  return res.json();
}