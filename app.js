// DEAD LETTERS — Vest Customiser Logic

const BASE_PRICE = 899;

const LABELS = {
  leather: {
    black: 'Black',
    brown: 'Brown',
    oxblood: 'Oxblood',
    tan: 'Tan',
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
  patch: {
    none: 'No Patch',
    eagle: 'Eagle',
    cross: 'Skull & Cross',
    custom: 'Custom Text',
  },
};

const COLOUR_MAP = {
  leather: {
    black: '#1a1a1a',
    brown: '#3d1f0f',
    oxblood: '#4a1010',
    tan: '#8b5a2b',
  },
};

const OPTION_PRICES = {
  leather: { black: 0, brown: 0, oxblood: 0, tan: 0 },
  cut: { classic: 0, long: 80, cutoff: -30 },
  closure: { zip: 0, bolo: 35, buckle: 55, snap: 25 },
  collar: { v: 0, stand: 0, notch: 0 },
  braid: { none: 0, single: 65, double: 120 },
  patch: { none: 0, eagle: 55, cross: 55, custom: 75 },
};

const STATE = {
  leather: 'black',
  cut: 'classic',
  closure: 'zip',
  collar: 'v',
  braid: 'none',
  patch: 'none',
  patchText: '',
};

// DOM refs
const vestPreview  = document.getElementById('vestPreview');
const buildStatus  = document.getElementById('buildStatus');
const priceValue   = document.getElementById('priceValue');
const formSummary  = document.getElementById('formSummary');
const previewRef   = document.getElementById('previewRef');
const patchTextInput = document.getElementById('patchText');
const orderForm    = document.getElementById('orderForm');
const formSuccess  = document.getElementById('formSuccess');
const buildReference = document.getElementById('buildReference');

// Money formatter
const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

// Generate a rough reference
function generateRef() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'DL-';
  for (let i = 0; i < 4; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}

// Carousel — all real product renders
const CAROUSEL_IMAGES = [
  { src: 'assets/main_vest.png',   label: 'Front' },
  { src: 'assets/chest.jpg',        label: 'Chest' },
  { src: 'assets/length.jpg',       label: 'Length' },
  { src: 'assets/toppatch.jpg',     label: 'Top Patch' },
  { src: 'assets/shoulder.jpg',     label: 'Shoulder' },
  { src: 'assets/stomach.jpg',      label: 'Stomach' },
  { src: 'assets/edge.jpg',         label: 'Edge/Braid' },
];
let carouselIndex = 0;

function buildCarouselDots() {
  const container = document.getElementById('carouselDots');
  if (!container) return;
  container.innerHTML = '';
  CAROUSEL_IMAGES.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `View angle ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    container.appendChild(dot);
  });
}

function goToSlide(index) {
  const total = CAROUSEL_IMAGES.length;
  carouselIndex = ((index % total) + total) % total;
  const img = document.getElementById('vestPreview');
  if (img) {
    img.classList.add('transitioning');
    setTimeout(() => {
      img.src = CAROUSEL_IMAGES[carouselIndex].src;
      img.alt = 'DEAD LETTERS vest — ' + CAROUSEL_IMAGES[carouselIndex].label;
      img.classList.remove('transitioning');
    }, 150);
  }
  document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === carouselIndex);
  });
}

function initCarousel() {
  buildCarouselDots();
  document.getElementById('carouselPrev')?.addEventListener('click', () => goToSlide(carouselIndex - 1));
  document.getElementById('carouselNext')?.addEventListener('click', () => goToSlide(carouselIndex + 1));
}

// Map leather → approximate RGB for glTF model
const MODEL_COLORS = {
  black:   [0.14, 0.14, 0.13],
  brown:   [0.24, 0.12, 0.06],
  oxblood: [0.29, 0.06, 0.06],
  tan:     [0.55, 0.35, 0.17],
};

// Update preview — just reference now
function updateVest() {
  if (previewRef) {
    previewRef.textContent = generateRef();
  }
}

// Update price and status text
function updatePrice() {
  const total = Object.entries(OPTION_PRICES).reduce((sum, [group, prices]) => {
    return sum + (prices[STATE[group]] || 0);
  }, BASE_PRICE);

  if (priceValue) priceValue.textContent = money(total);

  const status = [LABELS.cut[STATE.cut], LABELS.leather[STATE.leather], LABELS.closure[STATE.closure]].join(' · ');
  if (buildStatus) buildStatus.textContent = status;

  if (formSummary) {
    const patchStr = STATE.patch !== 'none' ? ` · ${LABELS.patch[STATE.patch]}` : '';
    formSummary.textContent = `${status}${patchStr} · ${money(total)}`;
  }

  return total;
}

// Sync choice button selection
function syncChoices() {
  document.querySelectorAll('.choice').forEach(btn => {
    const sel = STATE[btn.dataset.option] === btn.dataset.value;
    btn.classList.toggle('is-selected', sel);
    btn.setAttribute('aria-pressed', String(sel));
  });
}

// Init
syncChoices();
initCarousel();
updateVest();
updatePrice();

// Choice clicks
document.querySelectorAll('.choice').forEach(btn => {
  btn.addEventListener('click', () => {
    const { option, value } = btn.dataset;
    STATE[option] = value;
    syncChoices();
    updateVest();
    updatePrice();
  });
});

// Custom patch text
patchTextInput?.addEventListener('input', () => {
  STATE.patchText = patchTextInput.value.trim().toUpperCase();
  updateVest();
});

// Add to order button
document.getElementById('addToCart')?.addEventListener('click', () => {
  const total = updatePrice();
  const ref = generateRef();

  // Scroll to order form and pre-fill notes
  document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' });

  const notesField = document.querySelector('textarea[name="notes"]');
  if (notesField && !notesField.value) {
    const patchStr = STATE.patch !== 'none'
      ? `\nBack Patch: ${LABELS.patch[STATE.patch]}${STATE.patch === 'custom' ? ` (${STATE.patchText})` : ''}`
      : '';
    notesField.value = [
      `Leather: ${LABELS.leather[STATE.leather]}`,
      `Cut: ${LABELS.cut[STATE.cut]}`,
      `Closure: ${LABELS.closure[STATE.closure]}`,
      `Collar: ${LABELS.collar[STATE.collar]}`,
      `Braid: ${LABELS.braid[STATE.braid]}`,
      patchStr,
      `Est. Total: ${money(total)}`,
    ].filter(Boolean).join('\n');

    // Trigger textarea input event so browser validation resets
    notesField.dispatchEvent(new Event('input'));
  }

  setTimeout(() => {
    document.querySelector('input[name="name"]')?.focus();
  }, 600);
});

// Talk to shop button
document.getElementById('requestCall')?.addEventListener('click', () => {
  document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => {
    document.querySelector('input[name="name"]')?.focus();
  }, 500);
});

// Form submit
orderForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!orderForm.checkValidity()) {
    orderForm.reportValidity();
    return;
  }
  const ref = generateRef();
  if (buildReference) buildReference.textContent = ref;
  if (formSuccess) formSuccess.hidden = false;
  const btn = orderForm.querySelector('button[type="submit"]');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Brief Sent';
  }
  formSuccess?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
