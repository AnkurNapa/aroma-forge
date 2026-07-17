// Bilingual rule-based tasting-note generator + group totals.
import { dominantNotes } from "./superpose.js";
import { getLang, t } from "../i18n.js";

const OPENERS = {
  en: {
    roasted: "Bold and roast-forward", caramel: "Rich and caramel-laden", malty: "Malty and bread-led",
    smoky: "Smoke-wrapped", nutty: "Nutty and mellow", taste: "Clean and balanced",
  },
  de: {
    roasted: "Kräftig und röstbetont", caramel: "Voll und karamellbetont", malty: "Malzig und brotbetont",
    smoky: "Rauchumhüllt", nutty: "Nussig und weich", taste: "Sauber und ausgewogen",
  },
};

const PHRASE = {
  en: {
    "Coffee": "fresh coffee", "Cacao": "raw cacao", "Dark Chocolate": "dark chocolate", "Roasted Almond": "roasted almond",
    "Dried Fruit": "dried fruit", "Bready": "warm bread crust", "Wood Smoke": "wood smoke", "Clove": "clove",
    "Almond": "almond", "Hazelnut": "hazelnut", "Raisin": "raisin", "Vanilla": "vanilla", "Honey": "honey",
    "Biscuit": "biscuit", "Marmalade": "orange marmalade", "Malty-Sweet": "sweet malt", "Toffee": "toffee",
    "Light Caramel": "light caramel", "Dark Caramel": "burnt-sugar caramel",
  },
  de: {
    "Coffee": "frischer Kaffee", "Cacao": "roher Kakao", "Dark Chocolate": "Zartbitterschokolade", "Roasted Almond": "geröstete Mandel",
    "Dried Fruit": "Trockenfrucht", "Bready": "warme Brotkruste", "Wood Smoke": "Holzrauch", "Clove": "Nelke",
    "Almond": "Mandel", "Hazelnut": "Haselnuss", "Raisin": "Rosine", "Vanilla": "Vanille", "Honey": "Honig",
    "Biscuit": "Biskuit", "Marmalade": "Orangenmarmelade", "Malty-Sweet": "süßes Malz", "Toffee": "Toffee",
    "Light Caramel": "helles Karamell", "Dark Caramel": "dunkles Karamell",
  },
};

const TX = {
  en: {
    leads: "Leads with", under: ", with", underEnd: " underneath. ", and: "and",
    smoke: "Smoke sits over everything. ", rc: "Roast and caramel share the finish. ",
    roast: "The finish is dry and roasty. ", caramel: "The finish stays sweet and caramelly. ",
    malty: "Malt body carries the middle. ", color: "Predicted color about", abvAt: "% ABV at", og: "OG",
  },
  de: {
    leads: "Im Vordergrund:", under: ". Darunter", underEnd: ". ", and: "und",
    smoke: "Rauch liegt über allem. ", rc: "Röstung und Karamell teilen sich das Finish. ",
    roast: "Trockenes, röstiges Finish. ", caramel: "Süßes, karamelliges Finish. ",
    malty: "Malzkörper trägt die Mitte. ", color: "Vorhergesagte Farbe etwa", abvAt: "% Alk. bei", og: "SW",
  },
};

export function groupTotals(vector) {
  const tot = {};
  for (const n of dominantNotes(vector, { min: 0, limit: 99 })) tot[n.group] = (tot[n.group] || 0) + n.value;
  return tot;
}

export function styleHint(vector, est) { return ""; } // superseded by style matcher

export function tastingNote(vector, est, entries) {
  const L = getLang();
  const notes = dominantNotes(vector, { min: 1.7, limit: 6 });
  if (!notes.length) return t("addPrompt");
  const g = groupTotals(vector);
  const lead = Object.entries(g).sort((a, b) => b[1] - a[1])[0][0];
  const opener = OPENERS[L][lead] || OPENERS[L].malty;
  const ph = PHRASE[L], tx = TX[L];

  const top = notes.slice(0, 3).map(n => ph[n.key] || n.key);
  const rest = notes.slice(3).map(n => ph[n.key] || n.key);
  let s = `${opener}. ${tx.leads} ${listJoin(top, tx.and)}`;
  if (rest.length) s += `${tx.under} ${listJoin(rest, tx.and)}${tx.underEnd}`;
  else s += ". ";

  const smoke = g.smoky || 0, roast = g.roasted || 0, caramel = g.caramel || 0, malty = g.malty || 0;
  if (smoke > 5) s += tx.smoke;
  if (roast > 9 && caramel > 6) s += tx.rc;
  else if (roast > 9) s += tx.roast;
  else if (caramel > 8) s += tx.caramel;
  else if (malty > 6) s += tx.malty;

  if (est) {
    const abv = L === "de" ? String(est.abv).replace(".", ",") : est.abv;
    const og = L === "de" ? est.og.toFixed(3).replace(".", ",") : est.og;
    s += `${tx.color} ${est.ebc} EBC (${est.srm} SRM)`;
    if (est.abv > 0) s += `, ~${abv}${tx.abvAt} ${og} ${tx.og}`;
    s += ".";
  }
  return s.trim();
}

function listJoin(a, and) {
  if (a.length <= 1) return a[0] || "";
  if (a.length === 2) return `${a[0]} ${and} ${a[1]}`;
  return `${a.slice(0, -1).join(", ")} ${and} ${a[a.length - 1]}`;
}
