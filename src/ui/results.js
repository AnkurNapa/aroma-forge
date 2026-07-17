// Results panel: predicted color swatch, gravity/ABV stats, dominant aroma chips,
// tasting note, and the top malt drivers per dominant note.
import { el } from "./dom.js";
import { GROUP_COLOR } from "../descriptors.js";
import { dominantNotes } from "../engine/superpose.js";

export function renderResults(container, { vector, contributions, est, note, style, hasAroma }) {
  container.innerHTML = "";

  // Color + stat strip
  const strip = el("div", { class: "stat-strip" });
  if (est) {
    strip.append(
      el("div", { class: "swatch-wrap" },
        el("div", { class: "swatch", style: `background:${est.hex}` }),
        el("div", { class: "swatch-cap" },
          el("strong", { text: `${est.ebc} EBC` }),
          el("span", { text: `${est.srm} SRM` }),
        ),
      ),
      stat("OG", est.og.toFixed(3)),
      stat("ABV", est.abv > 0 ? est.abv + "%" : "—"),
      stat("Grain", est.totalKg + " kg"),
    );
  }
  container.append(strip);

  // Tasting note
  container.append(el("div", { class: "tasting" },
    el("div", { class: "tasting-label", text: "Predicted tasting note" }),
    el("p", { class: "tasting-note", text: note }),
    style ? el("div", { class: "style-hint", text: "≈ " + style }) : null,
  ));

  // Dominant notes chips
  const notes = dominantNotes(vector, { min: 1.7, limit: 8 });
  if (hasAroma && notes.length) {
    const chips = el("div", { class: "note-chips" });
    for (const n of notes) {
      chips.append(el("span", { class: "note-chip", style: `--c:${GROUP_COLOR[n.group]}` },
        el("span", { class: "nc-key", text: n.key }),
        el("span", { class: "nc-bar" }, el("i", { style: `width:${(n.value / 5) * 100}%; background:${GROUP_COLOR[n.group]}` })),
        el("span", { class: "nc-val", text: n.value.toFixed(1) }),
      ));
    }
    container.append(el("div", { class: "notes-block" },
      el("div", { class: "block-label", text: "Dominant notes" }), chips));
  }

  // Drivers for the top 3 notes
  if (hasAroma && notes.length) {
    const drv = el("div", { class: "drivers" });
    for (const n of notes.slice(0, 3)) {
      const list = (contributions[n.key] || []).filter(d => d.amount > 0.05);
      if (!list.length) continue;
      drv.append(el("div", { class: "driver-row" },
        el("span", { class: "dr-note", text: n.key }),
        el("span", { class: "dr-from", text: "from " + list.map(d => d.name).join(", ") }),
      ));
    }
    if (drv.children.length)
      container.append(el("div", { class: "notes-block" },
        el("div", { class: "block-label", text: "What drives them" }), drv));
  }
}

function stat(label, value) {
  return el("div", { class: "stat" },
    el("div", { class: "stat-val", text: value }),
    el("div", { class: "stat-lbl", text: label }));
}
