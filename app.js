// DEAD LETTERS — Vest Customiser Logic
// Based on original crimwearco.com configurator options

const BASE_PRICE = 899;

// ── All real options from original site ───────────────────────────────────────

const LABELS = {
  gender: {
    male: 'Mens',
    female: 'Ladies',
  },
  leather: {
    black: 'Black',
    white: 'White',
    blue: 'Blue',
    red: 'Red',
    green: 'Green',
    orange: 'Orange',
    desertbrown: 'Desert Brown Perforated',
    stormgrey: 'Storm Grey Camo',
    blackops: 'Black Ops Perforated',
    blackperf: 'Black Perforated',
    multical: 'Multi Cam',
  },
  stitch: {
    matching: 'Matching',
    white: 'White',
    black: 'Black',
    blue: 'Blue',
    red: 'Red',
    green: 'Green',
    orange: 'Orange',
    grey: 'Grey',
  },
  liner: {
    standard: 'Standard Mesh',
    black: 'Black',
    matchstitch: 'Match Bandana / Stitch',
    custom: 'Custom / Other',
  },
  kevlar: {
    none: 'No Kevlar',
    '1layer': '1 Layer (+0.5mm)',
    '2layers': '2 Layers (+1mm)',
    '3layers': '3 Layers (+1.5mm)',
    '4layers': '4 Layers (+2mm)',
    '5layers': '5 Layers (+2.5mm)',
    '6layers': '6 Layers (+3mm)',
    '7layers': '7 Layers (+3.5mm)',
    '8layers': '8 Layers (+4mm)',
    '9layers': '9 Layers (+4.5mm)',
    '10layers': '10 Layers (+5mm)',
  },
  piping: {
    standard: 'Standard',
    white: 'White',
    red: 'Red',
    blue: 'Blue',
    gold: 'Metallic Gold',
    warmyellow: 'Warm Yellow',
    lemon: 'Lemon Yellow',
    maroon: 'Maroon',
    grey: 'Grey',
    black: 'Black',
  },
  linerType: {
    standard: 'Standard Mesh',
    breathable: 'Breathable Mesh',
    satin: 'Satin',
    diamond: 'Diamond Quilt',
  },
  measuredFrom: {
    body: 'Body Measurements',
    oldvest: 'Old Vest Measurements',
  },
  reversible: {
    no: 'No',
    yes: 'Yes',
  },
  zipperAccess: {
    no: 'No',
    yes: 'Yes',
  },
  zipperType: {
    bottom: 'Zipper Access at Bottom',
    full: 'Full Zip Out Lining',
  },
};

// ── Price modifiers ───────────────────────────────────────────────────────────

const PRICES = {
  kevlar: {
    none: 0,
    '1layer': 75,
    '2layers': 150,
    '3layers': 225,
    '4layers': 300,
    '5layers': 375,
    '6layers': 450,
    '7layers': 525,
    '8layers': 600,
    '9layers': 675,
    '10layers': 750,
  },
  linerType: {
    standard: 0,
    breathable: 30,
    satin: 50,
    diamond: 80,
  },
  reversible: { no: 0, yes: 75 },
  extraPocket: 15,
  hiddenStash: 15,
  gunPocket: 30,
  zipperExtension: 100,
  heatedLiner: 175,
  customPrintedLiner: 100,
  zipperAccess: 50,
  fullZipLiner: 75,
  customFit: 150,
  vNeck: 0,
  dutchCurvedBack: 0,
  fatstrap: 0,
};

// ── State ─────────────────────────────────────────────────────────────────────

const STATE = {
  gender: 'male',
  leather: 'black',
  stitch: 'matching',
  liner: 'standard',
  linerType: 'standard',
  kevlar: 'none',
  piping: 'standard',
  measuredFrom: 'body',
  reversible: 'no',
  zipperAccess: 'no',
  zipperType: 'bottom',
  // Measurements
  chest: '',
  stomach: '',
  length: '',
  shoulderWidth: '',
  neck: '',
  armHole: '',
  rockerWidth: '',
  // Add-ons
  vNeck: false,
  extraPocket: false,
  hiddenStash: false,
  gunPocket: false,
  zipperExtension: false,
  heatedLiner: false,
  customPrintedLiner: false,
  fullZipLiner: false,
  customFit: false,
  dutchCurvedBack: false,
  fatstrap: false,
};

// ── DOM refs ──────────────────────────────────────────────────────────────────

const refs = {
  leatherColor: document.getElementById('leatherColor'),
  modelViewer: document.getElementById('vestModel'),
  priceValue: document.getElementById('priceValue'),
  summaryText: document.getElementById('summaryText'),
  configForm: document.getElementById('configForm'),
};

// ── Init ─────────────────────────────────────────────────────────────────────

function init() {
  document.querySelectorAll('.choice-row').forEach(row => {
    const group = row.dataset.group;
    row.querySelectorAll('.choice').forEach(btn => {
      btn.addEventListener('click', () => selectChoice(row, btn, group));
    });
  });

  document.querySelectorAll('.toggle-row input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', e => {
      STATE[e.target.dataset.option] = e.target.checked;
      updatePrice();
    });
  });

  document.querySelectorAll('.measurement-input').forEach(input => {
    input.addEventListener('input', e => {
      STATE[e.target.dataset.field] = e.target.value;
    });
  });

  updatePrice();
}

// ── Selection ─────────────────────────────────────────────────────────────────

function selectChoice(row, btn, group) {
  row.querySelectorAll('.choice').forEach(b => {
    b.classList.remove('is-selected');
    b.setAttribute('aria-pressed', 'false');
  });
  btn.classList.add('is-selected');
  btn.setAttribute('aria-pressed', 'true');
  STATE[group] = btn.dataset.value;

  if (group === 'leather') {
    updateVestColor(btn.dataset.value);
  }
  updatePrice();
}

function updateVestColor(color) {
  if (!window.vestScene) return;
  const hexMap = {
    black: 0x1a1a1a,
    white: 0xf5f5f5,
    blue: 0x1a3a6e,
    red: 0x8b0000,
    green: 0x2d4a1e,
    orange: 0xb35000,
    desertbrown: 0x8b5a2b,
    stormgrey: 0x4a4a4a,
    blackops: 0x0d0d0d,
    blackperf: 0x1a1a1a,
    multical: 0x5c5c3c,
  };
  window.vestScene.traverse(obj => {
    if (obj.isMesh && obj.name === 'vestOuter') {
      if (obj.material) {
        obj.material.color.setHex(hexMap[color] || 0x1a1a1a);
        obj.material.needsUpdate = true;
      }
    }
  });
}

// ── Pricing ───────────────────────────────────────────────────────────────────

function updatePrice() {
  let price = BASE_PRICE;
  price += PRICES.kevlar[STATE.kevlar] || 0;
  price += PRICES.linerType[STATE.linerType] || 0;
  price += PRICES.reversible[STATE.reversible] || 0;
  if (STATE.extraPocket) price += PRICES.extraPocket;
  if (STATE.hiddenStash) price += PRICES.hiddenStash;
  if (STATE.gunPocket) price += PRICES.gunPocket;
  if (STATE.zipperExtension) price += PRICES.zipperExtension;
  if (STATE.heatedLiner) price += PRICES.heatedLiner;
  if (STATE.customPrintedLiner) price += PRICES.customPrintedLiner;
  if (STATE.zipperAccess) price += PRICES.zipperAccess;
  if (STATE.fullZipLiner) price += PRICES.fullZipLiner;
  if (STATE.customFit) price += PRICES.customFit;

  refs.priceValue.textContent = `$${price}`;

  if (refs.summaryText) {
    refs.summaryText.innerHTML = buildSummary();
  }

  if (refs.configForm) {
    updateFormSummary();
  }
}

function buildSummary() {
  const parts = [];
  parts.push(`<strong>DEAD LETTERS Custom Vest</strong>`);
  parts.push(`Gender: ${LABELS.gender[STATE.gender]}`);
  parts.push(`Leather: ${LABELS.leather[STATE.leather]}`);

  const cutLabel = STATE.cut === 'classic' ? 'Classic Cut' : 'Competition Cut';
  parts.push(`Cut: ${cutLabel}`);

  if (STATE.kevlar !== 'none') {
    parts.push(`Kevlar: ${LABELS.kevlar[STATE.kevlar]}`);
  }
  if (STATE.reversible === 'yes') {
    parts.push(`Reversible: Yes`);
  }
  if (STATE.stitch !== 'matching') {
    parts.push(`Stitch: ${LABELS.stitch[STATE.stitch]}`);
  }
  if (STATE.piping !== 'standard') {
    parts.push(`Piping: ${LABELS.piping[STATE.piping]}`);
  }
  if (STATE.linerType !== 'standard') {
    parts.push(`Liner: ${LABELS.linerType[STATE.linerType]}`);
  }
  const addons = [];
  if (STATE.extraPocket) addons.push('Extra Pocket');
  if (STATE.hiddenStash) addons.push('Hidden Stash');
  if (STATE.gunPocket) addons.push('Gun Pocket');
  if (STATE.zipperExtension) addons.push('Zipper Extension');
  if (STATE.heatedLiner) addons.push('Heated Liner');
  if (STATE.customPrintedLiner) addons.push('Custom Printed Liner');
  if (STATE.fullZipLiner) addons.push('Full Zip Liner');
  if (STATE.customFit) addons.push('Custom Fit');
  if (STATE.vNeck) addons.push('V-Neck');
  if (STATE.dutchCurvedBack) addons.push('Dutch Curved Back');
  if (STATE.fatstrap) addons.push('Zip In Fatstrap');
  if (addons.length) parts.push(`Add-ons: ${addons.join(', ')}`);

  const meas = [];
  if (STATE.chest) meas.push(`Chest: ${STATE.chest}cm`);
  if (STATE.stomach) meas.push(`Stomach: ${STATE.stomach}cm`);
  if (STATE.length) meas.push(`Length: ${STATE.length}cm`);
  if (STATE.shoulderWidth) meas.push(`Shoulder Width: ${STATE.shoulderWidth}cm`);
  if (STATE.neck) meas.push(`Neck: ${STATE.neck}cm`);
  if (STATE.armHole) meas.push(`Arm Hole: ${STATE.armHole}cm`);
  if (STATE.rockerWidth) meas.push(`Rocker Width: ${STATE.rockerWidth}cm`);
  if (meas.length) parts.push(`Measurements: ${meas.join(' | ')}`);

  return parts.map(p => `<div style="padding:2px 0">${p}</div>`).join('');
}

function updateFormSummary() {
  const summary = document.getElementById('orderSummary');
  if (!summary) return;
  summary.innerHTML = `
    <h3 style="margin-top:0">Order Summary</h3>
    <p style="font-size:1.4rem;font-weight:700">$${refs.priceValue.textContent.replace('$', '')} <span style="font-size:0.8rem;font-weight:400">AUD</span></p>
    <div style="margin-top:1rem;line-height:1.8">
      ${buildSummary()}
    </div>
  `;
}

// ── Form submit ───────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  init();

  const form = document.getElementById('configForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = { ...STATE };
      const params = new URLSearchParams(data);
      const msg = `DEAD LETTERS Vest Order\n\n${buildSummary().replace(/<[^>]+>/g, '\n')}`;
      alert(msg + '\n\nEmail us to place your order: info@deadletters.com.au');
    });
  }
});

// ── Expose vestScene for color updates ────────────────────────────────────────
window.vestScene = null;
