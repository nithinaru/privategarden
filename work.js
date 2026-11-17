// the work section: a tall scroll track with a pinned stage.
//   0.00-0.26  cards pop in one by one between two phrases, fanned on a
//              diagonal, pushing the phrases apart
//   0.22-0.36  the phrases fade
//   0.30-0.52  the stack bursts into a scattered field, cards at full size
//   0.45-1.00  the field drifts up and away
// cards are skeleton loaders until an item in config.js has a `src`.
(() => {
  const S = window.SITE.work || {};
  const sec = document.getElementById("work");
  if (!sec) return;
  const space = sec.querySelector(".work-space");
  const [wordL, wordR] = sec.querySelectorAll(".work-word");
  wordL.textContent = (S.words || [])[0] || "Things made";
  wordR.textContent = (S.words || [])[1] || "with care";

  const items = S.items && S.items.length ? S.items : Array.from({ length: 28 }, () => ({}));
  const N = items.length, MID = (N - 1) / 2;

  // seeded random, so the layout is the same on every visit
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const RATIOS = [16 / 9, 16 / 9, 4 / 3, 3 / 2, 1, 3 / 4];

  const cards = items.map((it, i) => {
    const a = document.createElement(it.href ? "a" : "div");
    a.className = "work-card" + (it.src ? "" : " skel");
    if (it.href) { a.href = it.href; a.target = "_blank"; a.rel = "noopener"; }
    if (it.src) { const im = new Image(); im.src = it.src; im.alt = it.title || ""; im.loading = "lazy"; a.appendChild(im); }
    const cap = document.createElement("span");
    cap.className = "work-cap";
    if (it.title) cap.textContent = it.title; else if (!it.src) cap.innerHTML = "<i></i><i></i>";
    a.appendChild(cap);
    space.appendChild(a);
    const ratio = it.ratio || (it.src ? 16 / 9 : RATIOS[Math.floor(rnd() * RATIOS.length)]);
    return { el: a, ratio, size: 0.55 + rnd() * 0.45, fx: rnd(), fy: rnd(), jit: rnd(), d: Math.abs(i - MID) };
  });
  // nearest the middle shows first and sits on top
  const order = cards.map((c, i) => i).sort((a, b) => cards[a].d - cards[b].d);
  order.forEach((ci, n) => { cards[ci].rank = n; cards[ci].el.style.zIndex = 300 - n; });

  let W, H, unit, stackW;
  function layout() {
    W = innerWidth; H = innerHeight;
    unit = Math.min(Math.max(W * 0.14, 110), 190);   // widest card in the field
    stackW = Math.min(Math.max(W * 0.085, 70), 110); // every card in the stack
    const cols = W < 700 ? 3 : 6, rows = Math.ceil(N / cols);
    const cellW = (W * 0.84) / cols, cellH = Math.max(unit * 1.15, H * 0.34);
    cards.forEach((c, i) => {
      c.w = unit * c.size; c.h = c.w / c.ratio;
      c.el.style.width = c.w + "px"; c.el.style.height = c.h + "px";
      // stack: a diagonal fan through the centre
      c.sx = (i - MID) * (stackW * 0.075); c.sy = (i - MID) * (stackW * 0.085);
      c.ss = stackW / c.w;
      // field: a loose grid, jittered, starting above centre and running below the screen
      const col = i % cols, row = Math.floor(i / cols);
      c.tx = (col - (cols - 1) / 2) * cellW + (c.fx - 0.5) * cellW * 0.3;
      c.ty = -H * 0.3 + row * cellH + (c.fy - 0.5) * cellH * 0.3 + (col % 2) * cellH * 0.3;
    });
    // the field drifts up only until its last row rests near the bottom of the screen,
    // so the section ends with photos still showing and the footer follows straight on
    const lowest = Math.max(...cards.map((c) => c.ty + c.h / 2 + 34));
    drift = Math.max(0, lowest - (H / 2 - 56));
    // scroll length: a fixed stretch for the stack and the burst, then as long as the drift needs
    intro = H * 2.3;
    sec.style.height = intro + drift * 1.15 + H + "px";
    // the two phrases are different lengths, so the group is nudged sideways until
    // phrase + stack + phrase sits in the middle of the screen as one line
    const k = Math.min(1, W / 1100);
    nudge = ((wordL.offsetWidth - wordR.offsetWidth) / 2) * k;
  }
  let drift = 0, nudge = 0, intro = 1;

  const clamp = (v) => Math.min(1, Math.max(0, v));
  const span = (p, a, b) => clamp((p - a) / (b - a));
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const out = (t) => 1 - Math.pow(1 - t, 3);

  // s = pixels scrolled into the section
  function render(s) {
    const p = clamp(s / intro) * 0.52;            // the stack, fade and burst play over the first stretch
    const grown = out(span(p, 0, 0.26));
    const gap = 14 + grown * (stackW * 0.5 + N * stackW * 0.04 + 22);
    const wordA = 1 - span(p, 0.22, 0.36);
    const k = Math.min(1, W / 1100);
    wordL.style.transform = `translate(calc(-100% - ${gap - nudge}px), -50%) scale(${k})`;
    wordR.style.transform = `translate(${gap + nudge}px, -50%) scale(${k})`;
    wordL.style.opacity = wordR.style.opacity = wordA;
    const up = ease(clamp((s - intro * 0.86) / (intro * 0.14 + drift * 1.15))) * drift;

    for (const c of cards) {
      const born = 0.02 + (c.rank / N) * 0.24;
      const pop = out(span(p, born, born + 0.035));
      const fly = ease(span(p, 0.3 + c.jit * 0.06, 0.46 + c.jit * 0.06));
      const x = c.sx + nudge * (1 - fly) + (c.tx - c.sx) * fly, y = c.sy + (c.ty - c.sy) * fly - up * fly;
      const s = (c.ss * (0.55 + 0.45 * pop)) * (1 - fly) + fly;
      c.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
      c.el.style.opacity = pop;
      c.el.classList.toggle("open", fly > 0.9);
    }
  }

  // follow the scroll with a little lag, so it glides
  let target = 0, shown = -1, raf = 0;
  function measure() {
    const r = sec.getBoundingClientRect();
    target = Math.min(Math.max(-r.top, 0), r.height - innerHeight);
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function tick() {
    raf = 0;
    const next = shown < 0 ? target : shown + (target - shown) * 0.14;
    shown = Math.abs(next - target) < 0.4 ? target : next;
    render(shown);
    if (shown !== target) raf = requestAnimationFrame(tick);
  }

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { sec.classList.add("still"); return; }
  layout();
  measure();
  addEventListener("scroll", measure, { passive: true });
  addEventListener("resize", () => { layout(); shown = -1; measure(); });
})();
