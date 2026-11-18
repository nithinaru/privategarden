// the fountain: a pencil drawing with real water running through it.
//
//  - the stone is svg linework (rims, fluting, rings, shading), each line given
//    a slight hand wobble and drawn on in the order you'd sketch it
//  - the water is a small particle simulation on a canvas over the drawing:
//    a jet at the top, then each bowl spills over its rim into the next
//  - the cursor is a hand in the water: streams break on it and splash round
//    it. click (or tap) and the jet surges. the grass leans away from you.
window.Fountain = (() => {
  const NS = "http://www.w3.org/2000/svg";
  const VB = { x: 12, y: 50, w: 376, h: 334 };   // must match the svg viewBox
  const CX = 200;
  const rand = (a, b) => a + Math.random() * (b - a);
  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    parent && parent.appendChild(n);
    return n;
  };

  // ---------- the drawing ----------
  const ring = (cy, rx, ry) => `M${CX - rx},${cy} A${rx},${ry} 0 1 0 ${CX + rx},${cy} A${rx},${ry} 0 1 0 ${CX - rx},${cy}`;
  const front = (cy, rx, ry) => `M${CX - rx},${cy} A${rx},${ry} 0 0 0 ${CX + rx},${cy}`;
  const bowl = (cy, rx, by, bw) =>
    `M${CX - rx},${cy} C${CX - rx * 0.86},${cy + (by - cy) * 0.72} ${CX - bw * 2.4},${by} ${CX},${by} C${CX + bw * 2.4},${by} ${CX + rx * 0.86},${cy + (by - cy) * 0.72} ${CX + rx},${cy}`;
  // carved ribs running from the rim down to the foot of a bowl
  const ribs = (cy, rx, ry, by, bw, n) => {
    const out = [];
    for (let k = -n; k <= n; k++) {
      const a = (k / (n + 0.7)) * 1.2;
      const x0 = CX + rx * Math.sin(a), y0 = cy + ry * Math.cos(a) + 1.2, x1 = CX + bw * Math.sin(a);
      out.push(`M${x0.toFixed(1)},${y0.toFixed(1)} Q${(x0 - (x0 - CX) * 0.1).toFixed(1)},${(y0 + (by - y0) * 0.78).toFixed(1)} ${x1.toFixed(1)},${by - 0.6}`);
    }
    return out;
  };
  // upright flutes round the basin wall
  const flutes = () => {
    const out = [];
    for (let k = -10; k <= 10; k++) {
      const a = (k * 8 * Math.PI) / 180, x = CX + 152 * Math.sin(a), y = 296 + 34 * Math.cos(a);
      out.push(`M${x.toFixed(1)},${(y + 3.5).toFixed(1)} L${x.toFixed(1)},${(y + 22.5).toFixed(1)}`);
    }
    return out;
  };
  // cut joints across the front of the step
  const joints = () => {
    const out = [];
    for (let k = -4; k <= 4; k++) {
      const a = (k * 17 * Math.PI) / 180, x = CX + 168 * Math.sin(a), y = 324 + 38 * Math.cos(a);
      out.push(`M${x.toFixed(1)},${(y + 0.8).toFixed(1)} L${x.toFixed(1)},${(y + 6.4).toFixed(1)}`);
    }
    return out;
  };
  // the shadow on the ground: rows of short strokes following the step, fewer further out
  const ground = () => {
    const out = [];
    for (let row = 0; row < 2; row++) {
      const rx = 171 + row * 6, ry = 39.5 + row * 2.6, span = 1.05 - row * 0.4;
      for (let a = -span; a < span; a += 0.34) {
        const a1 = a + 0.22;
        out.push(`M${(CX + rx * Math.sin(a)).toFixed(1)},${(334 + ry * Math.cos(a)).toFixed(1)} L${(CX + rx * Math.sin(a1)).toFixed(1)},${(334 + ry * Math.cos(a1)).toFixed(1)}`);
      }
    }
    return out;
  };
  // short slanted pencil strokes; clipped to a shape by the caller
  const strokes = (x0, x1, y0, y1, gap) => {
    const out = [];
    for (let x = x0; x < x1; x += gap) out.push(`M${x.toFixed(1)},${y1} L${(x + (y1 - y0) * 0.5).toFixed(1)},${y0}`);
    return out;
  };

  // drawn in this order. `d` is one stroke or a list drawn as one run.
  const DRAWING = [
    // basin: coping, fluted wall, skirting
    { c: "f-line", d: ring(296, 152, 34) },
    { c: "f-line", d: ring(297, 140, 28) },
    { c: "f-detail", d: front(300, 152, 34) },
    { c: "f-line", d: ["M48,296 L48,322", "M352,296 L352,322"] },
    { c: "f-line", d: front(322, 152, 34) },
    { c: "f-detail", d: front(318, 152, 34) },
    { c: "f-detail", d: flutes() },
    { c: "f-shade", d: strokes(262, 352, 300, 356, 3.4), clip: "M48,296 A152,34 0 0 0 352,296 L352,322 A152,34 0 0 1 48,322 Z" },
    // the stone step it stands on: a wide low slab with cut joints
    { c: "f-line", d: [front(324, 168, 38), "M32,324 L32,331", "M368,324 L368,331", front(331, 168, 38)] },
    { c: "f-detail", d: joints() },
    { c: "f-shade", d: strokes(286, 372, 326, 372, 3), clip: "M32,324 A168,38 0 0 0 368,324 L368,331 A168,38 0 0 1 32,331 Z" },
    // where it meets the ground: short strokes that thin out away from the stone
    { c: "f-shade", d: ground() },
    // pedestal
    { c: "f-line", d: ["M186,300 C183,290 192,285 191,274 C190,262 196,256 195,241", "M214,300 C217,290 208,285 209,274 C210,262 204,256 205,241"] },
    { c: "f-detail", d: ["M184,300 Q200,306 216,300", "M190.5,283 Q200,287 209.5,283", "M190.5,279 Q200,283 209.5,279", "M193.5,259 Q200,262 206.5,259"] },
    { c: "f-shade", d: strokes(200, 216, 242, 300, 2.6), clip: "M200,241 L205,241 C204,256 210,262 209,274 C208,285 217,290 214,300 L200,300 Z" },
    // lower bowl
    { c: "f-line", d: ring(200, 72, 11) },
    { c: "f-line", d: bowl(200, 72, 240, 6) },
    { c: "f-detail", d: [ring(201, 65, 8.6), "M190,240 Q200,244 210,240"] },
    { c: "f-detail", d: ribs(200, 72, 11, 240, 9, 4) },
    { c: "f-shade", d: strokes(222, 272, 203, 240, 3), clip: "M128,200 A72,11 0 0 0 272,200 C262,229 214,240 200,240 C186,240 138,229 128,200 Z" },
    // middle stem and bowl
    { c: "f-line", d: ["M195,178 L193,196", "M205,178 L207,196", ring(187, 9, 4.6)] },
    { c: "f-line", d: ring(150, 46, 7) },
    { c: "f-line", d: bowl(150, 46, 178, 5) },
    { c: "f-detail", d: [ring(151, 40.5, 5.2), ...ribs(150, 46, 7, 178, 7, 3)] },
    { c: "f-shade", d: strokes(214, 246, 152, 178, 2.8), clip: "M154,150 A46,7 0 0 0 246,150 C240,170 210,178 200,178 C190,178 160,170 154,150 Z" },
    // top stem and bowl
    { c: "f-line", d: ["M196,134 L195,148", "M204,134 L205,148", ring(141, 6.4, 3.4)] },
    { c: "f-line", d: ring(115, 28, 5) },
    { c: "f-line", d: bowl(115, 28, 134, 4) },
    { c: "f-detail", d: [ring(116, 23.5, 3.4), ...ribs(115, 28, 5, 134, 5, 2)] },
    // finial
    { c: "f-line", d: ["M196,115 C190,108 192,98 197,94 L197,89", "M204,115 C210,108 208,98 203,94 L203,89", ring(85, 4.6, 4.6)] },
    { c: "f-detail", d: ["M194,104 Q200,108 206,104", "M195,99 Q200,102 205,99", "M197,92 L203,92"] },
    // still water lying in the bowls
    { c: "f-detail", d: ["M92,300 A110,17 0 0 0 308,300", "M124,307 A80,10 0 0 0 276,307", "M160,203 A44,4.5 0 0 0 240,203", "M176,152 A26,2.6 0 0 0 224,152"] },
  ];

  // give a path the slight waver of a hand. sampled, then offset along its normal.
  function wobble(measure, d, amp, seed) {
    const p = el("path", { d }, measure);
    const L = p.getTotalLength();
    const n = Math.max(3, Math.ceil(L / 4.5));
    let out = "";
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * L;
      const a = p.getPointAtLength(Math.max(t - 0.5, 0)), b = p.getPointAtLength(Math.min(t + 0.5, L)), c = p.getPointAtLength(t);
      const dx = b.x - a.x, dy = b.y - a.y, m = Math.hypot(dx, dy) || 1;
      const edge = Math.min(1, i / 2, (n - i) / 2);   // ends stay put so joins still meet
      const o = amp * edge * (Math.sin(t * 0.13 + seed * 1.9) * 0.6 + Math.sin(t * 0.37 + seed * 3.3) * 0.4);
      out += (i ? " L" : "M") + (c.x - (dy / m) * o).toFixed(1) + "," + (c.y + (dx / m) * o).toFixed(1);
    }
    p.remove();
    return out;
  }

  function sketch(svg, calm) {
    const measure = el("g", { style: "visibility:hidden" }, svg);
    let at = 0, seed = 1, clips = 0;
    for (const part of DRAWING) {
      const subs = [].concat(part.d).map((d) => wobble(measure, d, part.c === "f-line" ? 0.55 : 0.35, seed++));
      let parent = svg;
      if (part.clip) {
        const id = "fc" + clips++;
        el("path", { d: part.clip }, el("clipPath", { id }, svg));
        parent = el("g", { "clip-path": `url(#${id})` }, svg);
      }
      const p = el("path", { d: subs.join(" "), class: part.c, pathLength: 1 }, parent);
      if (calm) { p.style.strokeDashoffset = 0; continue; }
      const dur = part.c === "f-line" ? 750 : part.c === "f-detail" ? 950 : 700;
      p.style.transitionDuration = dur + "ms";
      setTimeout(() => (p.style.strokeDashoffset = 0), at);
      at += part.c === "f-shade" ? 60 : 95;
    }
    measure.remove();
    return at; // when the last line starts
  }

  // ---------- the water ----------
  const G = 330;                                           // gravity, drawing units / s²
  // each rim spills in separate streams (like a scalloped lip), not an even sheet
  const RIMS = [
    { y: 116, rx: 25, ry: 4.2, rate: 120, wait: 0.5, streams: 9 },
    { y: 151, rx: 43, ry: 6.2, rate: 190, wait: 0.95, streams: 13 },
    { y: 201, rx: 69, ry: 10, rate: 170, wait: 1.45, streams: 15 },
  ];
  RIMS.forEach((r) => (r.at = Array.from({ length: r.streams }, (_, i) => ({ a: -1.4 + (2.8 * i) / (r.streams - 1), ph: rand(0, 6.3) }))));
  const POOLS = [                                          // where falling water can land
    { y: 116, rx: 26, ry: 4.5 }, { y: 151, rx: 44, ry: 6.5 }, { y: 201, rx: 70, ry: 10.5 }, { y: 298, rx: 136, ry: 26, basin: true },
  ];
  const BASIN = POOLS[3], GROUND = 372, HAND = 14;

  function water(wrap, startIn) {
    // the canvas covers the whole first screen, not just the fountain's box, so water that is
    // thrown about is never cut off at an edge. it sits under the text (see .wash in style.css).
    const cv = document.createElement("canvas");
    cv.className = "wash";
    const room = wrap.parentElement;
    room.insertBefore(cv, room.firstChild);
    const ctx = cv.getContext("2d");
    let sc = 1, ox = 0, oy = 0, dpr = 1, box;
    function fit() {
      box = cv.getBoundingClientRect();
      const art = wrap.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, 2);
      const w = Math.round(box.width * dpr), h = Math.round(box.height * dpr);
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      sc = Math.min(art.width / VB.w, art.height / VB.h);            // same fit as the svg: xMidYMax meet
      ox = art.left - box.left + (art.width - VB.w * sc) / 2 - VB.x * sc;
      oy = art.top - box.top + art.height - VB.h * sc - VB.y * sc;
    }
    fit();
    addEventListener("resize", fit);
    if (window.ResizeObserver) { const ro = new ResizeObserver(fit); ro.observe(wrap); ro.observe(room); }

    // the hand: where it is, how fast it moves, how wet it is, where it last left a ring
    const hand = { on: false, x: 0, y: 0, vx: 0, vy: 0, t: 0, show: 0, wet: 0, rx: 0, ry: 0 };
    let surge = 0;
    const toUnits = (e) => { box = cv.getBoundingClientRect(); return [(e.clientX - box.left - ox) / sc, (e.clientY - box.top - oy) / sc]; };
    wrap.addEventListener("pointermove", (e) => {
      const [x, y] = toUnits(e), now = performance.now(), dt = Math.max((now - hand.t) / 1000, 0.008);
      if (hand.on) { hand.vx = hand.vx * 0.5 + ((x - hand.x) / dt) * 0.5; hand.vy = hand.vy * 0.5 + ((y - hand.y) / dt) * 0.5; }
      hand.x = x; hand.y = y; hand.t = now; hand.on = true;
    });
    const away = () => (hand.on = false);
    wrap.addEventListener("pointerleave", away);
    wrap.addEventListener("pointercancel", away);
    wrap.addEventListener("pointerup", (e) => { if (e.pointerType !== "mouse") away(); });
    wrap.addEventListener("pointerdown", (e) => { const [x, y] = toUnits(e); hand.x = x; hand.y = y; hand.on = true; surge = 1; });
    const inBasin = (x, y) => ((x - CX) / BASIN.rx) ** 2 + ((y - BASIN.y) / BASIN.ry) ** 2 < 1;

    const drops = [], rings = [];
    const owed = [0, 0, 0, 0, 0];                          // fractional drops waiting to be let go
    const spawn = (x, y, vx, vy, d, spray) => drops.push({ x, y, vx, vy, d, spray, a: rand(0.5, 1) });

    function emit(t, dt) {
      const flow = (wait) => Math.min(1, Math.max(0, (t - wait) / 0.9));
      owed[3] += 85 * flow(0) * (1 + surge * 1.6) * dt;
      for (; owed[3] >= 1; owed[3]--)                      // the jet: a tight plume that opens as it falls
        spawn(CX + rand(-1, 1), 82, rand(-1, 1) * rand(3, 15) * (1 + surge), -rand(66, 96) * (1 + surge * 0.9), rand(-0.4, 0.7), false);
      RIMS.forEach((r, i) => {
        owed[i] += r.rate * flow(r.wait) * (1 + surge * 0.5) * dt;
        for (; owed[i] >= 1; owed[i]--) {
          let a;
          if (Math.random() < 0.82) {                      // most water runs down one of the streams, which sway a little
            const st = r.at[Math.floor(Math.random() * r.at.length)];
            a = st.a + Math.sin(t * 0.6 + st.ph) * 0.05 + rand(-0.03, 0.03);
          } else a = rand(-1.42, 1.42);                    // the rest is loose spill between them
          const s = Math.sin(a), c = Math.cos(a);
          spawn(CX + r.rx * s, r.y + r.ry * c, s * rand(13, 30) + rand(-2, 2), rand(-6, 2), c, false);
          drops[drops.length - 1].skip = POOLS[i];
        }
      });
      if (hand.wet > 0.02) {                               // a wet hand drips
        owed[4] += hand.wet * 26 * dt;
        for (; owed[4] >= 1; owed[4]--) spawn(hand.x + rand(-HAND, HAND) * 0.8, hand.y + HAND * rand(0.6, 1), hand.vx * 0.2 + rand(-4, 4), rand(0, 12), rand(0, 1), false);
      }
    }

    function step(dt) {
      const speed = Math.hypot(hand.vx, hand.vy);
      for (let i = drops.length - 1; i >= 0; i--) {
        const p = drops[i], py = p.y;
        p.vy += G * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        if (hand.on) {
          const dx = p.x - hand.x, dy = p.y - hand.y, r2 = dx * dx + dy * dy;
          if (r2 < HAND * HAND) {                          // water breaks on the hand and runs off round it
            const r = Math.sqrt(r2) || 0.01, nx = dx / r, ny = dy / r, vn = p.vx * nx + p.vy * ny;
            p.x = hand.x + nx * HAND; p.y = hand.y + ny * HAND;
            if (vn < 0) {
              p.vx -= 1.22 * vn * nx; p.vy -= 1.22 * vn * ny;
              hand.wet = Math.min(1, hand.wet + 0.02);
              if (!p.spray && Math.random() < 0.3) spawn(p.x, p.y, nx * rand(18, 46) + rand(-12, 12), -rand(8, 40), p.d, true);
            }
            p.vx += hand.vx * 0.25 + rand(-5, 5); p.vy += hand.vy * 0.25;
          } else if (speed > 50 && r2 < 3600) {            // a quick sweep drags the water near it along
            const pull = (1 - Math.sqrt(r2) / 60) * dt * 2.4;
            p.vx += hand.vx * pull; p.vy += hand.vy * pull * 0.5;
          }
        }
        let landed = null;
        if (p.vy > 0 && !p.out) {
          // a drop let go at a rim starts a hair above the bowl it just left, so it skips that one.
          // every other surface catches it on the frame it crosses.
          for (const pool of POOLS) {
            if (pool === p.skip) continue;
            const sy = pool.y + pool.ry * p.d * 0.85;
            if (py < sy && p.y >= sy && Math.abs(p.x - CX) < pool.rx) { landed = pool; p.y = sy; break; }
          }
        }
        if (landed || p.y > GROUND) {
          if (landed && !p.spray) {
            const n = Math.random() < (landed.basin ? 0.55 : 0.4) ? 1 : 0;
            for (let k = 0; k < n; k++) spawn(p.x, p.y - 0.5, rand(-18, 18), -rand(14, 44), p.d, true);
            // now and then a splash near the edge jumps the coping and falls to the ground
            const off = (p.x - CX) / landed.rx;
            if (landed.basin && Math.abs(off) > 0.5 && Math.random() < 0.3) {
              spawn(p.x, p.y - 0.5, Math.sign(off) * rand(26, 58), -rand(34, 60), p.d, true);
              drops[drops.length - 1].out = true;
            }
            if (Math.random() < (landed.basin ? 0.06 : 0.025)) rings.push({ x: p.x, y: p.y, age: 0, max: landed.basin ? 24 : 7 });
          }
          drops[i] = drops[drops.length - 1]; drops.pop();
        }
      }
      // dragging the hand across the basin leaves a wake
      if (hand.on && inBasin(hand.x, hand.y) && Math.hypot(hand.x - hand.rx, hand.y - hand.ry) > 7) {
        rings.push({ x: hand.x, y: hand.y, age: 0, max: 20 });
        hand.rx = hand.x; hand.ry = hand.y;
      }
      for (let i = rings.length - 1; i >= 0; i--) if ((rings[i].age += dt) > 1.1) rings.splice(i, 1);
      hand.vx *= 0.86; hand.vy *= 0.86;
      hand.wet = Math.max(0, hand.wet - dt * 0.55);
      surge = Math.max(0, surge - dt / 1.3);
    }

    // grass: tufts rooted along the foot of the step. tall clumps at the sides,
    // short ones across the front, each a fan of curved blades; a few carry a daisy.
    const blades = [];
    const tuft = (a, n, H, spread) => {
      const rx = 173, ry = 40, x = CX + rx * Math.sin(a), y = 333 + ry * Math.cos(a), out = Math.sign(a) * 0.25;
      for (let i = 0; i < n; i++) {
        const u = n > 1 ? i / (n - 1) - 0.5 : 0;
        blades.push({ x: x + u * 5 + rand(-1, 1), y: y + rand(-0.8, 0.8), h: H * rand(0.5, 1), ang: out + u * spread + rand(-0.12, 0.12), ph: rand(0, 6.3), push: 0, bloom: Math.random() < 0.07 });
      }
    };
    for (const side of [-1, 1]) {
      tuft(side * 1.5, 8, 30, 1.2); tuft(side * 1.34, 9, 26, 1.1); tuft(side * 1.17, 7, 20, 1.0);   // the big clumps at each side
      tuft(side * 0.95, 5, 13, 0.9); tuft(side * 0.62, 4, 9, 0.9); tuft(side * 0.3, 3, 7, 0.8);      // thinning toward the front
    }
    tuft(0.04, 3, 6, 0.9);

    function draw(t) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.setTransform(sc * dpr, 0, 0, sc * dpr, ox * dpr, oy * dpr);
      ctx.lineCap = "round";
      // each drop is a stroke along its own path; fast drops leave longer strokes,
      // so a stream reads as a thread of water rather than dots
      for (const [lo, hi, w, alpha] of [[0, 0.7, 0.5, 0.55], [0.7, 0.9, 0.65, 0.78], [0.9, 2, 0.85, 0.92]]) {
        ctx.beginPath();
        for (const p of drops) {
          if (p.a < lo || p.a >= hi) continue;
          const k = p.spray ? 0.013 : 0.034;
          ctx.moveTo(p.x - p.vx * k, p.y - p.vy * k); ctx.lineTo(p.x, p.y);
        }
        ctx.lineWidth = w; ctx.strokeStyle = `rgba(30,30,30,${alpha})`; ctx.stroke();
      }
      for (const r of rings) {
        const k = r.age / 1.1, rx = 2 + k * r.max;
        ctx.beginPath(); ctx.ellipse(r.x, r.y, rx, rx * 0.2, 0, 0, 6.2832);
        ctx.lineWidth = 0.5; ctx.strokeStyle = `rgba(30,30,30,${0.55 * (1 - k)})`; ctx.stroke();
      }
      const grow = Math.min(1, Math.max(0, t / 1.2));
      const draught = Math.max(-1, Math.min(1, hand.vx / 300)) * hand.show;
      const blooms = [];
      ctx.beginPath();
      for (const b of blades) {
        let want = draught * 0.35;                         // bends in the draught of a sweep
        if (hand.on && hand.y > 270) { const dx = b.x - hand.x; if (Math.abs(dx) < 50) want += Math.sign(dx || 1) * (1 - Math.abs(dx) / 50) * 0.7; }
        b.push += (want - b.push) * 0.1;                   // and leans away from the hand
        const h = b.h * grow, ang = b.ang + Math.sin(t * 1.2 + b.ph) * 0.07 + b.push;
        const tx = b.x + Math.sin(ang) * h, ty = b.y - Math.cos(ang) * h;
        ctx.moveTo(b.x, b.y);
        ctx.quadraticCurveTo(b.x + Math.sin(b.ang * 0.3) * h * 0.2, b.y - h * 0.62, tx, ty);
        if (b.bloom && grow > 0.9) blooms.push([tx, ty]);
      }
      ctx.lineWidth = 0.6; ctx.strokeStyle = "rgba(30,30,30,.82)"; ctx.stroke();
      ctx.beginPath();
      for (const [x, y] of blooms) { ctx.moveTo(x + 1.5, y - 0.6); ctx.arc(x, y - 0.6, 1.5, 0, 6.2832); }
      ctx.lineWidth = 0.5; ctx.stroke();
      hand.show += ((hand.on ? 1 : 0) - hand.show) * 0.15;   // eases the grass in and out of the draught
    }

    // run only while the fountain is on screen and the tab is in front
    let seen = true, last = 0, t = -startIn, raf = 0;
    new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen && !raf) raf = requestAnimationFrame(frame); }).observe(wrap);
    function frame(now) {
      raf = 0;
      if (!seen || document.hidden) { last = 0; return; }
      const dt = last ? Math.min((now - last) / 1000, 0.034) : 0.016;
      last = now; t += dt;
      if (t > 0) { emit(t, dt); step(dt); }
      draw(t + startIn);
      raf = requestAnimationFrame(frame);
    }
    document.addEventListener("visibilitychange", () => { if (!document.hidden && seen && !raf) raf = requestAnimationFrame(frame); });
    raf = requestAnimationFrame(frame);
  }

  function start(svg) {
    if (!svg || svg.dataset.on) return;
    svg.dataset.on = "1";
    svg.replaceChildren();
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lastLine = sketch(svg, calm);
    if (!calm) water(svg.parentElement, lastLine / 1000 + 0.3);
  }

  return { start };
})();
