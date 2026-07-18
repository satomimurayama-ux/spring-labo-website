(function () {
  const diagram = document.getElementById('businessDiagram');
  if (!diagram) return; // Business hub only exists on business.html

  /* ---- Config ----
   * To move this to a CMS later (microCMS / Contentful / WordPress Headless /
   * Notion API, etc.), only fetchBusinessData() needs to change — it just has
   * to keep resolving to an array of items shaped like data/businesses.json.
   */
  const DATA_URL = 'data/businesses.json';

  const modal = document.getElementById('bizModal');
  const modalDialog = document.getElementById('bizModalDialog');
  const modalBackdrop = document.getElementById('bizModalBackdrop');
  const modalClose = document.getElementById('bizModalClose');
  const modalIcon = document.getElementById('bizModalIcon');
  const modalNumber = document.getElementById('bizModalNumber');
  const modalTitle = document.getElementById('bizModalTitle');
  const modalDesc = document.getElementById('bizModalDesc');
  const modalDetails = document.getElementById('bizModalDetails');

  let lastFocusedEl = null;

  /* ---- Accent colors: muted/dusty tones, with a slightly deeper shade
   * used for the hover / focus border, and an RGB triplet used for the
   * translucent click glow. ---- */
  const COLORS = {
    blue: { base: '#7C97A6', dark: '#5F7C8C', rgb: '124,151,166' },
    orange: { base: '#C98B57', dark: '#B06F3E', rgb: '201,139,87' },
    turquoise: { base: '#6FA8A0', dark: '#52897F', rgb: '111,168,160' },
    sage: { base: '#8FA888', dark: '#71906A', rgb: '143,168,136' },
    olive: { base: '#9A9A6B', dark: '#7F7F52', rgb: '154,154,107' },
    rose: { base: '#C98C93', dark: '#B06E76', rgb: '201,140,147' },
    lavender: { base: '#A79BC9', dark: '#8B7DB3', rgb: '167,155,201' },
    coral: { base: '#D98C86', dark: '#C46E67', rgb: '217,140,134' }
  };

  const PULSE_DURATION = 700; // ms, matches the bizCardGlow keyframes below

  /* ---- Line-icon set: each combines two onsen-inspired motifs, drawn as
   * simple stroked SVG paths so they inherit the card's accent color via
   * currentColor. ---- */
  const ICON_PATHS = {
    'water-quality':
      '<path d="M10 30c2.5-2.5 5 2.5 7.5 0s5-2.5 7.5 0 5-2.5 7.5 0 5-2.5 7.5 0"/>' +
      '<path d="M14 22c-2-2.5 1.5-4 0-7"/>' +
      '<path d="M24 22c-2-2.5 1.5-4 0-7"/>' +
      '<path d="M34 22c-2-2.5 1.5-4 0-7"/>',
    revitalization:
      '<path d="M6 34 16 16 22 26 28 14 40 34Z"/>' +
      '<path d="M6 39c4-2 6 2 10 0s6-2 10 0 6-2 10 0 6-2 8 0"/>',
    bathhouse:
      '<path d="M8 26v6a8 8 0 0 0 8 8h16a8 8 0 0 0 8-8v-6"/>' +
      '<ellipse cx="24" cy="26" rx="16" ry="5"/>' +
      '<path d="M18 14c-2-2 1-3 0-5"/>' +
      '<path d="M28 14c-2-2 1-3 0-5"/>',
    wellness:
      '<path d="M24 10c9 5 10 17 2 24-7-7-6-19-2-24Z"/>' +
      '<path d="M24 14v18"/>' +
      '<path d="M12 38c8-4 16-4 24 0"/>',
    tour:
      '<rect x="10" y="18" width="20" height="16" rx="3"/>' +
      '<path d="M16 18v-3a4 4 0 0 1 8 0v3"/>' +
      '<path d="M30 34 36 20 42 34Z"/>',
    product:
      '<rect x="17" y="16" width="14" height="20" rx="4"/>' +
      '<rect x="20" y="10" width="8" height="6" rx="1.5"/>' +
      '<path d="M35 18c-2-2 1-3 0-5"/>',
    seminar:
      '<rect x="20" y="8" width="8" height="14" rx="4"/>' +
      '<path d="M15 20a9 9 0 0 0 18 0"/>' +
      '<path d="M24 29v6"/>' +
      '<path d="M18 40h12"/>' +
      '<circle cx="9" cy="29" r="4"/>' +
      '<path d="M4 40c0-4 2.2-7 5-7s5 3 5 7"/>',
    pr:
      '<path d="M6 22v6h6l14 6V16l-14 6Z"/>' +
      '<path d="M30 20c3-1 5-1 8 0"/>' +
      '<path d="M30 24c3 0 5 0 8 0"/>' +
      '<path d="M30 28c3 1 5 1 8 0"/>'
  };

  function svgIcon(iconKey) {
    const paths = ICON_PATHS[iconKey] || ICON_PATHS['water-quality'];
    return (
      '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.7" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>'
    );
  }

  async function fetchBusinessData() {
    try {
      const res = await fetch(DATA_URL);
      if (!res.ok) throw new Error('Failed to load business data: ' + res.status);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  function buildCard(item, index) {
    const colors = COLORS[item.accentColor] || COLORS.blue;

    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'biz-card';
    card.style.setProperty('--i', index);
    card.style.setProperty('--accent-color', colors.base);
    card.style.setProperty('--accent-color-dark', colors.dark);
    card.style.setProperty('--accent-color-rgb', colors.rgb);
    card.setAttribute('aria-haspopup', 'dialog');
    card.setAttribute('aria-label', item.title);

    const icon = document.createElement('span');
    icon.className = 'biz-card-icon';
    icon.innerHTML = svgIcon(item.icon);

    const title = document.createElement('span');
    title.className = 'biz-card-title';
    title.textContent = item.title;

    const more = document.createElement('span');
    more.className = 'biz-card-more';
    more.textContent = '詳しく見る';

    card.append(icon, title, more);
    card.addEventListener('click', () => {
      pulseCard(card);
      openModal(item, card);
    });

    return card;
  }

  /* ---- Soft "poワン" glow pulse on click ---- */
  function pulseCard(card) {
    card.classList.remove('is-pulsing');
    // Force a reflow so re-adding the class restarts the animation
    // even if the same card is clicked again in quick succession.
    void card.offsetWidth;
    card.classList.add('is-pulsing');
    setTimeout(() => card.classList.remove('is-pulsing'), PULSE_DURATION);
  }

  function render(items) {
    diagram.querySelectorAll('.biz-card').forEach(el => el.remove());
    items.forEach((item, index) => diagram.appendChild(buildCard(item, index)));
  }

  /* ---- Modal ---- */
  function openModal(item, triggerEl) {
    lastFocusedEl = triggerEl;
    const colors = COLORS[item.accentColor] || COLORS.blue;

    modalDialog.style.setProperty('--biz-modal-accent', colors.base);
    modalIcon.innerHTML = svgIcon(item.icon);
    modalNumber.textContent = item.number ? `No.${item.number}` : '';
    modalTitle.textContent = item.title;
    modalDesc.textContent = item.shortDescription;

    modalDetails.innerHTML = '';
    (item.details || []).forEach(detail => {
      const li = document.createElement('li');
      li.textContent = detail;
      modalDetails.appendChild(li);
    });

    modal.hidden = false;
    document.body.classList.add('modal-open');
    modalClose.focus();

    document.addEventListener('keydown', onModalKeydown);
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    document.removeEventListener('keydown', onModalKeydown);
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  function onModalKeydown(e) {
    if (e.key === 'Escape') {
      closeModal();
      return;
    }
    if (e.key !== 'Tab') return;

    const focusable = modal.querySelectorAll('a[href]:not([hidden]), button:not([hidden])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  modalClose.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);

  /* ---- Init ---- */
  fetchBusinessData().then(render);
})();
