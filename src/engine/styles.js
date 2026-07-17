// Lightweight style matcher. Each style carries a color range and a sparse target
// aroma profile (the notes a judge expects to lead). We score a predicted beer by
// color fit + aroma similarity on the style's signature notes.

export const STYLES = [
  { name: "Pilsner / Helles",      ebc: [4, 12],   abv: [4.4, 5.4], target: { "Bready": 2, "Malty-Sweet": 2, "Honey": 1.5, "Light Caramel": 1.5 } },
  { name: "Munich Helles / Festbier", ebc: [7, 16], abv: [4.7, 6.3], target: { "Malty-Sweet": 3, "Bready": 2.5, "Biscuit": 2, "Honey": 1.5 } },
  { name: "Vienna / Märzen",       ebc: [16, 30],  abv: [5.0, 6.0], target: { "Malty-Sweet": 3, "Toffee": 2.5, "Bready": 2.5, "Marmalade": 2, "Light Caramel": 2 } },
  { name: "Bock / Doppelbock",     ebc: [25, 50],  abv: [6.3, 9.5], target: { "Dark Caramel": 2.5, "Dried Fruit": 2.5, "Toffee": 2.5, "Bready": 3, "Raisin": 2 } },
  { name: "Amber / Red Ale",       ebc: [22, 35],  abv: [4.5, 6.2], target: { "Toffee": 3, "Light Caramel": 3, "Marmalade": 2, "Biscuit": 2 } },
  { name: "Dunkel / Dark Lager",   ebc: [30, 55],  abv: [4.5, 5.6], target: { "Dark Caramel": 2.5, "Cacao": 2, "Bready": 2.5, "Toffee": 2 } },
  { name: "Schwarzbier",           ebc: [40, 60],  abv: [4.4, 5.4], target: { "Coffee": 2.5, "Dark Chocolate": 2, "Cacao": 2, "Bready": 2 } },
  { name: "Brown Ale",             ebc: [30, 45],  abv: [4.2, 6.0], target: { "Toffee": 2.5, "Cacao": 2, "Roasted Almond": 2, "Dried Fruit": 2 } },
  { name: "Porter",                ebc: [45, 70],  abv: [4.5, 6.5], target: { "Coffee": 3, "Dark Chocolate": 3, "Cacao": 2.5, "Dark Caramel": 2 } },
  { name: "Stout",                 ebc: [55, 100], abv: [4.2, 7.5], target: { "Coffee": 4, "Dark Chocolate": 3, "Roasted Almond": 2.5, "Cacao": 2.5 } },
  { name: "Pale Ale / IPA base",   ebc: [8, 20],   abv: [4.5, 7.0], target: { "Biscuit": 2.5, "Toffee": 2, "Light Caramel": 2, "Marmalade": 2 } },
  { name: "Weissbier",             ebc: [6, 16],   abv: [4.5, 5.6], target: { "Bready": 2.5, "Clove": 2, "Malty-Sweet": 2.5, "Honey": 1.5 } },
  { name: "Dunkelweizen",          ebc: [25, 45],  abv: [4.5, 6.0], target: { "Bready": 2.5, "Dark Caramel": 2, "Clove": 2, "Raisin": 2 } },
  { name: "Rauchbier",             ebc: [12, 40],  abv: [4.8, 6.0], target: { "Wood Smoke": 4, "Clove": 2.5, "Malty-Sweet": 2.5, "Bready": 2 } },
  { name: "Belgian Dubbel",        ebc: [30, 50],  abv: [6.0, 7.6], target: { "Dried Fruit": 3, "Raisin": 2.5, "Dark Caramel": 2.5, "Toffee": 2 } },
];

function colorFit(ebc, [lo, hi]) {
  if (ebc >= lo && ebc <= hi) return 1;
  const span = Math.max(6, hi - lo);
  const d = ebc < lo ? lo - ebc : ebc - hi;
  return Math.max(0, 1 - d / span);
}

function aromaFit(vector, target) {
  // Similarity on the style's signature notes, with a hard penalty when a
  // distinctive note is missing (so e.g. a smoke-free beer can't match Rauchbier).
  const keys = Object.keys(target);
  let err = 0, present = 0;
  for (const k of keys) {
    const v = vector[k] || 0;
    err += Math.abs(v - target[k]) / 5;
    if (v >= target[k] * 0.75) present += 1;
  }
  const sim = 1 - err / keys.length;
  const presentFrac = present / keys.length;
  // Off-profile penalty: strong aroma notes the style does NOT expect count against
  // it (so a heavily smoked or roasty beer can't match a clean Pilsner target).
  let off = 0;
  for (const [k, v] of Object.entries(vector)) {
    if (target[k] != null) continue;
    if (["Sour", "Sweet", "Bitter"].includes(k)) continue;
    if (v >= 2.4) off += (v - 2.2) / 5;
  }
  off = Math.min(0.4, off);
  // presence gates the score: absent signature notes tank the fit
  return Math.max(0, sim * (0.4 + 0.6 * presentFrac) - off);
}

export function matchStyles(vector, est, limit = 3) {
  const ebc = est ? est.ebc : 6;
  return STYLES
    .map(s => {
      const cf = colorFit(ebc, s.ebc), af = aromaFit(vector, s.target);
      const score = 0.4 * cf + 0.6 * af;
      const gaps = Object.entries(s.target)
        .map(([k, t]) => ({ k, d: (vector[k] || 0) - t }))
        .filter(x => Math.abs(x.d) >= 1.0)
        .sort((a, b) => Math.abs(b.d) - Math.abs(a.d))
        .slice(0, 2);
      return { name: s.name, score: Math.round(score * 100), colorFit: cf, gaps };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
