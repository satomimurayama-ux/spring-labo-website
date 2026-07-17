(function () {
  const grid = document.getElementById('mediaGrid');
  if (!grid) return; // Media section only exists on profile.html

  /* ---- Config ----
   * To move this to a CMS later (microCMS / Contentful / WordPress Headless /
   * Notion API, etc.), only fetchMediaData() needs to change — it just has to
   * keep resolving to an array of items shaped like the objects below.
   */
  const DATA_URL = 'data/media.json';
  const PAGE_SIZE = 6;

  const emptyEl = document.getElementById('mediaEmpty');
  const loadMoreWrap = document.getElementById('mediaLoadMoreWrap');
  const loadMoreBtn = document.getElementById('mediaLoadMoreBtn');
  const filtersEl = document.getElementById('mediaFilters');

  const modal = document.getElementById('mediaModal');
  const modalBackdrop = document.getElementById('mediaModalBackdrop');
  const modalClose = document.getElementById('mediaModalClose');
  const modalImage = document.getElementById('mediaModalImage');
  const modalMeta = document.getElementById('mediaModalMeta');
  const modalTitle = document.getElementById('mediaModalTitle');
  const modalSummary = document.getElementById('mediaModalSummary');
  const modalLink = document.getElementById('mediaModalLink');

  let allItems = [];
  let currentCategory = 'all';
  let visibleCount = PAGE_SIZE;
  let lastFocusedEl = null;

  async function fetchMediaData() {
    try {
      const res = await fetch(DATA_URL);
      if (!res.ok) throw new Error('Failed to load media data: ' + res.status);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  function formatDate(iso) {
    const d = new Date(iso + 'T00:00:00');
    if (isNaN(d.getTime())) return iso;
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  }

  function getFilteredItems() {
    return currentCategory === 'all'
      ? allItems
      : allItems.filter(item => item.category === currentCategory);
  }

  function buildCard(item) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'media-card';
    card.setAttribute('aria-haspopup', 'dialog');

    const thumb = document.createElement('span');
    thumb.className = 'media-card-thumb';
    if (item.thumbnail) {
      const img = document.createElement('img');
      img.src = item.thumbnail;
      img.alt = '';
      img.loading = 'lazy';
      img.addEventListener('error', () => {
        img.remove();
        thumb.classList.add('media-card-thumb--placeholder');
      });
      thumb.appendChild(img);
    } else {
      thumb.classList.add('media-card-thumb--placeholder');
    }
    card.appendChild(thumb);

    const body = document.createElement('span');
    body.className = 'media-card-body';

    const meta = document.createElement('span');
    meta.className = 'media-card-meta';
    const dateEl = document.createElement('span');
    dateEl.className = 'media-card-date';
    dateEl.textContent = formatDate(item.date);
    const categoryEl = document.createElement('span');
    categoryEl.className = 'media-card-category';
    categoryEl.textContent = item.category || '';
    meta.append(dateEl, categoryEl);

    const mediaEl = document.createElement('span');
    mediaEl.className = 'media-card-outlet';
    mediaEl.textContent = item.media || '';

    const titleEl = document.createElement('span');
    titleEl.className = 'media-card-title';
    titleEl.textContent = item.title || '';

    const summaryEl = document.createElement('span');
    summaryEl.className = 'media-card-summary';
    summaryEl.textContent = item.summary || '';

    const linkEl = document.createElement('span');
    linkEl.className = 'media-card-more';
    linkEl.textContent = '詳細を見る';

    body.append(meta, mediaEl, titleEl, summaryEl, linkEl);
    card.appendChild(body);

    card.addEventListener('click', () => openModal(item, card));

    return card;
  }

  function render() {
    const filtered = getFilteredItems();
    const itemsToShow = filtered.slice(0, visibleCount);

    grid.innerHTML = '';
    itemsToShow.forEach(item => grid.appendChild(buildCard(item)));

    emptyEl.hidden = filtered.length > 0;
    grid.hidden = filtered.length === 0;
    loadMoreWrap.hidden = visibleCount >= filtered.length;
  }

  function setCategory(category) {
    currentCategory = category;
    visibleCount = PAGE_SIZE;
    filtersEl.querySelectorAll('.media-filter-btn').forEach(btn => {
      const isActive = btn.dataset.category === category;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
    render();
  }

  filtersEl.addEventListener('click', e => {
    const btn = e.target.closest('.media-filter-btn');
    if (btn) setCategory(btn.dataset.category);
  });

  loadMoreBtn.addEventListener('click', () => {
    visibleCount += PAGE_SIZE;
    render();
  });

  /* ---- Modal ---- */
  function openModal(item, triggerEl) {
    lastFocusedEl = triggerEl;

    modalImage.innerHTML = '';
    if (item.thumbnail) {
      const img = document.createElement('img');
      img.src = item.thumbnail;
      img.alt = '';
      img.addEventListener('error', () => {
        img.remove();
        modalImage.classList.add('media-modal-image--placeholder');
      });
      modalImage.appendChild(img);
      modalImage.classList.remove('media-modal-image--placeholder');
    } else {
      modalImage.classList.add('media-modal-image--placeholder');
    }

    modalMeta.textContent = `${formatDate(item.date)}　${item.category || ''}　${item.media || ''}`;
    modalTitle.textContent = item.title || '';
    modalSummary.textContent = item.summary || '';

    if (item.link && item.link !== '#') {
      modalLink.href = item.link;
      modalLink.hidden = false;
    } else {
      modalLink.hidden = true;
    }

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
  fetchMediaData().then(data => {
    allItems = data.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
    render();
  });
})();
