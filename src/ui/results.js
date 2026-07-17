// Results panel: predicted color, gravity/ABV, style matches, dominant aroma chips,
// tasting note, top malt drivers, and the dominant malt's real Weyermann wheel.
import { el } from "./dom.js";
import { GROUP_COLOR } from "../descriptors.js";
import { dominantNotes } from "../engine/superpose.js";

export function renderResults(container, opts) {
  const { vector, contributions, est, note, styles, hasAroma, wheelMap, compare } = opts;
  container.innerHTML = "";

  // Color + stat strip
  const strip = el("div", { class: "stat-strip" });
  if (est) {
    strip.append(
      el("div", { class: "swatch-wrap" },
        el("div", { class: "swatch", style: `background:${est.hex}` }),
        el("div", { class: "swatch-cap" }, el("strong", { text: `${est.ebc} EBC` }), el("span", { text: `${est.srm} SRM` })),
      ),
      stat("OG", est.og.toFixed(3)), stat("ABV", est.abv > 0 ? est.abv + "%" : "—"), stat("Grain", est.totalKg + " kg"),
    );
  }
  container.append(strip);

  // Compare (recipe B) mini strip
  if (compare && compare.est) {
    container.append(el("div", { class: "cmp-strip" },
      el("span", { class: "cmp-dot" }),
      el("span", { class: "cmp-name", text: "vs " + compare.name }),
      el("span", { class: "cmp-stat", text: `${compare.est.ebc} EBC · ${compare.est.abv}% · ${compare.top}` }),
    ));
  }

  // Tasting note
  container.append(el("div", { class: "tasting" },
    el("div", { class: "tasting-label", text: "Predicted tasting note" }),
    el("p", { class: "tasting-note", text: note }),
  ));

  // Style matches
  if (hasAroma && styles && styles.length) {
    const wrap = el("div", { class: "styles-block" });
    wrap.append(el("div", { class: "block-label", text: "Closest beer styles" }));
    styles.forEach((s, i) => {
      const gap = s.gaps.length
        ? s.gaps.map(g => `${g.d > 0 ? "more" : "less"} ${g.k.toLowerCase()}`).join(", ")
        : "on target";
      wrap.append(el("div", { class: "style-row" + (i === 0 ? " top" : "") },
        el("span", { class: "st-name", text: s.name }),
        el("span", { class: "st-meter" }, el("i", { style: `width:${s.score}%` })),
        el("span", { class: "st-score", text: s.score + "%" }),
        el("span", { class: "st-gap", text: gap }),
      ));
    });
    container.append(wrap);
  }

  // Dominant notes chips
  const notes = dominantNotes(vector, { min: 1.7, limit: 8 });
  if (hasAroma && notes.length) {
    const chips = el("div", { class: "note-chips" });
    for (const n of notes) {
      chips.append(el("span", { class: "note-chip" },
        el("span", { class: "nc-key", text: n.key }),
        el("span", { class: "nc-bar" }, el("i", { style: `width:${(n.value / 5) * 100}%; background:${GROUP_COLOR[n.group]}` })),
        el("span", { class: "nc-val", text: n.value.toFixed(1) }),
      ));
    }
    container.append(el("div", { class: "notes-block" }, el("div", { class: "block-label", text: "Dominant notes" }), chips));
  }

  // Drivers
  if (hasAroma && notes.length) {
    const drv = el("div", { class: "drivers" });
    for (const n of notes.slice(0, 3)) {
      const list = (contributions[n.key] || []).filter(d => d.amount > 0.05);
      if (!list.length) continue;
      drv.append(el("div", { class: "driver-row" },
        el("span", { class: "dr-note", text: n.key }),
        el("span", { class: "dr-from", text: "from " + list.map(d => d.name).join(", ") })));
    }
    if (drv.children.length) container.append(el("div", { class: "notes-block" }, el("div", { class: "block-label", text: "What drives them" }), drv));
  }

  // Dominant malt's real wheel
  if (hasAroma && opts.dominantMalt && wheelMap && wheelMap[opts.dominantMalt.id]) {
    container.append(el("details", { class: "wheel-detail" },
      el("summary", {}, `Actual Weyermann wheel — ${opts.dominantMalt.name}`),
      el("img", { class: "real-wheel", loading: "lazy", alt: `${opts.dominantMalt.name} aroma wheel`, src: `./assets/wheels/${opts.dominantMalt.id}.png` }),
    ));
  }
}

function stat(label, value) {
  return el("div", { class: "stat" }, el("div", { class: "stat-val", text: value }), el("div", { class: "stat-lbl", text: label }));
}
