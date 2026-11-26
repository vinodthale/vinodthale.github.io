(() => {
  'use strict';

  const canvas = document.getElementById('vortex');
  const film = document.getElementById('impact-film');
  const field = canvas?.parentElement;
  const ink = canvas?.getContext('2d');
  if (!ink || !field || !film) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const tau = Math.PI * 2;
  const palette = {
    light: ['#376783', '#a3694e'],
    dark: ['#93c9e4', '#e6ad8f']
  };
  let width = 0, height = 0, density = 1;
  let clock = 0, last = null, request = 0;
  let playing = !film.paused && !film.ended && film.readyState >= 3;
  let visible = true;

  // An ornamental spiral narrows towards its core. The neighbouring strands
  // have different lengths and turns, like ink drawn into the same eddy.
  function point(t, strand, phase, spin) {
    const radius = (1 + strand * 0.19) * Math.pow(1 - t * 0.94, 1.3);
    const turn = -Math.PI / 2 + 0.12 * strand +
      (1.38 + 0.18 * strand) * tau * t + 0.38 * t * Math.sin(phase - 3 * t);
    return [1.1 * radius * Math.cos(turn), spin * 0.79 * radius * Math.sin(turn)];
  }

  function roll(cx, cy, size, color, spin, phase) {
    ink.save();
    ink.translate(cx, cy);
    ink.scale(size, size);
    ink.strokeStyle = color;
    ink.lineCap = 'round';
    ink.lineJoin = 'round';
    for (let line = 0; line < 11; line++) {
      const strand = (line - 5) / 5;
      const end = 0.94 + 0.045 * Math.cos(line * 1.3);
      const [startX, startY] = point(0, strand, phase, spin);
      const tailX = -1.63 - 0.52 * Math.cos(line * 0.7);
      const tailY = startY * 0.51 + 0.075 * strand +
        0.06 * Math.sin(phase + strand);

      ink.beginPath();
      ink.moveTo(tailX, tailY);
      ink.bezierCurveTo(tailX + 0.5, tailY - spin * 0.04,
        startX - 0.47, startY - spin * 0.10, startX, startY);
      for (let step = 1; step <= 80; step++) {
        ink.lineTo(...point(end * step / 80, strand, phase, spin));
      }
      ink.globalAlpha = 0.20 + 0.25 * (1 - Math.abs(strand));
      ink.lineWidth = (line % 3 === 0 ? 1.18 : 0.74) / size;
      ink.stroke();

      if (line === 2 || line === 5 || line === 8) {
        const lead = (phase * 0.13 + line * 0.19) % 1;
        // A short highlight winds inward, fading at both ends of its trip.
        ink.globalAlpha = 0.59 * Math.sin(Math.PI * lead);
        ink.lineWidth = 1.55 / size;
        ink.beginPath();
        for (let step = 0; step <= 12; step++) {
          const position = 0.02 + lead * 0.76 + step * 0.008;
          const [x, y] = point(position, strand, phase, spin);
          if (step === 0) ink.moveTo(x, y);
          else ink.lineTo(x, y);
        }
        ink.stroke();
      }
    }
    ink.restore();
  }

  function draw() {
    if (!width || !height) return;
    ink.setTransform(density, 0, 0, density, 0, 0);
    ink.clearRect(0, 0, width, height);
    const colors = document.documentElement.dataset.theme === 'dark' ? palette.dark : palette.light;
    const size = Math.min(width * 0.15, height * 0.43);
    const sway = Math.sin(clock * 0.37);
    roll(width * 0.34 + size * 0.12 * sway, height * 0.42 + size * 0.06 * Math.cos(clock * 0.49),
      size, colors[0], 1, 0.8 + clock * 0.66);
    roll(width * 0.70 + size * 0.10 * Math.sin(clock * 0.34 + 0.8),
      height * 0.46 + size * 0.07 * sway, size * 0.83, colors[1], -1, 2.3 + clock * 0.54);
  }

  function animate(now) {
    request = 0;
    if (!visible || document.hidden || reduced.matches || !playing) return;
    if (last === null || now - last >= 32) {
      if (last !== null) clock += Math.min(90, now - last) / 1000;
      last = now;
      draw();
    }
    request = requestAnimationFrame(animate);
  }

  function update() {
    cancelAnimationFrame(request);
    request = 0;
    last = null;
    if (!visible || document.hidden) return;
    const rect = field.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(rect.width), h = Math.round(rect.height);
    if (!w || !h) return;
    if (w !== width || h !== height || dpr !== density) {
      width = w;
      height = h;
      density = dpr;
      canvas.width = Math.round(width * density);
      canvas.height = Math.round(height * density);
    }
    draw();
    if (playing && !reduced.matches) request = requestAnimationFrame(animate);
  }

  film.addEventListener('playing', () => { playing = true; update(); });
  for (const event of ['pause', 'waiting', 'ended', 'error', 'emptied']) {
    film.addEventListener(event, () => { playing = false; update(); });
  }
  reduced.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
  new MutationObserver(update).observe(document.documentElement, {
    attributes: true, attributeFilter: ['data-theme']
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    }).observe(field);
  }
  if ('ResizeObserver' in window) new ResizeObserver(update).observe(field);
  window.addEventListener('resize', update, { passive: true });
  update();
})();
