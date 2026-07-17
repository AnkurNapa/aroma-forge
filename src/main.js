import { superpose } from "./engine/superpose.js";
import { estimate } from "./engine/color.js";
import { tastingNote, styleHint } from "./engine/tasting.js";
import { renderRadar } from "./ui/radar.js";
import { renderPalette } from "./ui/palette.js";
import { renderGrist } from "./ui/grist.js";
import { renderResults } from "./ui/results.js";
import { $ } from "./ui/dom.js";

const OVERLAY_COLORS = ["#e0b23a", "#d9772b", "#8a2d17", "#4f9b34", "#2a94d6", "#b07bd0"];

let MALTS = [];
let byId = {};
let state = { entries: [], batch: { volumeL: 20, efficiency: 72, attenuation: 78 } };
let palette;

init();

async function init() {
  MALTS = await fetch("./data/malts.json").then(r => r.json());
  byId = Object.fromEntries(MALTS.map(m => [m.id, m]));
  loadFromHash();

  palette = renderPalette($("#palette"), MALTS, {
    onAdd: addMalt,
    inGrist: id => state.entries.some(e => e.malt.id === id),
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

function render() {
  const { vector, contributions, hasAroma } = superpose(state.entries);
  const est = estimate(state.entries, state.batch);
  const note = tastingNote(vector, est, state.entries);
  const style = hasAroma ? styleHint(vector, est) : null;

  const overlays = state.entries.length <= 6
    ? state.entries.filter(e => e.malt.aroma).map((e, i) => ({ vector: e.malt.aroma, color: OVERLAY_COLORS[i % OVERLAY_COLORS.length] }))
    : [];

  renderRadar($("#radar"), { vector, overlays });
  renderResults($("#results"), { vector, contributions, est, note, style, hasAroma });
  renderGrist($("#grist"), state.entries, {
    onChange: (i, g) => { state.entries[i].grams = g; render(); },
    onRemove: i => { state.entries.splice(i, 1); render(); },
    batch: state.batch,
    onBatch: b => { state.batch = b; render(); },
  });
  palette && palette.refresh();
  writeHash();
}

// ---- URL share (state in hash) ----
function writeHash() {
  const g = state.entries.map(e => `${e.malt.id}:${e.grams}`).join(",");
  const b = `${state.batch.volumeL}-${state.batch.efficiency}-${state.batch.attenuation}`;
  const h = g ? `#g=${encodeURIComponent(g)}&b=${b}` : "";
  history.replaceState(null, "", location.pathname + h);
}
function loadFromHash() {
  const h = new URLSearchParams(location.hash.slice(1));
  const g = h.get("g");
  if (g) {
    for (const part of g.split(",")) {
      const [id, grams] = part.split(":");
      if (byId[id]) state.entries.push({ malt: byId[id], grams: Math.max(0, +grams || 0) });
    }
  }
  const b = h.get("b");
  if (b) {
    const [v, e, a] = b.split("-").map(Number);
    if (v) state.batch = { volumeL: v, efficiency: e || 72, attenuation: a || 78 };
  }
}
async function share() {
  writeHash();
  try { await navigator.clipboard.writeText(location.href); flash("Link copied"); }
  catch { flash("Copy the URL to share"); }
}
function flash(msg) {
  const b = $("#share"); const old = b.textContent;
  b.textContent = msg; setTimeout(() => (b.textContent = old), 1400);
}

function loadExample() {
  const pick = (id, g) => byId[id] && { malt: byId[id], grams: g };
  state.entries = [
    pick("munich-malt-type-1", 3000), pick("caramunich-type-1", 600),
    pick("carafa-special-type-1", 200), pick("melanoidin-malt", 300),
  ].filter(Boolean);
  render();
}
