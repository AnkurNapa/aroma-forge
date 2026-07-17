import { superpose, dominantNotes } from "./engine/superpose.js";
import { estimate } from "./engine/color.js";
import { tastingNote } from "./engine/tasting.js";
import { matchStyles } from "./engine/styles.js";
import { renderRadar } from "./ui/radar.js";
import { renderPalette } from "./ui/palette.js";
import { renderGrist } from "./ui/grist.js";
import { renderResults } from "./ui/results.js";
import { renderRecipes } from "./ui/recipes.js";
import { encodeRecipe, decodeRecipe, saveRecipe, deleteRecipe, loadAll } from "./store.js";
import { $ } from "./ui/dom.js";

const OVERLAY_COLORS = ["#e0b23a", "#d9772b", "#8a2d17", "#4f9b34", "#2a94d6", "#b07bd0"];

let MALTS = [], byId = {}, wheelMap = {};
let state = { entries: [], batch: { volumeL: 20, efficiency: 72, attenuation: 78 } };
let compareName = null;
let palette;

init();

async function init() {
  [MALTS, wheelMap] = await Promise.all([
    fetch("./data/malts.json").then(r => r.json()),
    fetch("./data/wheel_map.json").then(r => r.json()).catch(() => ({})),
  ]);
  byId = Object.fromEntries(MALTS.map(m => [m.id, m]));
  loadFromHash();

  palette = renderPalette($("#palette"), MALTS, {
    onAdd: addMalt, inGrist: id => state.entries.some(e => e.malt.id === id),
  });

  const drop = $("#grist");
  drop.addEventListener("dragover", e => { e.preventDefault(); drop.classList.add("drag-over"); });
  drop.addEventListener("dragleave", () => drop.classList.remove("drag-over"));
  drop.addEventListener("drop", e => {
    e.preventDefault(); drop.classList.remove("drag-over");
    const id = e.dataTransfer.getData("text/malt"); if (id) addMalt(id);
  });

  $("#share").addEventListener("click", share);
  $("#clear").addEventListener("click", () => { state.entries = []; render(); });
  $("#example").addEventListener("click", loadExample);

  render();
}

function addMalt(id) {
  const m = byId[id]; if (!m) return;
  const found = state.entries.find(e => e.malt.id === id);
  if (found) found.grams += 500;
  else state.entries.push({ malt: m, grams: state.entries.length ? 500 : 4000 });
  render();
}

function computeFor(entries, batch) {
  const { vector, contributions, hasAroma } = superpose(entries);
  const est = estimate(entries, batch);
  return { vector, contributions, hasAroma, est };
}

function render() {
  const { vector, contributions, hasAroma, est } = computeFor(state.entries, state.batch);
  const note = tastingNote(vector, est, state.entries);
  const styles = hasAroma ? matchStyles(vector, est) : [];

  // dominant malt = largest weighted contributor with a wheel
  const withAroma = state.entries.filter(e => e.malt.aroma && e.grams > 0);
  const dominantMalt = withAroma.sort((a, b) => b.grams * (b.malt.potency || 1) - a.grams * (a.malt.potency || 1))[0]?.malt || null;

  const overlays = state.entries.length <= 6
    ? withAroma.map((e, i) => ({ vector: e.malt.aroma, color: OVERLAY_COLORS[i % OVERLAY_COLORS.length] }))
    : [];

  // compare recipe B
  let compare = null;
  if (compareName) {
    const all = loadAll();
    if (all[compareName]) {
      const { entries: bE, batch: bB } = decodeRecipe(all[compareName], byId);
      const b = computeFor(bE, bB);
      const bTop = dominantNotes(b.vector, { limit: 3 }).map(n => n.key).join(", ");
      compare = { name: compareName, vector: b.vector, est: b.est, top: bTop || "—" };
    } else compareName = null;
  }

  renderRadar($("#radar"), { vector, overlays, compare });
  renderResults($("#results"), { vector, contributions, est, note, styles, hasAroma, wheelMap, dominantMalt, compare });
  renderGrist($("#grist"), state.entries, {
    onChange: (i, g) => { state.entries[i].grams = g; render(); },
    onRemove: i => { state.entries.splice(i, 1); render(); },
    batch: state.batch, onBatch: b => { state.batch = b; render(); },
  });
  renderRecipes($("#recipes"), {
    onSave: n => { saveRecipe(n, encodeRecipe(state.entries, state.batch)); render(); },
    onLoad: n => { const r = decodeRecipe(loadAll()[n], byId); state.entries = r.entries; state.batch = r.batch; render(); },
    onDelete: n => { deleteRecipe(n); if (compareName === n) compareName = null; render(); },
    onCompare: n => { compareName = n; render(); },
    compareName,
  });
  palette && palette.refresh();
  writeHash();
}

// ---- URL share ----
function writeHash() {
  const g = state.entries.map(e => `${e.malt.id}:${e.grams}`).join(",");
  const b = `${state.batch.volumeL}-${state.batch.efficiency}-${state.batch.attenuation}`;
  history.replaceState(null, "", location.pathname + (g ? `#g=${encodeURIComponent(g)}&b=${b}` : ""));
}
function loadFromHash() {
  const h = new URLSearchParams(location.hash.slice(1));
  const g = h.get("g");
  if (g) for (const part of g.split(",")) {
    const [id, grams] = part.split(":");
    if (byId[id]) state.entries.push({ malt: byId[id], grams: Math.max(0, +grams || 0) });
  }
  const b = h.get("b");
  if (b) { const [v, e, a] = b.split("-").map(Number); if (v) state.batch = { volumeL: v, efficiency: e || 72, attenuation: a || 78 }; }
}
async function share() {
  writeHash();
  try { await navigator.clipboard.writeText(location.href); flash("Link copied"); }
  catch { flash("Copy the URL"); }
}
function flash(msg) { const b = $("#share"), old = b.textContent; b.textContent = msg; setTimeout(() => (b.textContent = old), 1400); }

function loadExample() {
  const pick = (id, g) => byId[id] && { malt: byId[id], grams: g };
  state.entries = [
    pick("munich-malt-type-1", 3000), pick("caramunich-type-1", 600),
    pick("carafa-special-type-1", 200), pick("melanoidin-malt", 300),
  ].filter(Boolean);
  render();
}
