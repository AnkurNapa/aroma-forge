// Malt palette: searchable, grouped list. Click (or drag) a malt to add it to the grist.
import { el } from "./dom.js";

export function renderPalette(container, malts, { onAdd, inGrist }) {
  container.innerHTML = "";
  const search = el("input", {
    class: "search", type: "search", placeholder: "Search 57 Weyermann malts…",
    "aria-label": "Search malts",
    oninput: () => draw(search.value.trim().toLowerCase()),
  });
  const list = el("div", { class: "malt-list" });
  container.append(search, list);

  const byCat = {};
  for (const m of malts) (byCat[m.category] ||= []).push(m);

  function draw(q) {
    list.innerHTML = "";
    for (const [cat, items] of Object.entries(byCat)) {
      const shown = items.filter(m => !q || m.name.toLowerCase().includes(q) || cat.toLowerCase().includes(q));
      if (!shown.length) continue;
      list.append(el("div", { class: "cat-head", text: cat }));
      for (const m of shown) {
        const added = inGrist(m.id);
        const chip = el("button", {
          class: "malt-chip" + (added ? " added" : "") + (m.aroma ? "" : " no-aroma"),
          type: "button", draggable: "true",
          title: m.aroma ? "" : "No aroma wheel (extract/kit) — excluded from aroma prediction",
          onclick: () => onAdd(m.id),
          ondragstart: e => e.dataTransfer.setData("text/malt", m.id),
        },
          el("span", { class: "chip-name", text: m.name }),
          el("span", { class: "chip-meta", text: colorLabel(m) }),
        );
        list.append(chip);
      }
    }
    if (!list.children.length) list.append(el("div", { class: "empty", text: "No malts match." }));
  }
  draw("");
  return { refresh: () => draw(search.value.trim().toLowerCase()) };
}

function colorLabel(m) {
  if (m.ebc_min == null) return "—";
  const a = m.ebc_min, b = m.ebc_max ?? m.ebc_min;
  return a === b ? `${a} EBC` : `${a}–${b} EBC`;
}
