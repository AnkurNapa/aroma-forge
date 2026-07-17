// Bilingual (English / Deutsch) strings, descriptor + style labels, and
// tasting-note templates. Language persists in localStorage and the URL.

let LANG = "en";
export const getLang = () => LANG;
export function setLang(l) { LANG = (l === "de" ? "de" : "en"); try { localStorage.setItem("aromaforge.lang", LANG); } catch {} }
export function initLang() {
  const u = new URLSearchParams(location.hash.slice(1)).get("l");
  let l = u || (() => { try { return localStorage.getItem("aromaforge.lang"); } catch { return null; } })();
  if (!l) l = (navigator.language || "en").toLowerCase().startsWith("de") ? "de" : "en";
  LANG = l === "de" ? "de" : "en";
}

const UI = {
  tagline:      { en: "Superimpose Weyermann® Malt Aroma Wheels to predict your beer", de: "Weyermann® Malzaromaräder überlagern und dein Bier vorhersagen" },
  share:        { en: "Share", de: "Teilen" }, linkCopied: { en: "Link copied", de: "Link kopiert" }, copyUrl: { en: "Copy the URL", de: "URL kopieren" },
  example:      { en: "Example", de: "Beispiel" }, clear: { en: "Clear", de: "Leeren" },
  malts:        { en: "Malts", de: "Malze" }, grist: { en: "Grist", de: "Schüttung" },
  recipes:      { en: "Recipes", de: "Rezepte" }, predictedBeer: { en: "Predicted beer", de: "Vorhergesagtes Bier" },
  dragHint:     { en: "drag or click malts here", de: "Malze hierher ziehen oder anklicken" },
  searchPh:     { en: "Search 57 Weyermann malts…", de: "57 Weyermann-Malze suchen…" },
  gristEmpty:   { en: "Drag or click malts to build your grist.", de: "Malze ziehen oder anklicken, um die Schüttung zu bauen." },
  noMatch:      { en: "No malts match.", de: "Keine Malze gefunden." },
  noAromaTip:   { en: "No aroma wheel (extract/kit) — excluded from aroma prediction", de: "Kein Aromarad (Extrakt/Kit) — nicht in der Aromavorhersage" },
  batch:        { en: "Batch", de: "Sud" }, efficiency: { en: "Efficiency", de: "Ausbeute" }, attenuation: { en: "Attenuation", de: "Vergärung" },
  grain:        { en: "grain", de: "Malz" }, grainKg: { en: "kg grain", de: "kg Malz" },
  nameRecipe:   { en: "name this recipe…", de: "Rezept benennen…" }, save: { en: "Save", de: "Speichern" },
  compareHint:  { en: "Save grists to compare them side by side.", de: "Schüttungen speichern, um sie zu vergleichen." },
  vs:           { en: "vs", de: "vs" }, load: { en: "Load", de: "Laden" }, del: { en: "Delete", de: "Löschen" }, compare: { en: "Compare (overlay)", de: "Vergleichen (überlagern)" },
  radarCap:     { en: "Combined profile (filled) over each malt's wheel (outlines)", de: "Kombiniertes Profil (gefüllt) über den Rädern der Malze (Umrisse)" },
  og: { en: "OG", de: "SW" }, abv: { en: "ABV", de: "Alk." }, grainStat: { en: "Grain", de: "Malz" },
  tastingLabel: { en: "Predicted tasting note", de: "Vorhergesagte Geschmacksnotiz" },
  addPrompt:    { en: "Add malts to the grist to predict the aroma.", de: "Füge Malze zur Schüttung hinzu, um das Aroma vorherzusagen." },
  closestStyles:{ en: "Closest beer styles", de: "Nächste Bierstile" }, onTarget: { en: "on target", de: "im Ziel" },
  more: { en: "more", de: "mehr" }, less: { en: "less", de: "weniger" },
  dominantNotes:{ en: "Dominant notes", de: "Dominante Noten" }, whatDrives: { en: "What drives them", de: "Woher sie kommen" }, from: { en: "from", de: "aus" },
  actualWheel:  { en: "Actual Weyermann wheel", de: "Original Weyermann-Rad" },
  aboutTitle:   { en: "What this is & how to use it", de: "Was das ist & wie man es nutzt" },
  whatDoes:     { en: "What it does", de: "Was es macht" }, howUse: { en: "How a brewer uses it", de: "Wie ein Brauer es nutzt" },
  indieTag:     { en: "Independent, non-commercial tool", de: "Unabhängiges, nicht-kommerzielles Werkzeug" },
  navBuilder:   { en: "Recipe builder", de: "Rezept-Builder" }, navHow: { en: "How it works", de: "So funktioniert's" },
  navStyles:    { en: "Beer styles", de: "Bierstile" }, navAbout: { en: "About", de: "Über" }, navSource: { en: "Source", de: "Quellcode" },
  footTool:     { en: "The tool", de: "Das Werkzeug" }, footData: { en: "Data & method", de: "Daten & Methode" },
  footContact:  { en: "Contact", de: "Kontakt" }, backToTop: { en: "Back to top ↑", de: "Nach oben ↑" },
};
export const t = k => (UI[k] ? UI[k][LANG] : k);

const D = {
  "Coffee": "Kaffee", "Cacao": "Kakao", "Dark Chocolate": "Zartbitterschokolade", "Roasted Almond": "Geröstete Mandel",
  "Dried Fruit": "Trockenfrucht", "Bready": "Brotig", "Wood Smoke": "Rauch", "Clove": "Nelke", "Almond": "Mandel",
  "Hazelnut": "Haselnuss", "Raisin": "Rosine", "Vanilla": "Vanille", "Honey": "Honig", "Biscuit": "Biskuit",
  "Marmalade": "Marmelade", "Malty-Sweet": "Malzig-süß", "Toffee": "Toffee", "Light Caramel": "Helles Karamell",
  "Dark Caramel": "Dunkles Karamell", "Sour": "Sauer", "Sweet": "Süß", "Bitter": "Bitter",
};
export const dLabel = k => (LANG === "de" && D[k]) ? D[k] : k;

const G = { roasted: "Röstaromen", smoky: "Raucharomen", nutty: "Fruchtig/Nussig", malty: "Malzig", caramel: "Karamell", taste: "Geschmack" };
export const gLabel = (key, fallback) => (LANG === "de" && G[key]) ? G[key] : fallback;

const S = {
  "Pilsner / Helles": "Pilsner / Helles", "Munich Helles / Festbier": "Münchner Helles / Festbier",
  "Vienna / Märzen": "Wiener / Märzen", "Bock / Doppelbock": "Bock / Doppelbock", "Amber / Red Ale": "Amber / Red Ale",
  "Dunkel / Dark Lager": "Dunkles Lager", "Schwarzbier": "Schwarzbier", "Brown Ale": "Brown Ale", "Porter": "Porter",
  "Stout": "Stout", "Pale Ale / IPA base": "Pale Ale / IPA-Basis", "Weissbier": "Weißbier", "Dunkelweizen": "Dunkelweizen",
  "Rauchbier": "Rauchbier", "Belgian Dubbel": "Belgisches Dubbel",
};
export const sName = name => (LANG === "de" && S[name]) ? S[name] : name;

// Rich HTML blocks (author-controlled content). Keyed by element id.
const CONTENT = {
  notice: {
    en: `<strong>Independent, non-commercial tool.</strong> Not an official Weyermann® resource and not affiliated with or endorsed by Weyermann® Specialty Malts. Aroma data digitized from Weyermann's publicly published Malt Aroma Wheels® for educational, non-profit use. All wheels and trademarks © Weyermann®.`,
    de: `<strong>Unabhängiges, nicht-kommerzielles Werkzeug.</strong> Keine offizielle Weyermann®-Ressource und weder mit Weyermann® Spezialmalze verbunden noch von ihnen unterstützt. Aromadaten aus Weyermanns öffentlich veröffentlichten Malzaromarädern® für Bildungs- und Non-Profit-Zwecke digitalisiert. Alle Räder und Marken © Weyermann®.`,
  },
  "about-what": {
    en: `<p>Every Weyermann® malt ships with a <strong>Malt Aroma Wheel</strong> — a sensory fingerprint scored 0–5 across 22 flavor notes (coffee, toffee, biscuit, smoke, and so on). Those wheels describe one malt at a time. Aroma Forge <strong>superimposes them</strong>: tell it your grist and it blends the wheels — weighted by how much of each malt you use <em>and</em> how potent that malt is — into a single predicted flavor fingerprint for the finished beer, plus its color, gravity and ABV. It builds on Prof. Voigt's malt-aroma research at Trier, taken from single malts to whole recipes.</p>`,
    de: `<p>Jedes Weyermann®-Malz hat ein <strong>Malzaromarad</strong> — einen sensorischen Fingerabdruck, bewertet von 0–5 über 22 Aromanoten (Kaffee, Toffee, Biskuit, Rauch usw.). Diese Räder beschreiben jeweils ein einzelnes Malz. Aroma Forge <strong>überlagert sie</strong>: Gib deine Schüttung ein, und es mischt die Räder — gewichtet nach dem Anteil jedes Malzes <em>und</em> seiner Aromastärke — zu einem einzigen vorhergesagten Geschmacksprofil des fertigen Bieres, samt Farbe, Stammwürze und Alkohol. Es baut auf Prof. Voigts Malzaroma-Forschung in Trier auf, vom Einzelmalz zum ganzen Rezept.</p>`,
  },
  "about-how": {
    en: `<li><strong>Design before you brew.</strong> Try a grist and see the flavor, color and ABV you'll likely get — before buying grain or firing the kettle.</li>
      <li><strong>Right-size specialty malts.</strong> See how a few percent of CARAFA® or a caramel malt shifts the whole profile, so you dial in the smallest charge that lands the note you want.</li>
      <li><strong>Hit a target style.</strong> The style match scores your grist against Pilsner, Dunkel, Stout, Rauchbier and more, and tells you what's over or under.</li>
      <li><strong>Trace every note.</strong> "What drives them" shows which malt is responsible for each flavor, so you know exactly what to adjust.</li>
      <li><strong>Compare and save.</strong> Save grists, overlay two on the radar, and share a recipe with a link.</li>`,
    de: `<li><strong>Planen vor dem Brauen.</strong> Probiere eine Schüttung und sieh Geschmack, Farbe und Alkohol, die du wahrscheinlich erhältst — bevor du Malz kaufst oder die Sudpfanne anheizt.</li>
      <li><strong>Spezialmalze richtig dosieren.</strong> Sieh, wie wenige Prozent CARAFA® oder ein Karamellmalz das ganze Profil verschieben, und finde die kleinste Gabe für die gewünschte Note.</li>
      <li><strong>Zielstil treffen.</strong> Der Stilabgleich bewertet deine Schüttung gegen Pilsner, Dunkles, Stout, Rauchbier und mehr und zeigt, was zu viel oder zu wenig ist.</li>
      <li><strong>Jede Note zurückverfolgen.</strong> „Woher sie kommen" zeigt, welches Malz für welches Aroma verantwortlich ist.</li>
      <li><strong>Vergleichen und speichern.</strong> Schüttungen speichern, zwei im Rad überlagern und ein Rezept per Link teilen.</li>`,
  },
  "about-contact": {
    en: `<span>Built by <strong>Ankur Napa</strong> — brewer &amp; brewing data scientist. Ideas or feedback welcome:</span>
      <a class="contact-btn" href="mailto:napaankur@gmail.com">✉ napaankur@gmail.com</a>
      <a class="contact-btn" href="https://www.linkedin.com/in/ankur-napa" target="_blank" rel="noopener">in LinkedIn</a>`,
    de: `<span>Erstellt von <strong>Ankur Napa</strong> — Brauer &amp; Brau-Data-Scientist. Ideen oder Feedback willkommen:</span>
      <a class="contact-btn" href="mailto:napaankur@gmail.com">✉ napaankur@gmail.com</a>
      <a class="contact-btn" href="https://www.linkedin.com/in/ankur-napa" target="_blank" rel="noopener">in LinkedIn</a>`,
  },
  foot: {
    en: `<strong>Independent, non-commercial project — not affiliated with or endorsed by Weyermann® Specialty Malts.</strong> Aroma vectors digitized from Weyermann's publicly published Malt Aroma Wheels® for educational use. Predictions are model estimates for recipe design, not lab measurements. Wheels and trademarks © Weyermann® Specialty Malts. Method inspired by Voigt &amp; Féchir (Trier University) malt-aroma research.`,
    de: `<strong>Unabhängiges, nicht-kommerzielles Projekt — nicht mit Weyermann® Spezialmalze verbunden oder von ihnen unterstützt.</strong> Aromawerte aus Weyermanns öffentlich veröffentlichten Malzaromarädern® für Bildungszwecke digitalisiert. Vorhersagen sind Modellschätzungen für den Rezeptentwurf, keine Labormessungen. Räder und Marken © Weyermann® Spezialmalze. Methode inspiriert von Voigt &amp; Féchir (Hochschule Trier).`,
  },
  "foot-blurb": {
    en: `Predict a beer's flavor by superimposing the Malt Aroma Wheels of a Weyermann® grist — aroma radar, color, ABV, style match and a tasting note.`,
    de: `Sagt den Biergeschmack voraus, indem es die Malzaromaräder einer Weyermann®-Schüttung überlagert — Aromarad, Farbe, Alkohol, Stilabgleich und Geschmacksnotiz.`,
  },
  "foot-tool": {
    en: `<li><a href="#builder">Recipe builder</a></li><li><a href="#how">How it works</a></li><li><a href="#styles">Beer styles</a></li><li><a href="#" data-share>Share this recipe</a></li>`,
    de: `<li><a href="#builder">Rezept-Builder</a></li><li><a href="#how">So funktioniert's</a></li><li><a href="#styles">Bierstile</a></li><li><a href="#" data-share>Rezept teilen</a></li>`,
  },
  "foot-data": {
    en: `<li><a href="https://www.weyermann.de/en-us/the-malt-aroma-wheel-2/" target="_blank" rel="noopener">Weyermann® Malt Aroma Wheel®</a></li><li><a href="https://ankurnapa.github.io/indian-brewing-calculator/" target="_blank" rel="noopener">Indian Brewer's Calculator</a></li>`,
    de: `<li><a href="https://www.weyermann.de/en-us/the-malt-aroma-wheel-2/" target="_blank" rel="noopener">Weyermann® Malzaromarad®</a></li><li><a href="https://ankurnapa.github.io/indian-brewing-calculator/" target="_blank" rel="noopener">Indian Brewer's Calculator</a></li>`,
  },
  "foot-contact": {
    en: `<p>Built by <strong>Ankur Napa</strong><br>Brewer &amp; brewing data scientist</p><a class="contact-btn dark" href="mailto:napaankur@gmail.com">✉ napaankur@gmail.com</a><a class="contact-btn dark" href="https://www.linkedin.com/in/ankur-napa" target="_blank" rel="noopener">in LinkedIn</a>`,
    de: `<p>Erstellt von <strong>Ankur Napa</strong><br>Brauer &amp; Brau-Data-Scientist</p><a class="contact-btn dark" href="mailto:napaankur@gmail.com">✉ napaankur@gmail.com</a><a class="contact-btn dark" href="https://www.linkedin.com/in/ankur-napa" target="_blank" rel="noopener">in LinkedIn</a>`,
  },
};
export const content = id => (CONTENT[id] ? CONTENT[id][LANG] : "");
export const CONTENT_IDS = Object.keys(CONTENT);

