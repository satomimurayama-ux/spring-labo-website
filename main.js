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
