// Recipes bar: save the current grist, load/delete saved ones, and pick one to
// compare (overlay recipe B on the radar).
import { el } from "./dom.js";
import { loadAll } from "../store.js";
import { t } from "../i18n.js";

export function renderRecipes(container, { onSave, onLoad, onDelete, onCompare, compareName }) {
  container.innerHTML = "";
  const saved = loadAll();
  const names = Object.keys(saved);

  const nameInput = el("input", { class: "rc-name", type: "text", placeholder: t("nameRecipe"), maxlength: "32" });
  const saveBtn = el("button", {
    class: "btn small", type: "button", text: t("save"),
    onclick: () => { const n = nameInput.value.trim(); if (n) { onSave(n); nameInput.value = ""; } },
  });
  container.append(el("div", { class: "rc-saverow" }, nameInput, saveBtn));

  if (names.length) {
    const chips = el("div", { class: "rc-chips" });
    for (const n of names) {
      const isCmp = n === compareName;
      chips.append(el("div", { class: "rc-chip" + (isCmp ? " comparing" : "") },
        el("button", { class: "rc-load", type: "button", text: n, title: t("load"), onclick: () => onLoad(n) }),
        el("button", { class: "rc-cmp", type: "button", text: isCmp ? "◨ B" : t("vs"), title: t("compare"), onclick: () => onCompare(isCmp ? null : n) }),
        el("button", { class: "rc-del", type: "button", text: "×", title: t("del"), onclick: () => onDelete(n) }),
      ));
    }
    container.append(chips);
  } else {
    container.append(el("div", { class: "rc-hint", text: t("compareHint") }));
  }
}
