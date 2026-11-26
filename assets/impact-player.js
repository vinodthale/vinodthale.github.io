(() => {
  const film = document.getElementById('impact-film');
  const button = document.getElementById('motion-control');
  if (!film || !button) return;
  const choices = document.getElementById('impact-choices');
  const options = choices.querySelectorAll('.impact-choice');
  const source = film.querySelector('source');
  const caption = document.getElementById('impact-caption');
  const method = document.getElementById('impact-method');

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canObserve = 'IntersectionObserver' in window;
  let inView = false;
  let userChoice = null;
  let blocked = false;
  let completed = false;
  let playing = false;
  let pending = false;
  let request = 0;

  function shouldPlay() {
    const wantsMotion = userChoice ?? !reduced.matches;
    return inView && !document.hidden && wantsMotion && !blocked && !completed;
  }

  function updateButton() {
    const action = completed ? 'Replay' : playing && !film.paused ? 'Pause' : 'Play';
    button.textContent = action;
    const label = action + ' — ' + caption.textContent;
    button.setAttribute('aria-label', label);
    button.title = label;
  }

  function select(option) {
    if (option.getAttribute('aria-pressed') === 'true') return;
    // An old play promise can settle after a second thumbnail has been selected.
    request++;
    pending = playing = completed = blocked = false;
    film.pause();
    for (const item of options) item.setAttribute('aria-pressed', String(item === option));
    const clip = option.dataset;
    source.src = clip.video;
    film.poster = clip.poster;
    caption.textContent = clip.caption;
    caption.href = clip.research;
    method.textContent = clip.method;
    film.load();
    updateButton();
    sync();
  }
  for (const option of options) option.addEventListener('click', () => select(option));
  choices.hidden = false;

  function sync() {
    if (!shouldPlay()) {
      request++;
      if (pending || !film.paused) film.pause();
      pending = false;
      playing = false;
      updateButton();
      return;
    }
    if (pending || !film.paused) return;

    const ticket = ++request;
    pending = true;
    function onFailure() {
      if (ticket !== request) return;
      pending = false;
      blocked = true;
      playing = false;
      updateButton();
    }
    try {
      Promise.resolve(film.play()).then(() => {
        if (ticket !== request) return;
        pending = false;
        playing = !film.paused;
        updateButton();
      }, onFailure);
    } catch {
      onFailure();
    }
  }

  button.addEventListener('click', () => {
    userChoice = !(playing && !film.paused);
    blocked = false;
    if (completed) {
      completed = false;
      film.currentTime = 0;
    }
    if (userChoice && film.error) film.load();
    sync();
  });
  film.addEventListener('playing', () => {
    if (film.paused || film.ended) return;
    if (!shouldPlay()) return sync();
    playing = true;
    updateButton();
  });
  film.addEventListener('pause', () => {
    if (!film.paused) return;
    playing = false;
    updateButton();
  });
  film.addEventListener('ended', () => {
    if (!film.ended) return;
    completed = true;
    sync();
  });
  film.addEventListener('error', () => {
    blocked = true;
    sync();
  });
  reduced.addEventListener('change', () => {
    // A newly enabled system preference takes effect even after a manual play.
    if (reduced.matches && userChoice === true) userChoice = null;
    sync();
  });
  document.addEventListener('visibilitychange', sync);
  film.muted = true;
  film.controls = false;
  button.hidden = false;
  updateButton();

  if (canObserve) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    }).observe(film);
  } else {
    function checkView() {
      const rect = film.getBoundingClientRect();
      inView = rect.bottom > 0 && rect.top < window.innerHeight &&
        rect.right > 0 && rect.left < window.innerWidth;
      sync();
    }
    window.addEventListener('resize', checkView, { passive: true });
    window.addEventListener('scroll', checkView, { passive: true });
    checkView();
  }
})();
