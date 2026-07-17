// Aroma superposition — the heart of the app.
// Takes a grist (malts + grams) and predicts the combined beer aroma vector by
// superimposing each malt's aroma wheel, weighted by grist share AND aroma potency,
// so a small charge of a potent specialty malt still shows up (the "next level"
// beyond reading each malt's wheel in isolation).

import { DESCRIPTORS, groupOf } from "../descriptors.js";

// Tuning constants. Calibrated so a single malt reproduces ~its own wheel values,
// while a potent minority malt (e.g. 5% CARAFA) still pushes roast notes up.
const PRESENCE_K = 0.10; // lower = minority malts punch harder
const A_AVG = 0.35;      // weight of the base (mass-weighted average) character
const B_PEAK = 0.72;     // weight of the strongest single contributor

// Mild wort -> finished-beer transfer factors per aroma group (some volatiles fade,
// smoke and roast persist). Applied after superposition.
const TRANSFER = { roasted: 1.0, smoky: 1.0, nutty: 0.9, malty: 0.95, caramel: 0.97, taste: 0.9 };

export function superpose(entries) {
  // entries: [{ malt, grams }] where malt.aroma is the 22-key vector (or null)
  const active = entries.filter(e => e.malt && e.malt.aroma && e.grams > 0);
  const totalG = active.reduce((s, e) => s + e.grams, 0);
  const empty = Object.fromEntries(DESCRIPTORS.map(d => [d.key, 0]));
  if (!totalG) return { vector: empty, contributions: {}, hasAroma: false };

  const W = active.map(e => {
    const share = e.grams / totalG;
    return { e, share, weight: share * (e.malt.potency || 1) };
  });
  const Wsum = W.reduce((s, w) => s + w.weight, 0) || 1;

  const vector = {};
  const contributions = {}; // descriptor -> [{id, name, amount}] top drivers
  for (const d of DESCRIPTORS) {
    let avg = 0, peak = 0, drivers = [];
    for (const w of W) {
      const v = w.e.malt.aroma[d.key] ?? 0;
      avg += w.weight * v;
      const presence = w.weight / (w.weight + PRESENCE_K * Wsum);
      const contrib = v * presence;
      if (contrib > peak) peak = contrib;
      drivers.push({ id: w.e.malt.id, name: w.e.malt.name, amount: contrib });
    }
    avg /= Wsum;
    let val = A_AVG * avg + B_PEAK * peak;
    val *= TRANSFER[groupOf(d.key)] ?? 1;
    vector[d.key] = Math.max(0, Math.min(5, +val.toFixed(2)));
    contributions[d.key] = drivers.sort((a, b) => b.amount - a.amount).slice(0, 3);
  }
  return { vector, contributions, hasAroma: true, totalG };
}

// Rank descriptors by combined intensity, ignoring near-baseline noise.
// Taste (Sour/Sweet/Bitter) is excluded by default: it's the noisiest axis to
// digitize and reads oddly as an "aroma" lead. It still appears on the radar.
export function dominantNotes(vector, { min = 1.6, limit = 6, includeTaste = false } = {}) {
  return DESCRIPTORS
    .filter(d => includeTaste || d.group !== "taste")
    .map(d => ({ key: d.key, group: d.group, value: vector[d.key] || 0 }))
    .filter(x => x.value >= min)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}
