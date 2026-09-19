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

  /* ---- Home news slider ---- */
  const newsSlider = document.getElementById('newsSlider');
  if (newsSlider) {
    const slides = Array.from(newsSlider.querySelectorAll('.home-news-slide'));
    const dotsContainer = newsSlider.querySelector('.home-news-dots');
    const prevButton = newsSlider.querySelector('.home-news-prev');
    const nextButton = newsSlider.querySelector('.home-news-next');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let currentSlide = 0;
    let newsTimer = null;

    slides.forEach((slide, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'home-news-dot' + (index === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', `${index + 1}件目のお知らせを表示`);
      dot.addEventListener('click', () => showNewsSlide(index));
      dotsContainer.appendChild(dot);
    });

    const newsDots = Array.from(dotsContainer.querySelectorAll('.home-news-dot'));

    function showNewsSlide(index) {
      slides[currentSlide].classList.remove('is-active');
      slides[currentSlide].setAttribute('aria-hidden', 'true');
      newsDots[currentSlide].classList.remove('is-active');
      currentSlide = (index + slides.length) % slides.length;
      slides[currentSlide].classList.add('is-active');
      slides[currentSlide].removeAttribute('aria-hidden');
      newsDots[currentSlide].classList.add('is-active');
    }

    function stopNewsSlider() {
      if (newsTimer) window.clearInterval(newsTimer);
      newsTimer = null;
    }

    function startNewsSlider() {
      stopNewsSlider();
      if (slides.length > 1 && !reduceMotion) {
        newsTimer = window.setInterval(() => showNewsSlide(currentSlide + 1), 5000);
      }
    }

    if (slides.length < 2) {
      newsSlider.classList.add('has-single-slide');
    } else {
      slides.slice(1).forEach(slide => slide.setAttribute('aria-hidden', 'true'));
      prevButton.addEventListener('click', () => {
        showNewsSlide(currentSlide - 1);
        startNewsSlider();
      });
      nextButton.addEventListener('click', () => {
        showNewsSlide(currentSlide + 1);
        startNewsSlider();
      });
      newsSlider.addEventListener('mouseenter', stopNewsSlider);
      newsSlider.addEventListener('mouseleave', startNewsSlider);
      newsSlider.addEventListener('focusin', stopNewsSlider);
      newsSlider.addEventListener('focusout', startNewsSlider);
      startNewsSlider();
    }
  }

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
