// Recipes bar: save the current grist, load/delete saved ones, and pick one to
// compare (overlay recipe B on the radar).
import { el } from "./dom.js";
import { loadAll } from "../store.js";

export function renderRecipes(container, { onSave, onLoad, onDelete, onCompare, compareName }) {
  container.innerHTML = "";
  const saved = loadAll();
  const names = Object.keys(saved);

  const nameInput = el("input", { class: "rc-name", type: "text", placeholder: "name this recipe…", maxlength: "32" });
  const saveBtn = el("button", {
    class: "btn small", type: "button", text: "Save",
    onclick: () => { const n = nameInput.value.trim(); if (n) { onSave(n); nameInput.value = ""; } },
  });
  container.append(el("div", { class: "rc-saverow" }, nameInput, saveBtn));

  if (names.length) {
    const chips = el("div", { class: "rc-chips" });
    for (const n of names) {
      const isCmp = n === compareName;
      chips.append(el("div", { class: "rc-chip" + (isCmp ? " comparing" : "") },
        el("button", { class: "rc-load", type: "button", text: n, title: "Load", onclick: () => onLoad(n) }),
        el("button", { class: "rc-cmp", type: "button", text: isCmp ? "◨ B" : "vs", title: "Compare (overlay)", onclick: () => onCompare(isCmp ? null : n) }),
        el("button", { class: "rc-del", type: "button", text: "×", title: "Delete", onclick: () => onDelete(n) }),
      ));
    }
    container.append(chips);
  } else {
    container.append(el("div", { class: "rc-hint", text: "Save grists to compare them side by side." }));
  }
}
