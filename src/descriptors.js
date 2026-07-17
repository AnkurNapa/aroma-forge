// The 22 Weyermann Malt Aroma Wheel descriptors, in wheel order (clockwise from top),
// grouped and colored to mirror the printed wheel.

export const GROUPS = [
  { key: "roasted", label: "Roasted",      color: "#8a2d17" },
  { key: "smoky",   label: "Smoky",        color: "#2a94d6" },
  { key: "nutty",   label: "Fruity / Nutty", color: "#4f9b34" },
  { key: "malty",   label: "Malty",        color: "#e07b25" },
  { key: "caramel", label: "Caramel",      color: "#efb42d" },
  { key: "taste",   label: "Taste",        color: "#c02a2a" },
];

export const DESCRIPTORS = [
  { key: "Coffee",         group: "roasted" },
  { key: "Cacao",          group: "roasted" },
  { key: "Dark Chocolate", group: "roasted" },
  { key: "Roasted Almond", group: "roasted" },
  { key: "Dried Fruit",    group: "roasted" },
  { key: "Bready",         group: "roasted" },
  { key: "Wood Smoke",     group: "smoky"   },
  { key: "Clove",          group: "smoky"   },
  { key: "Almond",         group: "nutty"   },
  { key: "Hazelnut",       group: "nutty"   },
  { key: "Raisin",         group: "nutty"   },
  { key: "Vanilla",        group: "nutty"   },
  { key: "Honey",          group: "nutty"   },
  { key: "Biscuit",        group: "malty"   },
  { key: "Marmalade",      group: "malty"   },
  { key: "Malty-Sweet",    group: "malty"   },
  { key: "Toffee",         group: "caramel" },
  { key: "Light Caramel",  group: "caramel" },
  { key: "Dark Caramel",   group: "caramel" },
  { key: "Sour",           group: "taste"   },
  { key: "Sweet",          group: "taste"   },
  { key: "Bitter",         group: "taste"   },
];

export const GROUP_COLOR = Object.fromEntries(GROUPS.map(g => [g.key, g.color]));
export const groupOf = k => (DESCRIPTORS.find(d => d.key === k) || {}).group;
