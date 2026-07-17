# Aroma Forge

Predict the flavor, color and character of a beer from its Weyermann® malt grist by
**superimposing the malts' Malt Aroma Wheels**.

Drag malts into the grist, set each one's weight, and the app blends their aroma
vectors (weighted by grist share *and* aroma potency, so a small charge of a potent
specialty malt still shows up), then renders a combined aroma radar, dominant notes,
predicted color (EBC/SRM), OG/ABV, and a tasting note.

## How it works

- **Data**: each of 41 Weyermann Wort aroma wheels was digitized into a 22-descriptor
  0–5 vector. Malt specs (color, extract) come from Weyermann brewery datasheets.
- **Superposition**: combined intensity per descriptor blends a mass-weighted average
  (base character) with the strongest single contributor (so potent minority malts
  register). Calibrated so a single malt reproduces its own wheel.
- **Method inspiration**: Voigt & Féchir (Trier University) malt-aroma research —
  aroma compounds → sensory descriptors, and transfer from malt to beer.

Predictions are model estimates for recipe design, not lab measurements.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Pure client-side (vanilla ES modules, no build, no dependencies, no API keys).

## Credit

Malt Aroma Wheels and datasheets © Weyermann® Specialty Malts, Bamberg.
