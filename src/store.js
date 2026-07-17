// LocalStorage-backed recipe store. Recipes serialize the grist + batch compactly.
const KEY = "aromaforge.recipes.v1";

export function encodeRecipe(entries, batch) {
  return {
    g: entries.filter(e => e.grams > 0).map(e => `${e.malt.id}:${e.grams}`).join(","),
    b: `${batch.volumeL}-${batch.efficiency}-${batch.attenuation}`,
  };
}
export function decodeRecipe(rec, byId) {
  const entries = [];
  for (const part of (rec.g || "").split(",")) {
    const [id, grams] = part.split(":");
    if (byId[id]) entries.push({ malt: byId[id], grams: Math.max(0, +grams || 0) });
  }
  let batch = { volumeL: 20, efficiency: 72, attenuation: 78 };
  if (rec.b) {
    const [v, e, a] = rec.b.split("-").map(Number);
    if (v) batch = { volumeL: v, efficiency: e || 72, attenuation: a || 78 };
  }
  return { entries, batch };
}

export function loadAll() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
  catch { return {}; }
}
export function saveRecipe(name, rec) {
  const all = loadAll(); all[name] = rec;
  localStorage.setItem(KEY, JSON.stringify(all));
}
export function deleteRecipe(name) {
  const all = loadAll(); delete all[name];
  localStorage.setItem(KEY, JSON.stringify(all));
}
