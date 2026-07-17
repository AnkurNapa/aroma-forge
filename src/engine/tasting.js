// Rule-based tasting-note generator + style hint.
// Turns the superimposed aroma vector into human sensory prose, grounded in
// Voigt's compound->descriptor families. No API needed.

import { dominantNotes } from "./superpose.js";

const OPENERS = {
  roasted: ["Bold and roast-forward", "Dark and roasty", "Espresso-deep"],
  caramel: ["Rich and caramel-laden", "Sweet and toffee-driven", "Amber and confectionary"],
  malty: ["Malty and bread-led", "Full and grain-sweet", "Hearth-bready"],
  smoky: ["Smoke-wrapped", "Campfire-tinged", "Rauch-forward"],
  nutty: ["Nutty and mellow", "Soft and fruit-nutty", "Rounded and gentle"],
  taste: ["Clean and balanced", "Bright and simple", "Restrained"],
};

const PHRASE = {
  "Coffee": "fresh coffee", "Cacao": "raw cacao", "Dark Chocolate": "dark chocolate",
  "Roasted Almond": "roasted almond", "Dried Fruit": "dried fruit", "Bready": "warm bread crust",
  "Wood Smoke": "wood smoke", "Clove": "clove", "Almond": "almond", "Hazelnut": "hazelnut",
  "Raisin": "raisin", "Vanilla": "vanilla", "Honey": "honey", "Biscuit": "biscuit",
  "Marmalade": "orange marmalade", "Malty-Sweet": "sweet malt", "Toffee": "toffee",
  "Light Caramel": "light caramel", "Dark Caramel": "burnt-sugar caramel",
  "Sour": "a tart edge", "Sweet": "sweetness", "Bitter": "a bitter finish",
};

function groupTotals(vector) {
  const t = {};
  for (const n of dominantNotes(vector, { min: 0, limit: 99 })) t[n.group] = (t[n.group] || 0) + n.value;
  return t;
}

export function styleHint(vector, est) {
  const srm = est ? est.srm : 4;
  const g = groupTotals(vector);
  const roast = g.roasted || 0, smoke = g.smoky || 0, caramel = g.caramel || 0;
  if (smoke > 6) return "Rauchbier / smoked style";
  if (srm >= 30 && roast > 10) return "Stout / Porter territory";
  if (srm >= 17 && roast > 7) return "Dark Lager / Dunkel / Schwarzbier";
  if (srm >= 12 && caramel > 8) return "Amber Ale / Vienna / Märzen";
  if (srm >= 8) return "Pale Ale / Festbier range";
  if (caramel > 7) return "Caramel-rich blonde / Belgian";
  return "Pilsner / Helles / pale range";
}

export function tastingNote(vector, est, entries) {
  const notes = dominantNotes(vector, { min: 1.7, limit: 6 });
  if (!notes.length) return "Add malts to the grist to predict the aroma.";
  const g = groupTotals(vector);
  const leadGroup = Object.entries(g).sort((a, b) => b[1] - a[1])[0][0];
  const opener = OPENERS[leadGroup] ? OPENERS[leadGroup][0] : "Layered";

  const top = notes.slice(0, 3).map(n => PHRASE[n.key] || n.key.toLowerCase());
  const rest = notes.slice(3).map(n => PHRASE[n.key] || n.key.toLowerCase());

  let s = `${opener}. `;
  s += `Leads with ${listJoin(top)}`;
  if (rest.length) s += `, with ${listJoin(rest)} underneath`;
  s += ". ";

  const smoke = g.smoky || 0, roast = g.roasted || 0, caramel = g.caramel || 0, malty = g.malty || 0;
  if (smoke > 5) s += "Smoke sits over everything. ";
  if (roast > 9 && caramel > 6) s += "Roast and caramel share the finish. ";
  else if (roast > 9) s += "The finish is dry and roasty. ";
  else if (caramel > 8) s += "The finish stays sweet and caramelly. ";
  else if (malty > 6) s += "Malt body carries the middle. ";

  if (est) {
    s += `Predicted color about ${est.ebc} EBC (${est.srm} SRM)`;
    if (est.abv > 0) s += `, ~${est.abv}% ABV at ${est.og} OG`;
    s += ".";
  }
  return s.trim();
}

function listJoin(a) {
  if (a.length <= 1) return a[0] || "";
  if (a.length === 2) return `${a[0]} and ${a[1]}`;
  return `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`;
}
