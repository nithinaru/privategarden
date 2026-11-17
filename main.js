// intro sequence: film -> card -> flicker -> ruler lines -> name -> hero
(() => {
  const S = window.SITE;
  const $ = (id) => document.getElementById(id);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const SVGNS = "http://www.w3.org/2000/svg";

  const intro = $("intro"), stage = $("stage"), reel = $("reel");
  const nameEl = $("name"), guidesEl = $("guides");
  let done = false;

  // ---- name, one span per letter with an alt font for hover ----
  const ALTS = ["f-ital", "f-black", "f-script", "f-story", "f-bench", "f-pixel"];

  const glyph = (c) => c.getBoundingClientRect();   // where a letter sits

  // size the name so it spans the screen with an even margin either side
  async function fitName() {
    try { await document.fonts.load('480 100px "Source Serif 4"', "Private Garden"); } catch (e) {}
    await document.fonts.ready;
    const chs = nameEl.querySelectorAll(".ch");
    if (!chs.length) return;
    nameEl.style.fontSize = "";
    const rows = {};                                  // on a phone the two words sit on two lines
    chs.forEach((c) => { const r = glyph(c), k = Math.round(r.top), l = (rows[k] = rows[k] || [r.left, r.right]); l[0] = Math.min(l[0], r.left); l[1] = Math.max(l[1], r.right); });
    const w = Math.max(...Object.values(rows).map((l) => l[1] - l[0]));
    const fs = parseFloat(getComputedStyle(nameEl).fontSize);
    const size = (fs * (innerWidth * 0.94)) / w;
    nameEl.style.fontSize = size + "px";
    $("site").style.setProperty("--title", size + "px");   // the layout below makes room for it
    // how far a letter's box hangs below its baseline: the hover area stops short of that
    // (layout offsets, not screen boxes: the letters may be mid-rise when this runs)
    const pr = nameEl.querySelector(".probe");
    if (pr) nameEl.style.setProperty("--drop", Math.max(0, chs[0].offsetTop + chs[0].offsetHeight - pr.offsetTop - size * 0.02) + "px");
    placeSides();
  }
  addEventListener("resize", () => fitName());

  // the quote and the three lines mirror each other across the fountain: the quote is
  // centred as far above the middle bowl's rim as the lines are centred below it, and
  // each sits the same distance in from its edge of the page. (viewBox numbers below
  // must match the svg: the middle rim is at y=150, and the blocks sit 48 either side.)
  function placeSides() {
    const q = document.querySelector(".quote"), b = document.querySelector(".bio");
    if (innerWidth <= 1080) {
      q.style.top = b.style.top = "";
      // a phone: each of the three lines stays on one line, so the type is brought down
      // until the longest fits
      const p = $("bio");
      p.style.fontSize = "";
      if (innerWidth <= 700) {
        const widest = Math.max(...[...p.children].map((l) => l.offsetWidth)), room = p.clientWidth;
        if (widest > room) p.style.fontSize = Math.floor(parseFloat(getComputedStyle(p).fontSize) * (room / widest) * 0.985 * 100) / 100 + "px";
      }
      return;
    }
    $("bio").style.fontSize = "";
    const site = $("site").getBoundingClientRect(), g = document.querySelector(".garden").getBoundingClientRect();
    const [vx, vy, vw, vh] = $("fountain").getAttribute("viewBox").split(" ").map(Number);
    const sc = Math.min(g.width / vw, g.height / vh);
    const y = (u) => g.top - site.top + (g.height - vh * sc) + (u - vy) * sc;   // drawing units to page px
    q.style.top = y(150 - 48) - q.offsetHeight / 2 + "px";
    b.style.top = y(150 + 48) - b.offsetHeight / 2 + "px";
  }
  addEventListener("resize", placeSides);
  document.fonts.addEventListener("loadingdone", placeSides);   // the bio face arrives late

  // footer: split the two words into letters so they can rise one by one, size the
  // line to span the page, and start the rise when it scrolls into view
  const endLine = $("end-line"), endBig = $("end-big");
  let li = 0;
  endLine.querySelectorAll(".w").forEach((w) => {
    w.innerHTML = [...w.textContent].map((c) => `<i style="--i:${li++}">${c}</i>`).join("");
  });
  endLine.querySelector(".end-icon").style.setProperty("--i", 6);
  async function fitEnd() {
    await document.fonts.ready;
    endBig.style.fontSize = "";
    const fs = parseFloat(getComputedStyle(endBig).fontSize);
    endBig.style.fontSize = (fs * innerWidth * 0.94) / endLine.getBoundingClientRect().width + "px";
  }
  fitEnd();
  addEventListener("resize", fitEnd);
  new IntersectionObserver(([e]) => { if (e.isIntersecting) endBig.classList.add("in"); }, { threshold: 0.35 }).observe(endBig);

  // the name is stencilled first: a pen line draws the outline of each letter, one
  // after the next. then the black ink is written into the outlines, and the pen
  // lines fade. (the outlines are svg text laid exactly over the real letters.)
  async function inkName() {
    await fitName();
    const cs = getComputedStyle(nameEl), fs = parseFloat(cs.fontSize);
    const tops = [...nameEl.querySelectorAll(".probe")].map((p) => p.getBoundingClientRect().top);
    const baseOf = (r) => tops.reduce((a, b) => (Math.abs(b - (r.top + r.height * 0.75)) < Math.abs(a - (r.top + r.height * 0.75)) ? b : a));
    const svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("class", "ink");
    // the dash is one long stroke, longer than any letter's whole outline (safari counts
    // the inner shapes of a, e and G in with the outer one, and left gaps with a short one)
    svg.style.setProperty("--len", fs * 12);
    const chs = [...nameEl.querySelectorAll(".ch")];
    chs.forEach((c, i) => {
      const r = glyph(c);
      const t = document.createElementNS(SVGNS, "text");
      t.setAttribute("x", r.left); t.setAttribute("y", baseOf(r));
      t.style.cssText = `--n:${(i * 0.08).toFixed(2)}s;font-family:${cs.fontFamily};font-size:${fs}px;font-weight:${cs.fontWeight};font-variation-settings:${cs.fontVariationSettings};font-optical-sizing:${cs.fontOpticalSizing};letter-spacing:0`;
      t.textContent = c.querySelector(".b").textContent;
      svg.appendChild(t);
    });
    document.body.appendChild(svg);
    await wait((chs.length - 1) * 80 + 1300);       // the stencil is drawn
    nameEl.classList.add("set");                    // the ink is written into it, 110ms apart
    await wait((chs.length - 1) * 110 + 850);
    svg.classList.add("out");
    await wait(500);
    nameEl.classList.add("instant");
    svg.remove();
  }

  function buildName() {
    const txt = S.title || "Private Garden";
    let i = 0, last = -1;
    for (const c of txt) {
      if (c === " ") {
        const pr = document.createElement("span"); pr.className = "probe"; nameEl.appendChild(pr);
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
      ch.innerHTML = `<span class="b">${c}</span><span class="a ${ALTS[k]}">${c}</span><span class="hit"></span>`;
      nameEl.appendChild(ch);
    }
    // zero-size probe so I can find the baseline later
    const p = document.createElement("span");
    p.className = "probe";
    nameEl.appendChild(p);
  }

  // ---- quote, x link, caption ----
  $("quote").textContent = "\u201C" + S.quote.text + "\u201D";
  $("quote-by").textContent = S.quote.by || "";
  $("x").href = "https://x.com/" + S.x;
  $("x-handle").textContent = "@" + S.x;
  $("cap").innerHTML = (S.caption || []).map((l) => `<span>${l}</span>`).join("");
  $("bio").innerHTML = (S.bio || []).map((l) => `<span>${l
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a class="hl-me" href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, '<b class="hl-me">$1</b>')}</span>`).join("");
  $("about").href = S.about;
  $("by").href = S.by || S.about;

  // the colour sweep (About and the bold names): the label is doubled, and the copy
  // on top carries a band of colour that crosses it from left to right on hover
  document.querySelectorAll(".hl-me").forEach((el) => {
    const text = el.textContent;
    el.classList.add("hl");
    el.innerHTML = `<span>${text}</span><span class="hl-grad" aria-hidden="true">${text}</span>`;
  });

  // ---- audio on / audio off ----
  // the film opens with its sound on. a tag rides beside the cursor and says which way
  // the sound is set; a click anywhere on the film switches it. the tag is only there
  // while the cursor is moving, and goes when it rests or leaves. (a browser that will
  // not start sound unasked starts the film silent, and the tag asks for a click.)
  // a touch screen has no cursor: there the tag rests at the foot of the screen, asks
  // for a tap while the film is silent, and shows for a moment after each tap.
  const tag = $("tag"), tagText = tag.querySelector("span"), REST = 1800;
  const touch = matchMedia("(hover: none)").matches;
  if (touch) tag.classList.add("rest");
  let sound = true, filming = false, idleT = 0, asked = false;   // asked = silent only because the browser refused
  function setSound(on) {
    sound = on;
    reel.muted = !on;
    if (on) reel.volume = 1;
    tagText.textContent = on ? "Audio on" : asked ? (touch ? "Tap for audio" : "Click for audio") : "Audio off";
    tag.classList.toggle("off", !on);
  }
  function showTag(x, y) {
    if (!filming) return;
    if (!touch) {
      // near the skip button it gets out of the way
      const k = $("skip").getBoundingClientRect();
      if (x > k.left - 150 && y > k.top - 90) return hideTag();
      const tx = Math.max(8, Math.min(x + 16, innerWidth - tag.offsetWidth - 8)), ty = Math.max(8, Math.min(y + 20, innerHeight - tag.offsetHeight - 8));
      tag.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    }
    tag.classList.add("on");
    clearTimeout(idleT);
    idleT = setTimeout(() => tag.classList.remove("on"), REST);
  }
  const hideTag = () => { clearTimeout(idleT); tag.classList.remove("on"); };
  const tagOff = () => { filming = false; hideTag(); };
  function toggleSound() {
    if (!filming) return;
    asked = false;
    setSound(!sound);
    if (reel.paused && !reel.ended) reel.play().catch(() => {});
  }
  addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") showTag(e.clientX, e.clientY); });
  document.documentElement.addEventListener("pointerleave", hideTag);
  addEventListener("blur", hideTag);
  intro.addEventListener("click", (e) => {
    if (!filming || e.target.closest(".skip")) return;
    toggleSound();
    showTag(e.clientX, e.clientY);          // on a touch screen it shows for a moment where the finger was
  });
  addEventListener("keydown", (e) => { if (e.key === "m" || e.key === "M") toggleSound(); });
  // a browser may pause the film while the tab is in the background
  document.addEventListener("visibilitychange", () => { if (!document.hidden && !done && filming && reel.paused && !reel.ended) reel.play().catch(() => {}); });
  intro.addEventListener("contextmenu", (e) => e.preventDefault());

  // ---- 1. the film ----
  // start the film and say how it went: "ok" = playing, "missing" = no such file,
  // "slow" = still not playing after 10s, "blocked" = the browser will not start it unasked.
  // (it is started straight away, not when it has loaded: a phone loads nothing until
  // a film is told to play.)
  function startFilm() {
    return new Promise((res) => {
      let over = false;
      const end = (v) => { if (over) return; over = true; clearTimeout(t); res(v); };
      const t = setTimeout(() => end("slow"), 10000);
      reel.addEventListener("error", () => end("missing"), { once: true });
      reel.addEventListener("playing", () => end("ok"), { once: true });
      reel.setAttribute("webkit-playsinline", "");
      reel.src = innerWidth < 800 && S.videoSmall ? S.videoSmall : S.video;
      const gone = (e) => reel.error || (e && e.name === "NotSupportedError");
      // with sound if the browser allows it, silent if not
      setSound(true);
      reel.play()
        .catch((e) => { if (gone(e)) throw e; asked = true; setSound(false); reel.setAttribute("muted", ""); return reel.play(); })
        .catch((e) => end(gone(e) ? "missing" : "blocked"));
    });
  }
  // a phone saving power starts no film at all: ask for a tap, and wait a little for one
  function askToPlay() {
    return new Promise((res) => {
      tagText.textContent = touch ? "Tap to play" : "Click to play";
      tag.classList.add("off");
      if (touch) tag.classList.add("on");
      filming = true;                               // lets the tag follow a cursor
      const t = setTimeout(() => { intro.removeEventListener("click", go, true); tagOff(); res(false); }, 7000);
      function go(e) {
        if (e.target.closest(".skip")) return;
        if (phase !== "film") { clearTimeout(t); intro.removeEventListener("click", go, true); return res(false); }
        e.stopPropagation();
        clearTimeout(t); intro.removeEventListener("click", go, true);
        asked = false; setSound(true);
        reel.play().then(() => res(true), () => { tagOff(); res(false); });
      }
      intro.addEventListener("click", go, true);
    });
  }

  // skip leaves the film and carries on from the photos. the button is only there
  // while the film is.
  let phase = "", leaveFilm = () => {};
  const leftFilm = new Promise((res) => (leaveFilm = res));
  function skip() {
    if (phase !== "film") return;
    phase = "rest";
    $("skip").hidden = true;
    reel.muted = true; reel.pause();
    tagOff();
    leaveFilm();
  }

  async function playReel() {
    phase = "film";
    reel.classList.add("on");
    let state = await startFilm();
    if (done || phase !== "film") return;
    if (state === "blocked") state = (await askToPlay()) ? "ok" : "slow";
    if (state === "ok") {
      filming = true;
      if (touch && asked) tag.classList.add("on");
      reel.addEventListener("ended", tagOff);
      // the picture ends at S.cut; the page moves on there while the sound plays out
      const cut = S.cut || Infinity;
      await new Promise((res) => {
        // if the film stops arriving part way through, give it 6s and then move on
        let at = -1, since = performance.now(), prev = since;
        const watch = () => {
          if (done || phase !== "film" || reel.ended || reel.error || reel.currentTime >= cut) return res();
          const now = performance.now();
          if (reel.currentTime !== at || now - prev > 1000) { at = reel.currentTime; since = now; }
          prev = now;
          if (now - since > 6000) { reel.pause(); tagOff(); return res(); }
          requestAnimationFrame(watch);
        };
        watch();
      });
      return;
    }
    reel.classList.remove("on");
    if (state === "slow") reel.pause();           // too slow, missing or not allowed: straight to the photos
  }

  // ---- 2. shrink to a card ----
  async function toCard() {
    intro.classList.add("paper");
    stage.classList.add("card");
    await wait(1100);
  }

  // ---- 3. flicker inside the card ----
  // the photos start loading with the film, so they are ready when it ends
  let shots = null;
  const loadShots = () => (shots = shots || (S.flicker || []).map((src) => { const im = new Image(); im.src = src; im.alt = ""; return im; }));

  async function flicker() {
    const box = $("flicker");
    // wait for the photos, but not for ever: after 6s run with the ones that have arrived
    let frames = loadShots();
    await Promise.race([Promise.all(frames.map((im) => im.decode().catch(() => {}))), wait(6000)]);
    frames = frames.filter((im) => im.complete && im.naturalWidth > 0);   // never flash one that failed to load
    if (!frames.length) { stage.classList.add("out"); return; }
    reel.classList.remove("on");
    box.classList.add("on");
    const counter = $("count");
    const r = stage.getBoundingClientRect();
    Object.assign(counter.style, { left: r.left + "px", top: r.top - 20 + "px" });
    counter.classList.add("on");

    // the construction comes up quickly behind the card: every line starts within
    // the first second, 45ms apart, so they overlap as they draw
    const shapes = construction();
    shapes.forEach((el, j) => setTimeout(() => (el.style.strokeDashoffset = 0), j * 45));
    $("cap").classList.add("on");
    const n = Math.max(frames.length, 8);        // a short set loops
    const pad = (v) => String(v).padStart(2, "0");
    // starts slow, runs fast through the middle, slows again for the end
    const beat = (i) => 110 + 470 * Math.pow((Math.cos((2 * Math.PI * i) / (n - 1)) + 1) / 2, 1.4);
    for (let i = 0; i < n && !done; i++) {
      const k = i % frames.length;
      box.replaceChildren(frames[k]);
      counter.textContent = `${pad(k + 1)} / ${pad(frames.length)}`;
      await wait(beat(i));
    }
    if (done) return;
    await wait(1300);                             // rest on the last photo

    // hand off: lines pull back in order, the photo and its text ease away
    shapes.forEach((el, j) => setTimeout(() => { el.style.transitionDuration = ".8s"; el.style.strokeDashoffset = 1; }, j * 35));
    counter.classList.remove("on");
    $("cap").classList.remove("on");
    stage.classList.add("out");
    await wait(1300);
    box.replaceChildren();
    $("fgrid").replaceChildren();
  }

  // a golden-rectangle construction over the whole screen: the screen is cut at
  // the golden ratio again and again, each cell gets its circle, then rules and
  // diagonals run through. drawn in that order.
  function construction() {
    const svg = $("fgrid"), W = innerWidth, H = innerHeight;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const out = [];
    const add = (tag, attrs) => {
      const el = document.createElementNS(SVGNS, tag);
      for (const k in attrs) el.setAttribute(k, attrs[k]);
      el.setAttribute("pathLength", 1);
      svg.appendChild(el);
      out.push(el);
    };
    const px = (v) => Math.round(v) + 0.5;
    const rect = (x0, y0, x1, y1) => add("path", { d: `M${px(x0)} ${px(y0)}H${px(x1)}V${px(y1)}H${px(x0)}Z` });
    const line = (x1, y1, x2, y2) => add("path", { d: `M${x1} ${y1}L${x2} ${y2}` });
    const circ = (x0, y0, x1, y1) => add("circle", { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, r: Math.min(x1 - x0, y1 - y0) / 2 });
    const a = W * 0.617, b = W * 0.773, c = W * 0.695;   // vertical cuts
    const m = H * 0.625, n = H * 0.75;                    // horizontal cuts
    const cells = [[0, 0, a, H], [a, 0, W, m], [b, m, W, H], [a, n, b, H], [a, m, c, n], [c, m, b, n]];
    cells.forEach((r) => rect(...r));
    circ(W * 0.305 - H / 2, 0, W * 0.305 + H / 2, H);     // the big one, a full screen high
    cells.slice(1).forEach((r) => circ(...r));
    line(px(W * 0.227), 0, px(W * 0.227), H); line(px(b), 0, px(b), H);
    line(0, px(H * 0.25), W, px(H * 0.25)); line(0, px(n), W, px(n));
    line(0, 0, W, H); line(0, H, W * 0.383, 0); line(a, H, W, 0);
    return out;
  }

  // ---- 4. ruler lines, then the type sets onto them ----
  async function rule() {
    intro.classList.add("clear");
    await fitName();
    const fs = parseFloat(getComputedStyle(nameEl).fontSize);
    const chs = [...nameEl.querySelectorAll(".ch")];
    const first = glyph(chs[0]), lastR = glyph(chs[chs.length - 1]);
    const W = innerWidth;
    const bases = [...new Set([...nameEl.querySelectorAll(".probe")].map((p) => Math.round(p.getBoundingClientRect().top)))];
    const base = bases[bases.length - 1];

    // [label, y, draw the line, show the label]. on two lines the rows that would run
    // into the other line are left out, and so are the labels that would sit on a letter
    const two = bases.length > 1;
    const rows = bases.flatMap((b, li) => {
      const top = !two || li === 0, foot = !two || li === bases.length - 1;
      return [
        ["ascender", b - fs * 0.74, top, top],
        ["cap height", b - fs * 0.66, top, top],
        ["x-height", b - fs * 0.46, true, true],
        ["baseline", b, true, !two],
        ["descender", b + fs * 0.22, foot, foot],
      ].filter((r) => r[2]);
    });
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

    rows.forEach(([label, y, , show]) => {
      add(0, y, W, y);
      if (!show) return;
      const t = document.createElementNS(SVGNS, "text");
      t.setAttribute("x", W - 12); t.setAttribute("y", y - 5); t.setAttribute("text-anchor", "end");
      t.textContent = label.toUpperCase();
      guidesEl.appendChild(t);
    });
    // a vertical at every letter's left edge, plus the ends
    chs.forEach((c) => { const x = glyph(c).left; add(x, 0, x, innerHeight); });
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
    await wait(450);                              // let the finished title sit a moment
    guidesEl.classList.add("out");
    await wait(500);
  }

  // ---- 5. land on the page ----
  // the title was written in the middle of the screen; now it moves up to sit
  // half cut at the top while the page arrives under it
  function finish(instant) {
    if (done && instant) return;
    done = true;
    reel.pause();
    tagOff();
    intro.classList.add("gone");
    document.body.classList.remove("intro-on");
    document.body.classList.add("live");
    // after the intro the title moves up first, then the page and the fountain arrive
    if (instant) document.body.classList.add("snap");
    setTimeout(() => window.Fountain && window.Fountain.start($("fountain")), instant ? 0 : 1150);
    if (instant) nameEl.classList.add("still");     // no glide: it is simply there
    nameEl.classList.remove("card");
    if (instant) nameEl.classList.add("instant", "set");
  }

  async function run() {
    // a reload part way down the page must not leave the intro playing off screen
    try { history.scrollRestoration = "manual"; } catch (e) {}
    scrollTo(0, 0);
    loadShots();
    await Promise.race([playReel(), leftFilm]); if (done) return;
    phase = "rest";
    $("skip").hidden = true;
    await toCard(); if (done) return;
    await flicker(); if (done) return;
    await rule(); if (done) return;
    finish(false);
  }

  // ---- go ----
  buildName();
  fitName();
  // every load opens with the film, so "replay intro" is a reload from the top.
  // (an old ?intro link still works, and is tidied out of the address bar.)
  if (new URLSearchParams(location.search).has("intro")) {
    try { history.replaceState(null, "", location.pathname); } catch (e) {}
  }
  document.querySelector(".replay").addEventListener("click", (e) => {
    e.preventDefault();
    scrollTo(0, 0);
    location.reload();
  });
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

  $("skip").onclick = skip;
  if (calm) finish(true);
  else run();
})();
