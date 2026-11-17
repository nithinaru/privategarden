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
    nameEl.style.fontSize = (fs * (innerWidth * 0.94)) / w + "px";
  }
  addEventListener("resize", () => fitName());
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
    } else {
      frames = fakeFrames(16);
    }
    reel.classList.remove("on");
    $("placeholder").classList.remove("on");
    box.classList.add("on");
    const counter = $("count");
    counter.classList.add("on");
    // starts slow and quickens a little, but every photo stays readable.
    // a short set loops so there are always at least 8 beats.
    const count = Math.max(frames.length, 8);
    const pad = (n) => String(n).padStart(2, "0");
    for (let i = 0; i < count && !done; i++) {
      const k = i % frames.length;
      box.replaceChildren(frames[k]);
      counter.textContent = `${pad(k + 1)} / ${pad(frames.length)}`;
      await wait(420 - 220 * (i / Math.max(count - 1, 1)));
    }
    await wait(250);
    box.replaceChildren();
    counter.classList.remove("on");
    sub.classList.remove("on");
    stage.style.background = "var(--paper)";
    stage.classList.add("out");
    await wait(350);
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

    // set the type
    nameEl.classList.add("set");
    await wait(chs.length * 45 + 700);
    guidesEl.classList.add("out");
    await wait(500);
  }

  // ---- 5. land on the page ----
  function finish(instant) {
    if (done && instant) return;
    done = true;
    try { localStorage.setItem("pg-seen", "1"); } catch (e) {}
    reel.pause();
    if (instant) nameEl.classList.add("instant");
    nameEl.classList.add("set");
    intro.classList.add("gone");
    document.body.classList.remove("intro-on");
    document.body.classList.add("live");
    window.Fountain && window.Fountain.start($("fountain"));
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
  if ((seen && !force) || calm) finish(true);
  else $("enter").onclick = run;
})();
