(function () {
  /* ---- Header scroll state ---- */
  const header = document.getElementById('header');
  const hasHero = !!document.querySelector('.hero');

  if (hasHero) {
    // Home page: header starts transparent over the hero image, then
    // switches to the light/solid style once scrolled past it.
    function onScroll() {
      header.classList.toggle('is-scrolled', window.scrollY > 60);
    }
    window.addEventListener('scroll', onScroll);
    onScroll();
  } else {
    // Inner pages have no dark hero image behind the header, so keep it
    // permanently in the light/solid style (dark logo, legible on ivory).
    header.classList.add('is-scrolled');
  }

  /* ---- Mobile menu ---- */
  const menuBtn = document.getElementById('menuBtn');
  menuBtn.addEventListener('click', () => {
    document.body.classList.toggle('menu-open');
  });
  document.querySelectorAll('.nav a').forEach(a => {
    a.addEventListener('click', () => document.body.classList.remove('menu-open'));
  });

  /* ---- Services accordion ---- */
  const accordionItems = document.querySelectorAll('.accordion-item');
  accordionItems.forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    trigger.addEventListener('click', () => {
      const wasOpen = item.classList.contains('is-open');
      accordionItems.forEach(other => {
        other.classList.remove('is-open');
        other.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---- Radial services diagram ---- */
  const radialNodes = document.querySelectorAll('.radial-node');
  const serviceDetail = document.getElementById('serviceDetail');
  radialNodes.forEach(node => {
    node.addEventListener('click', () => {
      const wasActive = node.classList.contains('is-active');
      const targetId = node.getAttribute('aria-controls');
      radialNodes.forEach(other => {
        other.classList.remove('is-active');
        other.setAttribute('aria-expanded', 'false');
      });
      document.querySelectorAll('.service-detail-panel').forEach(panel => {
        panel.classList.remove('is-active');
      });
      if (!wasActive) {
        node.classList.add('is-active');
        node.setAttribute('aria-expanded', 'true');
        const panel = document.getElementById(targetId);
        if (panel) {
          panel.classList.add('is-active');
          panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
      if (serviceDetail) {
        serviceDetail.classList.toggle('has-active', document.querySelector('.radial-node.is-active') !== null);
      }
    });
  });

  /* ---- Reveal on scroll ---- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));
})();
