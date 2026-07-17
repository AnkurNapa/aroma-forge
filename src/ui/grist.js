// Grist builder: rows of malt + grams, with live % of total. Drop target for palette drags.
import { el } from "./dom.js";
import { t } from "../i18n.js";

export function renderGrist(container, entries, { onChange, onRemove, batch, onBatch }) {
  container.innerHTML = "";
  const total = entries.reduce((s, e) => s + (e.grams || 0), 0);

  const rows = el("div", { class: "grist-rows" });
  if (!entries.length) {
    rows.append(el("div", { class: "grist-empty", text: t("gristEmpty") }));
  }
  entries.forEach((e, i) => {
    const pct = total ? (100 * e.grams / total) : 0;
    rows.append(el("div", { class: "grist-row" + (e.malt.aroma ? "" : " no-aroma") },
      el("div", { class: "gr-bar", style: `width:${Math.min(100, pct)}%` }),
      el("span", { class: "gr-name", text: e.malt.name }),
      el("input", {
        class: "gr-grams", type: "number", min: "0", step: "50", value: e.grams,
        "aria-label": `grams of ${e.malt.name}`,
        oninput: ev => onChange(i, Math.max(0, +ev.target.value || 0)),
      }),
      el("span", { class: "gr-unit", text: "g" }),
      el("span", { class: "gr-pct", text: pct.toFixed(1) + "%" }),
      el("button", { class: "gr-x", type: "button", title: "Remove", text: "×", onclick: () => onRemove(i) }),
    ));
  });

  const batchPanel = el("div", { class: "batch" },
    batchField(t("batch"), batch.volumeL, "L", 1, v => onBatch({ ...batch, volumeL: v })),
    batchField(t("efficiency"), batch.efficiency, "%", 1, v => onBatch({ ...batch, efficiency: v })),
    batchField(t("attenuation"), batch.attenuation, "%", 1, v => onBatch({ ...batch, attenuation: v })),
    el("div", { class: "batch-total", text: total ? `${(total / 1000).toFixed(2)} ${t("grainKg")}` : "" }),
  );

  container.append(rows, batchPanel);
}

function batchField(label, value, unit, step, cb) {
  return el("label", { class: "batch-field" },
    el("span", { class: "bf-label", text: label }),
    el("span", { class: "bf-wrap" },
      el("input", { type: "number", min: "0", step, value, oninput: e => cb(Math.max(0, +e.target.value || 0)) }),
      el("span", { class: "bf-unit", text: unit }),
    ),
  );
}
