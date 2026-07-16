(function () {
  const INTERVAL_MS = 3000;
  const slider = document.getElementById('slider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.slide');
  const dotsContainer = document.getElementById('dots');
  let current = 0;
  let timerId = null;

  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' is-active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });
  const dots = dotsContainer.querySelectorAll('.dot');

  function goTo(index) {
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    current = index;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
  }

  function next() { goTo((current + 1) % slides.length); }
  function start() { stop(); timerId = setInterval(next, INTERVAL_MS); }
  function stop() { if (timerId) clearInterval(timerId); }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });

  start();
})();
