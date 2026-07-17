// SVG aroma radar — draws the combined beer profile as a filled polygon over
// faint superimposed per-malt polygons, on a Weyermann-style colored wheel.

import { DESCRIPTORS, GROUP_COLOR } from "../descriptors.js";
import { dLabel } from "../i18n.js";

const SIZE = 520, CX = SIZE / 2, CY = SIZE / 2, R = 190, MAXV = 5;
const N = DESCRIPTORS.length;

const angle = i => (-90 + (360 / N) * i) * Math.PI / 180;
const pt = (i, v) => {
  const r = (v / MAXV) * R, a = angle(i);
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
};
const poly = vec => DESCRIPTORS.map((d, i) => pt(i, vec[d.key] || 0).join(",")).join(" ");

export function renderRadar(container, { vector, overlays = [], compare = null }) {
  const svg = [];
  svg.push(`<svg viewBox="0 0 ${SIZE} ${SIZE}" class="radar" role="img" aria-label="Predicted aroma radar">`);

  // colored group band on the outer edge
  DESCRIPTORS.forEach((d, i) => {
    const a0 = angle(i) - (Math.PI / N), a1 = angle(i) + (Math.PI / N);
    const r0 = R, r1 = R + 22;
    const p = [
      [CX + r0 * Math.cos(a0), CY + r0 * Math.sin(a0)],
      [CX + r1 * Math.cos(a0), CY + r1 * Math.sin(a0)],
      [CX + r1 * Math.cos(a1), CY + r1 * Math.sin(a1)],
      [CX + r0 * Math.cos(a1), CY + r0 * Math.sin(a1)],
    ].map(q => q.join(",")).join(" ");
    svg.push(`<polygon points="${p}" fill="${GROUP_COLOR[d.group]}" opacity="0.85"/>`);
  });

  // grid rings
  for (let v = 1; v <= MAXV; v++) {
    const pts = DESCRIPTORS.map((d, i) => pt(i, v).join(",")).join(" ");
    svg.push(`<polygon points="${pts}" class="grid-ring"/>`);
  }
  // spokes + labels
  DESCRIPTORS.forEach((d, i) => {
    const [x, y] = pt(i, MAXV);
    svg.push(`<line x1="${CX}" y1="${CY}" x2="${x}" y2="${y}" class="spoke"/>`);
    const [lx, ly] = pt(i, MAXV + 0.85);
    const anchor = Math.abs(lx - CX) < 6 ? "middle" : lx > CX ? "start" : "end";
    svg.push(`<text x="${lx}" y="${ly}" class="axis-label" text-anchor="${anchor}" dominant-baseline="middle">${dLabel(d.key)}</text>`);
  });

  // faint superimposed per-malt polygons
  overlays.forEach(o => {
    svg.push(`<polygon points="${poly(o.vector)}" fill="none" stroke="${o.color}" stroke-width="1.4" opacity="0.5" stroke-linejoin="round"/>`);
  });

  // compare (recipe B) profile, drawn distinctly beneath the active one
  if (compare && compare.vector) {
    svg.push(`<polygon points="${poly(compare.vector)}" fill="rgba(42,148,214,0.12)" stroke="#2a94d6" stroke-width="2" stroke-dasharray="5 4" stroke-linejoin="round"/>`);
  }

  // combined beer polygon
  svg.push(`<polygon points="${poly(vector)}" class="beer-shape"/>`);
  DESCRIPTORS.forEach((d, i) => {
    if ((vector[d.key] || 0) > 0.15) {
      const [x, y] = pt(i, vector[d.key]);
      svg.push(`<circle cx="${x}" cy="${y}" r="3.2" class="beer-dot"/>`);
    }
  });

  svg.push(`<circle cx="${CX}" cy="${CY}" r="4" class="hub"/>`);
  svg.push(`</svg>`);
  container.innerHTML = svg.join("");
}
