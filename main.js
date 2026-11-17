// intro sequence: enter -> reel -> card -> flicker -> ruler lines -> name -> hero
(() => {
  const S = window.SITE;
  const $ = (id) => document.getElementById(id);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const SVGNS = "http://www.w3.org/2000/svg";

  const intro = $("intro"), stage = $("stage"), reel = $("reel"), sub = $("sub");
  const nameEl = $("name"), guidesEl = $("guides");
  let done = false;

  // ---- name, one span per letter with an alt font for hover ----
  const ALTS = ["f-ital", "f-black", "f-script", "f-story", "f-bench", "f-pixel"];

  // size the name so it spans the screen with an even margin either side
  async function fitName() {
    await document.fonts.ready;
    const chs = nameEl.querySelectorAll(".ch");
    if (!chs.length) return;
    nameEl.style.fontSize = "";
    const w = chs[chs.length - 1].getBoundingClientRect().right - chs[0].getBoundingClientRect().left;
    const fs = parseFloat(getComputedStyle(nameEl).fontSize);
    nameEl.style.fontSize = (fs * (innerWidth * 0.84)) / w + "px";
  }
  addEventListener("resize", () => fitName());

  // the name is written, not shown: for each letter a pen line traces the
  // outline, then ink follows it across from left to right and the pen line
  // lifts. letters start 0.13s apart, so the hand moves along the name.
  // (svg text laid over the real name, swapped for the real one at the end.)
  async function inkName() {
    await fitName();
    const cs = getComputedStyle(nameEl), fs = parseFloat(cs.fontSize);
    const base = nameEl.querySelector(".probe").getBoundingClientRect().top;
    const svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("class", "ink");
    svg.style.setProperty("--len", fs * 5);
    const font = `font-family:${cs.fontFamily};font-size:${fs}px;font-weight:${cs.fontWeight}`;
    const mk = (tag, attrs, parent) => {
      const n = document.createElementNS(SVGNS, tag);
      for (const k in attrs) n.setAttribute(k, attrs[k]);
      parent.appendChild(n);
      return n;
    };
    const chs = [...nameEl.querySelectorAll(".ch")];
    chs.forEach((c, i) => {
      const r = c.getBoundingClientRect(), ch = c.querySelector(".b").textContent;
      const g = mk("g", { style: `--n:${(i * 0.13).toFixed(2)}s` }, svg);
      const clip = mk("clipPath", { id: "ink" + i }, g);
      mk("rect", { x: r.left - fs * 0.08, y: base - fs, width: r.width + fs * 0.16, height: fs * 1.45 }, clip);
      const fill = mk("text", { x: r.left, y: base, class: "f", style: font, "clip-path": `url(#ink${i})` }, g);
      const pen = mk("text", { x: r.left, y: base, class: "o", style: font }, g);
      fill.textContent = pen.textContent = ch;
    });
    document.body.appendChild(svg);
    await wait((chs.length - 1) * 130 + 1550);
    nameEl.classList.add("instant", "set");
    svg.remove();
  }

  function buildName() {
    const txt = "Nithin Aruswamy";
    let i = 0, last = -1;
    for (const c of txt) {
      if (c === " ") {
        const sp = document.createElement("span");
        sp.className = "sp";
        nameEl.appendChild(sp);
        continue;
      }
      // pick an alt font, no two neighbours the same
      let k;
      do { k = Math.floor(Math.random() * ALTS.length); } while (k === last);
      last = k;
      const ch = document.createElement("span");
      ch.className = "ch";
      ch.style.setProperty("--i", i++);
      ch.setAttribute("aria-hidden", "true");
      ch.innerHTML = `<span class="b">${c}</span><span class="a ${ALTS[k]}">${c}</span>`;
      nameEl.appendChild(ch);
    }
    // zero-size probe so I can find the baseline later
    const p = document.createElement("span");
    p.className = "probe";
    nameEl.appendChild(p);
  }

  // ---- email ----
  $("email").textContent = S.email;
  $("copy").onclick = async () => {
    try { await navigator.clipboard.writeText(S.email); } catch (e) {}
    $("copy").textContent = "Copied";
    setTimeout(() => ($("copy").textContent = "Copy"), 1400);
  };

  // ---- subtitles ----
  let shown = null;
  function showCue(text) {
    if (text === shown) return;
    shown = text;
    sub.classList.remove("on");
    if (!text) return;
    sub.textContent = text;
    requestAnimationFrame(() => sub.classList.add("on"));
  }
  const cueAt = (t) => (S.cues.find((c) => t >= c.start && t < c.end) || {}).text || null;

  // ---- 1. the reel ----
  function videoExists() {
    return new Promise((res) => {
      reel.src = S.video;
      const ok = () => { clean(); res(true); };
      const bad = () => { clean(); res(false); };
      const clean = () => { reel.removeEventListener("canplay", ok); reel.removeEventListener("error", bad); };
      reel.addEventListener("canplay", ok);
      reel.addEventListener("error", bad);
      setTimeout(bad, 2500);
    });
  }

  async function playReel() {
    if (await videoExists()) {
      reel.classList.add("on");
      reel.ontimeupdate = () => showCue(cueAt(reel.currentTime));
      await new Promise((res) => {
        reel.onended = res;
        reel.play().catch(res);
      });
      return;
    }
    // no video yet: an 8s stand-in that hits the same beats
    const ph = $("placeholder");
    ph.classList.add("on");
    const n = document.createElement("div"); n.className = "n";
    const t = document.createElement("div"); t.className = "t"; t.textContent = "drop assets/intro.mp4";
    ph.append(n, t);
    const start = performance.now();
    const scale = 8 / 20; // map the real 20s cue times onto 8s
    while (!done) {
      const s = (performance.now() - start) / 1000;
      if (s > 8) break;
      const beat = Math.floor(s / 0.5);
      n.textContent = "clip " + String(Math.min(beat + 1, 16)).padStart(2, "0");
      ph.classList.toggle("hit", s < 4.6 && beat % 4 === 3);
      showCue(cueAt(s / scale));
      await wait(50);
    }
    ph.classList.remove("hit");
  }

  // ---- 2. shrink to a card ----
  async function toCard() {
    sub.classList.add("rise");
    intro.classList.add("paper");
    stage.classList.add("card");
    await wait(1100);
  }

  // ---- 3. flicker inside the card ----
  function fakeFrames(count) {
    // stand-in frames: hard black/paper compositions
    const out = [];
    for (let i = 0; i < count; i++) {
      const d = document.createElement("div");
      const r = (a, b) => a + Math.random() * (b - a);
      const ink = "#111", paper = "#fff";
      const flip = i % 2 === 0;
      const bg = flip ? ink : paper, fg = flip ? paper : ink;
      const kind = i % 4;
      if (kind === 0) d.style.background = `radial-gradient(circle at ${r(20, 80)}% ${r(20, 80)}%, ${fg} ${r(10, 25)}%, ${bg} ${r(26, 40)}%)`;
      if (kind === 1) d.style.background = `repeating-linear-gradient(${r(0, 180)}deg, ${fg} 0 ${r(2, 6)}px, ${bg} 0 ${r(10, 24)}px)`;
      if (kind === 2) d.style.background = `linear-gradient(${bg} ${r(30, 60)}%, ${fg} 0)`;
      if (kind === 3) d.style.background = `conic-gradient(from ${r(0, 360)}deg, ${fg} 0 25%, ${bg} 0 50%, ${fg} 0 75%, ${bg} 0)`;
      out.push(d);
    }
    return out;
  }

  async function flicker() {
    const box = $("flicker");
    let frames;
    if (S.flicker.length) {
      frames = S.flicker.map((src) => { const im = new Image(); im.src = src; im.alt = ""; return im; });
      await Promise.all(frames.map((im) => im.decode().catch(() => {})));
      const ok = frames.filter((im) => im.naturalWidth > 0); // never flash a photo that failed to load
      frames = ok.length ? ok : fakeFrames(16);
    } else {
      frames = fakeFrames(16);
    }
    reel.classList.remove("on");
    $("placeholder").classList.remove("on");
    box.classList.add("on");
    const counter = $("count");
    const r = stage.getBoundingClientRect();
    Object.assign(counter.style, { left: r.left + "px", top: r.top - 20 + "px" });
    counter.classList.add("on");

    // construction lines behind the card: one new shape starts as each photo
    // lands and takes 1.4s to draw, so they overlap and build up in order
    const shapes = construction(r);
    const n = Math.max(frames.length, 8);        // a short set loops
    const pad = (v) => String(v).padStart(2, "0");
    // starts slow, runs fast through the middle, slows again for the end
    const beat = (i) => 110 + 470 * Math.pow((Math.cos((2 * Math.PI * i) / (n - 1)) + 1) / 2, 1.4);
    for (let i = 0; i < n && !done; i++) {
      const k = i % frames.length;
      box.replaceChildren(frames[k]);
      counter.textContent = `${pad(k + 1)} / ${pad(frames.length)}`;
      const from = Math.floor((i * shapes.length) / n), to = Math.floor(((i + 1) * shapes.length) / n);
      shapes.slice(from, to).forEach((el, j) => setTimeout(() => (el.style.strokeDashoffset = 0), j * 70));
      await wait(beat(i));
    }
    if (done) return;
    await wait(1300);                             // rest on the last photo

    // hand off: lines pull back in order, the photo and its text ease away
    shapes.forEach((el, j) => setTimeout(() => { el.style.transitionDuration = ".8s"; el.style.strokeDashoffset = 1; }, j * 35));
    counter.classList.remove("on");
    sub.classList.remove("on");
    stage.classList.add("out");
    await wait(1300);
    box.replaceChildren();
    $("fgrid").replaceChildren();
  }

  // a golden-ratio construction laid over the screen and keyed to the card:
  // rectangles first, then circles, then rules, then diagonals
  function construction(c) {
    const svg = $("fgrid"), W = innerWidth, H = innerHeight, PHI = 0.618;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const out = [];
    const add = (tag, attrs) => {
      const el = document.createElementNS(SVGNS, tag);
      for (const k in attrs) el.setAttribute(k, attrs[k]);
      el.setAttribute("pathLength", 1);
      svg.appendChild(el);
      out.push(el);
    };
    const rect = (x, y, w, h) => add("path", { d: `M${x} ${y}H${x + w}V${y + h}H${x}Z` });
    const line = (x1, y1, x2, y2) => add("path", { d: `M${x1} ${y1}L${x2} ${y2}` });
    const circ = (cx, cy, rad) => add("circle", { cx, cy, r: rad });
    const gx = Math.round(W * PHI), gy = Math.round(H * PHI);  // golden cuts of the screen
    const cx = c.left + c.width / 2, cy = c.top + c.height / 2;

    rect(0.5, 0.5, gx, H - 1);                     // the big square-ish field
    rect(gx + 0.5, 0.5, W - gx - 1, gy);           // upper right
    rect(gx + 0.5, gy + 0.5, (W - gx) * PHI, H - gy - 1);
    circ(cx, cy, H / 2 - 1);                       // the card's own circle
    circ(gx + (W - gx) / 2, gy / 2, Math.min(W - gx, gy) / 2);
    circ(gx + ((W - gx) * PHI) / 2, gy + (H - gy) / 2, Math.min((W - gx) * PHI, H - gy) / 2);
    line(c.left + 0.5, 0, c.left + 0.5, H);        // rules on the card's edges
    line(c.right - 0.5, 0, c.right - 0.5, H);
    line(0, c.top + 0.5, W, c.top + 0.5);
    line(0, c.bottom - 0.5, W, c.bottom - 0.5);
    const slope = c.height / c.width, far = Math.max(W, H) * 2;  // diagonals through its corners
    line(cx - far, cy - far * slope, cx + far, cy + far * slope);
    line(cx - far, cy + far * slope, cx + far, cy - far * slope);
    line(gx, H, gx + (W - gx), 0);
    return out;
  }

  // ---- 4. ruler lines, then the type sets onto them ----
  async function rule() {
    intro.classList.add("clear");
    await fitName();
    const fs = parseFloat(getComputedStyle(nameEl).fontSize);
    const base = nameEl.querySelector(".probe").getBoundingClientRect().top;
    const chs = [...nameEl.querySelectorAll(".ch")];
    const first = chs[0].getBoundingClientRect(), lastR = chs[chs.length - 1].getBoundingClientRect();
    const W = innerWidth;

    const rows = [
      ["ascender", base - fs * 0.74],
      ["cap height", base - fs * 0.66],
      ["x-height", base - fs * 0.46],
      ["baseline", base],
      ["descender", base + fs * 0.22],
    ];
    const lines = [];
    const add = (x1, y1, x2, y2) => {
      const l = document.createElementNS(SVGNS, "line");
      Object.entries({ x1, y1, x2, y2 }).forEach(([k, v]) => l.setAttribute(k, v));
      const len = Math.hypot(x2 - x1, y2 - y1);
      l.style.strokeDasharray = len;
      l.style.strokeDashoffset = len;
      guidesEl.appendChild(l);
      lines.push(l);
      return l;
    };

    rows.forEach(([label, y]) => {
      add(0, y, W, y);
      const t = document.createElementNS(SVGNS, "text");
      t.setAttribute("x", W - 12); t.setAttribute("y", y - 5); t.setAttribute("text-anchor", "end");
      t.textContent = label.toUpperCase();
      guidesEl.appendChild(t);
    });
    // a vertical at every letter's left edge, plus the ends
    chs.forEach((c) => { const x = c.getBoundingClientRect().left; add(x, 0, x, innerHeight); });
    add(lastR.right, 0, lastR.right, innerHeight);
    // ruler ticks under the baseline
    for (let x = first.left, i = 0; x < lastR.right; x += 8, i++) {
      add(x, base + 4, x, base + 4 + (i % 10 === 0 ? 14 : i % 5 === 0 ? 9 : 5));
    }

    // draw them in, staggered
    await wait(30);
    lines.forEach((l, i) => setTimeout(() => (l.style.strokeDashoffset = 0), Math.min(i * 18, 900)));
    guidesEl.classList.add("drawn");
    await wait(1500);

    // ink the type onto the lines
    await inkName();
    await wait(700);                              // let the finished name sit a moment
    guidesEl.classList.add("out");
    await wait(500);
  }

  // ---- 5. land on the page ----
  // the big name is a title card for the intro only: it lifts away as the page arrives
  function finish(instant) {
    if (done && instant) return;
    done = true;
    try { localStorage.setItem("pg-seen", "1"); } catch (e) {}
    reel.pause();
    intro.classList.add("gone");
    document.body.classList.remove("intro-on");
    document.body.classList.add("live");
    window.Fountain && window.Fountain.start($("fountain"));
    if (instant) { nameEl.classList.add("off"); return; }
    nameEl.classList.add("gone");
    setTimeout(() => nameEl.classList.add("off"), 1200);
  }

  async function run() {
    $("enter").classList.add("out");
    await playReel(); if (done) return;
    await toCard(); if (done) return;
    await flicker(); if (done) return;
    await rule(); if (done) return;
    finish(false);
  }

  // ---- go ----
  buildName();
  fitName();
  let seen = null;
  try { seen = localStorage.getItem("pg-seen"); } catch (e) {}
  const force = new URLSearchParams(location.search).has("intro");
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  $("skip").onclick = () => finish(true);
  if (calm || (seen && !force)) finish(true);
  else $("enter").onclick = run;
})();
