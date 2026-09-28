(function () {
  const grid = document.getElementById('mediaGrid');
  if (!grid) return; // Media section only exists on media.html

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

  let allItems = [];
  let currentCategory = 'all';
  let visibleCount = PAGE_SIZE;

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
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    if (isNaN(d.getTime())) return iso;
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  }

  function getDateLabel(item) {
    return item.dateLabel || formatDate(item.date);
  }

  function getFilteredItems() {
    return currentCategory === 'all'
      ? allItems
      : allItems.filter(item => item.category === currentCategory);
  }

  function buildCard(item) {
    const card = document.createElement('article');
    card.className = 'media-card';

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
    dateEl.textContent = getDateLabel(item);
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

    body.append(meta, mediaEl, titleEl, summaryEl);
    card.appendChild(body);

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

  /* ---- Init ---- */
  fetchMediaData().then(data => {
    allItems = data.slice().sort((a, b) => {
      const aDate = a.sortDate || a.date || '';
      const bDate = b.sortDate || b.date || '';
      return aDate < bDate ? 1 : -1;
    });
    render();
  });
})();
