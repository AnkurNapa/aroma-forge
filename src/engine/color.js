// Color (SRM/EBC + swatch), gravity (OG) and ABV estimation from the grist.
// Standard homebrew formulas: Morey for color, extract points for gravity.

// Lovibond per malt: prefer measured Lovibond, else derive from EBC (EBC ≈ 1.97·SRM).
function maltLovibond(m) {
  if (m.lovibond_max != null) return m.lovibond_max;
  const ebc = m.ebc_max ?? m.ebc_min;
  if (ebc != null) return (ebc / 1.97);
  return 2;
}

// SRM -> approximate sRGB hex (condensed standard beer-color table, interpolated).
const SRM_HEX = {
  1:"#F3F993",2:"#F5F75C",3:"#F6F513",4:"#EAE615",6:"#E0D01B",8:"#CBB318",
  10:"#BF9F1C",13:"#BB8C21",17:"#B47210",20:"#A55D01",24:"#8E4A03",29:"#6A3906",
  35:"#5D341A",40:"#4C2B0F",60:"#361212",80:"#160603",100:"#0A0603"
};
export function srmToHex(srm) {
  const keys = Object.keys(SRM_HEX).map(Number).sort((a, b) => a - b);
  if (srm <= keys[0]) return SRM_HEX[keys[0]];
  if (srm >= keys[keys.length - 1]) return SRM_HEX[keys[keys.length - 1]];
  let lo = keys[0], hi = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) {
    if (srm >= keys[i] && srm <= keys[i + 1]) { lo = keys[i]; hi = keys[i + 1]; break; }
  }
  const t = (srm - lo) / (hi - lo);
  const mix = (a, b) => Math.round(parseInt(a, 16) + t * (parseInt(b, 16) - parseInt(a, 16)));
  const c = h => [h.slice(1, 3), h.slice(3, 5), h.slice(5, 7)];
  const [a, b] = [c(SRM_HEX[lo]), c(SRM_HEX[hi])];
  const rgb = [0, 1, 2].map(i => mix(a[i], b[i]).toString(16).padStart(2, "0"));
  return "#" + rgb.join("");
}

const KG_TO_LB = 2.20462, L_TO_GAL = 0.264172;

export function estimate(entries, batch) {
  const { volumeL = 20, efficiency = 72, attenuation = 78 } = batch || {};
  const active = entries.filter(e => e.malt && e.grams > 0);
  const totalG = active.reduce((s, e) => s + e.grams, 0);
  const volGal = volumeL * L_TO_GAL;
  if (!totalG || !volGal) return null;

  // Color (Morey): MCU = Σ(grainLb · °L) / volGal ; SRM = 1.4922 · MCU^0.6859
  let mcu = 0;
  for (const e of active) {
    const lb = (e.grams / 1000) * KG_TO_LB;
    mcu += lb * maltLovibond(e.malt);
  }
  mcu /= volGal;
  const srm = 1.4922 * Math.pow(mcu, 0.6859);
  const ebc = srm * 1.97;

  // Gravity: extract points. ~384 GU·L/kg at 100% extract; scale by malt extract% and efficiency.
  let points = 0; // gravity-units · L
  for (const e of active) {
    const extractFrac = (e.malt.extract ?? 78) / 100;
    points += (e.grams / 1000) * 384 * extractFrac;
  }
  const gu = (points * (efficiency / 100)) / volumeL; // gravity units (points)
  const og = 1 + gu / 1000;
  const fg = 1 + (gu * (1 - attenuation / 100)) / 1000;
  const abv = (og - fg) * 131.25;

  return {
    srm: +srm.toFixed(1), ebc: +ebc.toFixed(1), hex: srmToHex(srm),
    og: +og.toFixed(3), fg: +fg.toFixed(3), abv: +abv.toFixed(1),
    totalKg: +(totalG / 1000).toFixed(2),
  };
}
