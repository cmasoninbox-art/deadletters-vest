// DEAD LETTERS - Vest Customiser Logic

const BASE_PRICE = 899;

const LABELS = {
  leather: {
    black: 'Black',
    brown: 'Brown',
    oxblood: 'Oxblood',
    tan: 'Tan',
  },
  gender: {
    male: 'Male',
    female: 'Female',
  },
  cut: {
    classic: 'Classic',
    long: 'Long Cut',
    cutoff: 'Cutoff',
  },
  closure: {
    zip: 'Heavy Zip',
    bolo: 'Bolo Cord',
    buckle: 'Buckle Strap',
    snap: 'Snap Buttons',
  },
  collar: {
    v: 'V-Neck',
    stand: 'Stand-Up',
    notch: 'Notch',
  },
  braid: {
    none: 'None',
    single: 'Single Braid',
    double: 'Double Braid',
  },
  stitch: {
    matching: 'Matching',
    white: 'White',
    red: 'Red',
    gold: 'Gold',
    silver: 'Silver',
  },
  patch: {
    none: 'No Patch',
    eagle: 'Eagle',
    cross: 'Skull & Cross',
    custom: 'Custom Text',
  },
  liner: {
    standard: 'Standard Mesh',
    breathable: 'Breathable Mesh',
    satin: 'Satin',
    diamond: 'Diamond Quilt',
  },
  kevlar: {
    none: 'None',
    '1layer': '1 Layer',
    '2layers': '2 Layers',
    '3layers': '3 Layers',
    '4layers': '4 Layers',
    '5layers': '5 Layers',
  },
  piping: {
    standard: 'Standard',
    white: 'White',
    red: 'Red',
    blue: 'Blue',
    gold: 'Metallic Gold',
    yellow: 'Warm Yellow',
    lemon: 'Lemon Yellow',
    maroon: 'Maroon',
    grey: 'Grey',
    black: 'Black',
  },
  reversible: {
    no: 'No',
    yes: 'Yes',
  },
};

const COLOUR_MAP = {
  leather: {
    black:   '#1a1a1a',
    brown:   '#3d1f0f',
    oxblood: '#4a1010',
    tan:     '#8b5a2b',
  },
  stitch: {
    matching: '#888888',
    white:    '#f0f0f0',
    red:      '#cc0000',
    gold:     '#c8a55c',
    silver:   '#b0b0b0',
  },
  piping: {
    standard:  '#888888',
    white:     '#f0f0f0',
    red:       '#cc0000',
    blue:      '#0033aa',
    gold:      '#c8a55c',
    yellow:    '#ffb700',
    lemon:     '#ffe400',
    maroon:    '#910027',
    grey:      '#797979',
    black:     '#1a1a1a',
  },
};

const OPTION_PRICES = {
  leather:     { black: 0, brown: 0, oxblood: 0, tan: 0 },
  gender:      { male: 0, female: 0 },
  cut:         { classic: 0, long: 80, cutoff: -30 },
  closure:     { zip: 0, bolo: 35, buckle: 55, snap: 25 },
  collar:      { v: 0, stand: 0, notch: 0 },
  braid:       { none: 0, single: 65, double: 120 },
  stitch:      { matching: 0, white: 0, red: 15, gold: 20, silver: 20 },
  patch:       { none: 0, eagle: 55, cross: 55, custom: 75 },
  liner:       { standard: 0, breathable: 30, satin: 50, diamond: 80 },
  kevlar:      { none: 0, '1layer': 75, '2layers': 150, '3layers': 225, '4layers': 300, '5layers': 375 },
  piping:      { standard: 0, white: 0, red: 0, blue: 0, gold: 0, yellow: 0, lemon: 0, maroon: 0, grey: 0, black: 0 },
  reversible:  { no: 0, yes: 0 },
};

const ADDON_PRICES = {
  extraPocket:        15,
  hiddenStash:        15,
  gunPocket:         30,
  zipperExtension:   100,
  heatedLiner:       175,
  customPrintedLiner:100,
  zipperAccess:       50,
  fullZipLiner:       75,
  customFit:         150,
};

const STATE = {
  leather:           'black',
  gender:            'male',
  cut:               'classic',
  closure:           'zip',
  collar:            'v',
  braid:             'none',
  stitch:            'matching',
  patch:             'none',
  patchText:         '',
  liner:             'standard',
  kevlar:            'none',
  piping:            'standard',
  reversible:        'no',
  extraPocket:      false,
  hiddenStash:      false,
  gunPocket:        false,
  zipperExtension:   false,
  heatedLiner:      false,
  customPrintedLiner:false,
  zipperAccess:      false,
  fullZipLiner:     false,
  customFit:        false,
};

const vestPreview    = document.getElementById('vestPreview');
const buildStatus    = document.getElementById('buildStatus');
const priceValue     = document.getElementById('priceValue');
const formSummary    = document.getElementById('formSummary');
const previewRef     = document.getElementById('previewRef');
const patchTextInput = document.getElementById('patchText');
const orderForm      = document.getElementById('orderForm');
const formSuccess    = document.getElementById('formSuccess');
const buildReference = document.getElementById('buildReference');

const money = (n) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(n);

function generateRef() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'DL-';
  for (let i = 0; i < 4; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}

const CAROUSEL_IMAGES = [
  { src: 'assets/main_vest.png', label: 'Front' },
  { src: 'assets/chest.jpg',    label: 'Chest Detail' },
  { src: 'assets/length.jpg',   label: 'Length' },
  { src: 'assets/toppatch.jpg', label: 'Top Patch' },
  { src: 'assets/shoulder.jpg', label: 'Shoulder' },
  { src: 'assets/stomach.jpg',  label: 'Stomach' },
  { src: 'assets/edge.jpg',     label: 'Edge/Braid' },
];
let carouselIndex = 0;

function buildCarouselDots() {
  const container = document.getElementById('carouselDots');
  if (!container) return;
  container.innerHTML = '';
  CAROUSEL_IMAGES.forEach(function(_, i) {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'View angle ' + (i + 1));
    dot.addEventListener('click', function() { goToSlide(i); });
    container.appendChild(dot);
  });
}

function goToSlide(index) {
  const total = CAROUSEL_IMAGES.length;
  carouselIndex = ((index % total) + total) % total;
  const img = document.getElementById('vestPreview');
  if (img) {
    img.classList.add('transitioning');
    setTimeout(function() {
      img.src = CAROUSEL_IMAGES[carouselIndex].src;
      img.alt = 'DEAD LETTERS vest - ' + CAROUSEL_IMAGES[carouselIndex].label;
      img.classList.remove('transitioning');
    }, 150);
  }
  document.querySelectorAll('.carousel-dot').forEach(function(dot, i) {
    dot.classList.toggle('active', i === carouselIndex);
  });
}

function initCarousel() {
  buildCarouselDots();
  var prev = document.getElementById('carouselPrev');
  var next = document.getElementById('carouselNext');
  if (prev) prev.addEventListener('click', function() { goToSlide(carouselIndex - 1); });
  if (next) next.addEventListener('click', function() { goToSlide(carouselIndex + 1); });
}

const MODEL_COLORS = {
  black:   [0.14, 0.14, 0.13],
  brown:   [0.24, 0.12, 0.06],
  oxblood: [0.29, 0.06, 0.06],
  tan:     [0.55, 0.35, 0.17],
};

function updateVest() {
  if (previewRef) previewRef.textContent = generateRef();
}

function calcTotal() {
  var total = BASE_PRICE;
  var group, prices, val;
  var groups = ['leather', 'gender', 'cut', 'closure', 'collar', 'braid', 'stitch', 'patch', 'liner', 'kevlar', 'piping', 'reversible'];
  for (var i = 0; i < groups.length; i++) {
    group = groups[i];
    prices = OPTION_PRICES[group];
    val = STATE[group];
    if (prices && val !== undefined && prices[val] !== undefined) {
      total += prices[val];
    }
  }
  if (STATE.extraPocket)       total += ADDON_PRICES.extraPocket;
  if (STATE.hiddenStash)       total += ADDON_PRICES.hiddenStash;
  if (STATE.gunPocket)         total += ADDON_PRICES.gunPocket;
  if (STATE.zipperExtension)    total += ADDON_PRICES.zipperExtension;
  if (STATE.heatedLiner)        total += ADDON_PRICES.heatedLiner;
  if (STATE.customPrintedLiner) total += ADDON_PRICES.customPrintedLiner;
  if (STATE.zipperAccess)      total += ADDON_PRICES.zipperAccess;
  if (STATE.fullZipLiner)       total += ADDON_PRICES.fullZipLiner;
  if (STATE.customFit)          total += ADDON_PRICES.customFit;
  return total;
}

function updatePrice() {
  var total = calcTotal();
  if (priceValue) priceValue.textContent = money(total);
  var leatherLabel = LABELS.leather[STATE.leather] || STATE.leather;
  var cutLabel = LABELS.cut[STATE.cut] || STATE.cut;
  var closureLabel = LABELS.closure[STATE.closure] || STATE.closure;
  var status = leatherLabel + ' / ' + cutLabel + ' / ' + closureLabel;
  if (buildStatus) buildStatus.textContent = status;
  if (formSummary) {
    var patchStr = STATE.patch !== 'none' ? ' / ' + LABELS.patch[STATE.patch] : '';
    formSummary.textContent = status + patchStr + ' / ' + money(total);
  }
  return total;
}

function syncChoices() {
  document.querySelectorAll('.choice').forEach(function(btn) {
    var key = btn.dataset.option;
    var val = btn.dataset.value;
    var isBool = typeof STATE[key] === 'boolean';
    var sel;
    if (isBool) {
      sel = val === 'true' ? STATE[key] : val === 'false' ? !STATE[key] : false;
    } else {
      sel = STATE[key] === val;
    }
    btn.classList.toggle('is-selected', sel);
    btn.setAttribute('aria-pressed', String(sel));
  });
}

syncChoices();
initCarousel();
updateVest();
updatePrice();

document.querySelectorAll('.choice').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var option = btn.dataset.option;
    var value = btn.dataset.value;
    if (typeof STATE[option] === 'boolean') {
      STATE[option] = value === 'true';
    } else {
      STATE[option] = value;
    }
    syncChoices();
    updateVest();
    updatePrice();
  });
});

if (patchTextInput) {
  patchTextInput.addEventListener('input', function() {
    STATE.patchText = patchTextInput.value.trim().toUpperCase();
    updateVest();
  });
}

var addToCartBtn = document.getElementById('addToCart');
if (addToCartBtn) {
  addToCartBtn.addEventListener('click', function() {
    var total = updatePrice();
    var ref = generateRef();
    var orderSection = document.getElementById('order');
    if (orderSection) orderSection.scrollIntoView({ behavior: 'smooth' });

    var notesField = document.querySelector('textarea[name="notes"]');
    if (notesField && !notesField.value) {
      var addOns = [];
      if (STATE.extraPocket)       addOns.push('Extra Inside Zip Pocket');
      if (STATE.hiddenStash)      addOns.push('Hidden Stash Pocket');
      if (STATE.gunPocket)         addOns.push('Gun Pocket');
      if (STATE.zipperExtension)   addOns.push('Zipper Extension Sides');
      if (STATE.heatedLiner)       addOns.push('Heated Liner');
      if (STATE.customPrintedLiner) addOns.push('Custom Printed Liner');
      if (STATE.zipperAccess)      addOns.push('Zipper Access Liner');
      if (STATE.fullZipLiner)      addOns.push('Full Zip Out Lining');
      if (STATE.customFit)         addOns.push('Custom Fit Alteration');

      var patchLine = '';
      if (STATE.patch !== 'none') {
        patchLine = '\nBack Patch: ' + LABELS.patch[STATE.patch];
        if (STATE.patch === 'custom' && STATE.patchText) {
          patchLine += ' - "' + STATE.patchText + '"';
        }
      }

      var kevlarLine = STATE.kevlar !== 'none' ? '\nKevlar: ' + LABELS.kevlar[STATE.kevlar] : '';
      var linerLine  = STATE.liner !== 'standard' ? '\nLiner: ' + LABELS.liner[STATE.liner] : '';
      var braidLine  = STATE.braid !== 'none' ? '\nBraid: ' + LABELS.braid[STATE.braid] : '';
      var stitchLine = '\nStitch: ' + LABELS.stitch[STATE.stitch];
      var pipingLine = STATE.piping !== 'standard' ? '\nPiping: ' + LABELS.piping[STATE.piping] : '';
      var reversLine = STATE.reversible === 'yes' ? '\nReversible: Yes' : '';
      var addOnLine  = addOns.length > 0 ? '\nAdd-ons: ' + addOns.join(', ') : '';

      notesField.value = [
        'Leather: ' + LABELS.leather[STATE.leather],
        'Gender: ' + LABELS.gender[STATE.gender],
        'Cut: ' + LABELS.cut[STATE.cut],
        'Closure: ' + LABELS.closure[STATE.closure],
        'Collar: ' + LABELS.collar[STATE.collar],
        stitchLine,
        braidLine,
        linerLine,
        kevlarLine,
        pipingLine,
        reversLine,
        patchLine,
        addOnLine,
        '',
        'Est. Total: ' + money(total),
        'Ref: ' + ref,
      ].filter(Boolean).join('\n');

      notesField.dispatchEvent(new Event('input'));
    }

    setTimeout(function() {
      var nameField = document.querySelector('input[name="name"]');
      if (nameField) nameField.focus();
    }, 600);
  });
}

var requestCallBtn = document.getElementById('requestCall');
if (requestCallBtn) {
  requestCallBtn.addEventListener('click', function() {
    var orderSection = document.getElementById('order');
    if (orderSection) orderSection.scrollIntoView({ behavior: 'smooth' });
    setTimeout(function() {
      var nameField = document.querySelector('input[name="name"]');
      if (nameField) nameField.focus();
    }, 500);
  });
}

if (orderForm) {
  orderForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!orderForm.checkValidity()) {
      orderForm.reportValidity();
      return;
    }
    var ref = generateRef();
    if (buildReference) buildReference.textContent = ref;
    if (formSuccess) formSuccess.hidden = false;
    var btn = orderForm.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Brief Sent';
    }
    if (formSuccess) formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}
