// the fountain, drawn like stop-motion: each part is outlined stroke by stroke,
// then shaded in with hatching, bottom tier to top. then water runs down
// tier by tier, fills each bowl, and keeps flowing. paper + ink only.
window.Fountain = (() => {
  const NS = "http://www.w3.org/2000/svg";
  const FPS = 12;          // drawing speed, in stepped frames
  const LOOP_FPS = 8;      // water loop, on twos
  const INK = "#111", PAPER = "#fff";

  let uid = 0;
  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    parent && parent.appendChild(n);
    return n;
  };
  const tick = () => new Promise((r) => setTimeout(r, 1000 / FPS));
  const frames = async (n) => { for (let i = 0; i < n; i++) await tick(); };
  const E = (cx, cy, rx, ry) =>
    `M${cx - rx},${cy} A${rx},${ry} 0 1 0 ${cx + rx},${cy} A${rx},${ry} 0 1 0 ${cx - rx},${cy} Z`;

  // ---- the drawing ----
  // strokes: groups drawn one after another (paths in a group draw together)
  // fill: closed shape that gets hatched in after the outline
  // surface: the water in that bowl, hatched in once water reaches it
  const PARTS = [
    { // basin
      strokes: [
        [E(200, 296, 152, 34)],
        [E(200, 297, 138, 27)],
        ["M48,296 L48,320", "M352,296 L352,320"],
        ["M48,320 A152,34 0 0 0 352,320"],
        ["M70,350 C150,361 250,361 330,350"],
      ],
      fill: "M48,296 L48,320 A152,34 0 0 0 352,320 L352,296 A152,34 0 0 1 48,296 Z",
      surface: E(200, 298, 136, 26),
    },
    { // pedestal
      strokes: [["M184,300 C190,272 192,240 194,204", "M216,300 C210,272 208,240 206,204"]],
      fill: "M184,300 C190,272 192,240 194,204 L206,204 C208,240 210,272 216,300 Z",
    },
    { // lower bowl
      strokes: [
        [E(200, 200, 72, 11)],
        ["M128,200 C140,232 175,240 200,240 C225,240 260,232 272,200"],
      ],
      fill: "M128,200 C140,232 175,240 200,240 C225,240 260,232 272,200 A72,11 0 0 1 128,200 Z",
      surface: E(200, 201, 62, 7.5),
    },
    { // middle stem
      strokes: [["M195,150 L193,200", "M205,150 L207,200"], [E(200, 182, 10, 6)]],
      fill: `M195,150 L193,200 L207,200 L205,150 Z ${E(200, 182, 10, 6)}`,
    },
    { // middle bowl
      strokes: [
        [E(200, 150, 46, 7)],
        ["M154,150 C165,172 185,178 200,178 C215,178 235,172 246,150"],
      ],
      fill: "M154,150 C165,172 185,178 200,178 C215,178 235,172 246,150 A46,7 0 0 1 154,150 Z",
      surface: E(200, 151, 38, 4.4),
    },
    { // top stem
      strokes: [["M196,115 L195,150", "M204,115 L205,150"], [E(200, 135, 7, 4.5)]],
      fill: `M196,115 L195,150 L205,150 L204,115 Z ${E(200, 135, 7, 4.5)}`,
    },
    { // top bowl
      strokes: [
        [E(200, 115, 28, 5)],
        ["M172,115 C178,130 190,134 200,134 C210,134 222,130 228,115"],
      ],
      fill: "M172,115 C178,130 190,134 200,134 C210,134 222,130 228,115 A28,5 0 0 1 172,115 Z",
      surface: E(200, 116, 22, 2.8),
    },
    { // finial
      strokes: [
        ["M196,116 C190,108 192,98 197,94 L197,89", "M204,116 C210,108 208,98 203,94 L203,89"],
        [E(200, 84.5, 4.5, 4.5)],
      ],
      fill: `M196,116 C190,108 192,98 197,94 L197,89 L203,89 L203,94 C208,98 210,108 204,116 Z ${E(200, 84.5, 4.5, 4.5)}`,
    },
  ];

  // water, top down. each step: the streams, then the bowl they land in.
  const WATER = [
    { streams: ["M200,80 C197,66 190,64 185,74", "M200,80 C203,66 210,64 215,74"], fills: 6 },
    { streams: ["M174,116 C163,119 159,131 161,146", "M226,116 C237,119 241,131 239,146"], fills: 4 },
    { streams: ["M157,152 C142,157 136,176 138,196", "M243,152 C258,157 264,176 262,196"], fills: 2 },
    { streams: ["M131,203 C108,210 101,250 103,288", "M269,203 C292,210 299,250 297,288"], fills: 0 },
  ];
  const LANDINGS = [[103, 292], [297, 292]];

  // ---- helpers ----
  // hand-drawn wobble baked into the geometry (no live svg filter, which is
  // expensive to re-render every frame)
  let measure;
  function wobble(d, amp, seed) {
    const p = el("path", { d }, measure);
    const L = p.getTotalLength();
    const n = Math.max(8, Math.ceil(L / 4));
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * L;
      const a = p.getPointAtLength(Math.max(t - 0.5, 0)), b = p.getPointAtLength(Math.min(t + 0.5, L));
      const c = p.getPointAtLength(t);
      const dx = b.x - a.x, dy = b.y - a.y, m = Math.hypot(dx, dy) || 1;
      const o = amp * (Math.sin(t * 0.11 + seed * 1.7) * 0.6 + Math.sin(t * 0.31 + seed * 3.1) * 0.4);
      pts.push(`${(c.x - (dy / m) * o).toFixed(1)},${(c.y + (dx / m) * o).toFixed(1)}`);
    }
    p.remove();
    return "M" + pts.join(" L");
  }

  // each outline gets three wobble variants; the boil loop flips between them
  const boilSets = [];
  function stroke(parent, d, w = 1.8, variants = 3) {
    const set = [];
    for (let v = 0; v < variants; v++) {
      set.push(el("path", {
        d: wobble(d, 0.9, v * 2.3 + uid++), fill: "none", stroke: INK, "stroke-width": w,
        "stroke-linecap": "round", "stroke-linejoin": "round", style: "visibility:hidden",
      }, parent));
    }
    set[0].set = set;
    return set[0];
  }

  // reveal strokes in a few hard steps, like frames of a pencil moving
  async function drawIn(paths, steps) {
    paths.forEach((p) => {
      const len = p.getTotalLength();
      p.dataset.len = len;
      p.style.strokeDasharray = `${len} ${len}`;
      p.style.strokeDashoffset = len;
      p.style.visibility = "visible";
    });
    for (let s = 1; s <= steps; s++) {
      paths.forEach((p) => (p.style.strokeDashoffset = p.dataset.len * (1 - s / steps)));
      await tick();
    }
    paths.forEach((p) => {
      p.style.strokeDasharray = "none";
      if (p.set && p.set.length > 1) boilSets.push(p.set);
    });
  }

  // hatch a closed shape, sweeping left to right in `steps` frames
  async function hatch(parent, d, { angle = 52, gap = 2.6, width = 1.9, steps = 4, opaque = true } = {}) {
    const id = "h" + ++uid;
    const probe = el("path", { d }, parent);
    const b = probe.getBBox();
    probe.remove();
    const clip = el("clipPath", { id }, parent);
    el("path", { d }, clip);
    const g = el("g", { "clip-path": `url(#${id})` }, parent);
    // solid paper underneath, so parts in front hide the parts behind
    if (opaque) el("path", { d, fill: PAPER }, g);

    const lines = [];
    const j = () => (Math.random() - 0.5) * 1.2; // slightly uneven, like a pen
    const line = (x1, y1, x2, y2) => lines.push(el("line", {
      x1: x1 + j(), y1: y1 + j(), x2: x2 + j(), y2: y2 + j(),
      stroke: INK, "stroke-width": (width * (0.85 + Math.random() * 0.3)).toFixed(2),
      "stroke-linecap": "round", style: "visibility:hidden",
    }, g));
    if (angle === 0) {
      // water: flat strokes, top to bottom
      for (let y = b.y + gap / 2; y < b.y + b.height; y += gap) line(b.x - 2, y, b.x + b.width + 2, y);
    } else {
      const rise = b.height / Math.tan((angle * Math.PI) / 180); // x travel across the height
      for (let x = b.x - rise - 2; x < b.x + b.width + 2; x += gap) line(x, b.y + b.height + 1, x + rise, b.y - 1);
    }
    for (let s = 1; s <= steps; s++) {
      const upto = Math.ceil((lines.length * s) / steps);
      lines.slice(0, upto).forEach((l) => (l.style.visibility = "visible"));
      await tick();
    }
    return g;
  }

  // ---- run ----
  async function start(svg) {
    if (!svg || svg.dataset.on) return;
    svg.dataset.on = "1";
    svg.replaceChildren();
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

    measure = el("g", { style: "visibility:hidden" }, svg);
    const root = el("g", {}, svg);
    // boil: every outline flips to its next wobble variant, on twos
    let k = 0;
    if (!calm) setInterval(() => {
      k = (k + 1) % 3;
      boilSets.forEach((set) => set.forEach((p, i) => (p.style.visibility = i === k ? "visible" : "hidden")));
    }, 1000 / LOOP_FPS);

    const fast = calm ? { draw: 1, hatch: 1 } : { draw: 4, hatch: 4 };

    // 1. the stone, bottom to top
    const stone = el("g", {}, root);
    for (const part of PARTS) {
      const g = el("g", {}, stone);
      const fillLayer = el("g", {}, g);   // hatching sits under its own outline
      for (const group of part.strokes) {
        await drawIn(group.map((d) => stroke(g, d)), fast.draw);
      }
      await hatch(fillLayer, part.fill, { steps: fast.hatch });
      if (!calm) await frames(1);
    }
    if (!calm) await frames(3);

    // 2. water runs down, filling each bowl on the way
    const water = el("g", {}, root);
    const allStreams = [];
    for (const step of WATER) {
      const ps = step.streams.map((d) => stroke(water, d, 2.4, 1));
      allStreams.push(...ps);
      await drawIn(ps, calm ? 1 : 3);
      const surface = PARTS[step.fills].surface;
      await hatch(water, surface, { angle: 0, gap: 2.2, width: 1, steps: calm ? 1 : 3, opaque: false });
    }
    if (calm) return;

    // 3. keep it running: falling droplets, splashes, rings in the basin
    allStreams.forEach((s) => (s.style.strokeDasharray = "5 6"));
    const splashes = LANDINGS.map(([x, y]) =>
      el("path", { d: `M${x - 10},${y} l-6,-7 M${x},${y - 2} l0,-10 M${x + 10},${y} l6,-7`, fill: "none", stroke: INK, "stroke-width": 1.8, "stroke-linecap": "round" }, water));
    const rings = LANDINGS.map(([x, y]) =>
      el("ellipse", { cx: x, cy: y + 4, rx: 4, ry: 1.2, fill: "none", stroke: INK, "stroke-width": 1.2 }, water));
    let off = 0, n = 0;
    setInterval(() => {
      off -= 4;
      allStreams.forEach((s) => (s.style.strokeDashoffset = off));
      splashes.forEach((s, i) => (s.style.visibility = (n + i) % 2 ? "visible" : "hidden"));
      rings.forEach((r, i) => {
        const k = (n + i * 2) % 4;              // grows over 4 frames, then resets
        r.setAttribute("rx", 5 + k * 5);
        r.setAttribute("ry", 1.4 + k * 1.3);
        r.style.visibility = k === 3 ? "hidden" : "visible";
      });
      n++;
    }, 1000 / LOOP_FPS);
  }

  return { start };
})();
