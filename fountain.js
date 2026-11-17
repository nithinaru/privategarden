// stop-motion fountain: doodles, then construction lines, then ink, then water.
// everything runs at 8fps ("on twos") and the lines boil so it feels hand drawn.
window.Fountain = (() => {
  const NS = "http://www.w3.org/2000/svg";
  const FPS = 8;
  const INK = "#111", PAPER = "#efece4";

  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    parent && parent.appendChild(n);
    return n;
  };
  const tick = () => new Promise((r) => setTimeout(r, 1000 / FPS));
  const frames = async (n) => { for (let i = 0; i < n; i++) await tick(); };

  // reveal a stroke in a few hard steps instead of smoothly
  async function drawIn(paths, steps = 3) {
    paths.forEach((p) => {
      const len = p.getTotalLength();
      p.dataset.len = len;
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
      p.style.visibility = "visible";
    });
    for (let s = 1; s <= steps; s++) {
      paths.forEach((p) => (p.style.strokeDashoffset = p.dataset.len * (1 - s / steps)));
      await tick();
    }
  }

  const sketch = (g, d, w = 1.6) =>
    el("path", { d, fill: "none", stroke: INK, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round", style: "visibility:hidden" }, g);

  // quick studies before the fountain shows up
  const DOODLES = [
    // circle studies
    ["M150,200 C150,160 250,160 250,200 C250,240 150,242 152,198",
     "M165,200 C166,175 236,172 236,200 C236,226 166,228 168,202",
     "M120,200 L280,200", "M200,140 L200,262"],
    // a leaf
    ["M200,300 C150,250 152,150 200,98 C248,150 250,250 200,300",
     "M200,296 L200,112", "M200,250 L170,226", "M200,215 L230,190", "M200,180 L176,160", "M200,250 L232,224"],
    // a chair
    ["M160,130 C185,120 215,120 240,130", "M160,130 L162,222", "M240,130 L238,222",
     "M150,222 L250,222", "M156,222 L150,300", "M244,222 L250,300", "M170,226 L176,290", "M230,226 L224,290"],
  ];

  // construction lines for the fountain
  const GUIDES = [
    "M200,56 L200,350",
    "M44,296 L356,296", "M120,200 L280,200", "M148,150 L252,150", "M166,115 L234,115",
    "M48,296 A152,34 0 1 0 352,296 A152,34 0 1 0 48,296",
    "M128,200 A72,11 0 1 0 272,200 A72,11 0 1 0 128,200",
    "M154,150 A46,7 0 1 0 246,150 A46,7 0 1 0 154,150",
  ];

  // the inked fountain, bottom tier first. each entry shows up on its own frame.
  function inkTiers(g) {
    const tiers = [];
    const tier = () => { const t = el("g", { style: "visibility:hidden" }, g); tiers.push(t); return t; };

    let t = tier(); // basin wall + rim + water
    el("path", { d: "M48,296 L48,318 A152,34 0 0 0 352,318 L352,296 A152,34 0 0 1 48,296 Z", fill: INK }, t);
    [[80, 328], [140, 338], [200, 341], [260, 338], [320, 328]].forEach(([x, y]) => el("circle", { cx: x, cy: y, r: 4, fill: PAPER }, t));
    el("ellipse", { cx: 200, cy: 296, rx: 152, ry: 34, fill: PAPER, stroke: INK, "stroke-width": 7 }, t);
    el("ellipse", { cx: 200, cy: 299, rx: 132, ry: 25, fill: INK }, t);

    t = tier(); // pedestal
    el("path", { d: "M184,300 C190,272 192,240 194,204 L206,204 C208,240 210,272 216,300 Z", fill: INK }, t);
    el("path", { d: "M180,302 Q200,294 220,302", fill: "none", stroke: PAPER, "stroke-width": 2 }, t);

    t = tier(); // lower bowl
    el("path", { d: "M128,200 C140,232 175,240 200,240 C225,240 260,232 272,200 Z", fill: INK }, t);
    [150, 175, 200, 225].forEach((x) => el("path", { d: `M${x},214 q6.5,8 13,0`, fill: "none", stroke: PAPER, "stroke-width": 2 }, t));
    el("ellipse", { cx: 200, cy: 200, rx: 72, ry: 11, fill: PAPER, stroke: INK, "stroke-width": 4 }, t);
    el("ellipse", { cx: 200, cy: 201, rx: 58, ry: 6.5, fill: INK }, t);

    t = tier(); // middle stem + bowl
    el("path", { d: "M195,150 L193,201 L207,201 L205,150 Z", fill: INK }, t);
    el("ellipse", { cx: 200, cy: 182, rx: 10, ry: 6, fill: INK }, t);
    el("path", { d: "M155,150 C165,172 185,178 200,178 C215,178 235,172 245,150 Z", fill: INK }, t);
    el("ellipse", { cx: 200, cy: 150, rx: 46, ry: 7, fill: PAPER, stroke: INK, "stroke-width": 3.5 }, t);
    el("ellipse", { cx: 200, cy: 151, rx: 36, ry: 3.8, fill: INK }, t);

    t = tier(); // top stem + bowl
    el("path", { d: "M196,115 L195,151 L205,151 L204,115 Z", fill: INK }, t);
    el("ellipse", { cx: 200, cy: 136, rx: 7, ry: 4.5, fill: INK }, t);
    el("path", { d: "M172,115 C178,130 190,134 200,134 C210,134 222,130 228,115 Z", fill: INK }, t);
    el("ellipse", { cx: 200, cy: 115, rx: 28, ry: 5, fill: PAPER, stroke: INK, "stroke-width": 3 }, t);
    el("ellipse", { cx: 200, cy: 116, rx: 20, ry: 2.4, fill: INK }, t);

    t = tier(); // finial
    el("path", { d: "M196,116 C190,108 192,98 197,94 L197,89 L203,89 L203,94 C208,98 210,108 204,116 Z", fill: INK }, t);
    el("circle", { cx: 200, cy: 85, r: 4.5, fill: INK }, t);

    return tiers;
  }

  const STREAMS = [
    "M200,80 C197,66 190,64 185,74", "M200,80 C203,66 210,64 215,74",       // spout
    "M174,116 C163,119 159,131 161,146", "M226,116 C237,119 241,131 239,146", // top -> middle
    "M157,152 C142,157 136,176 138,196", "M243,152 C258,157 264,176 262,196", // middle -> lower
    "M131,203 C108,210 101,250 103,288", "M269,203 C292,210 299,250 297,288", // lower -> basin
  ];
  const SPLASH = [
    "M93,292 l-7,-7 M103,291 l0,-10 M113,292 l7,-7",
    "M287,292 l-7,-7 M297,291 l0,-10 M307,292 l7,-7",
  ];

  async function start(svg) {
    if (!svg || svg.dataset.on) return;
    svg.dataset.on = "1";
    svg.replaceChildren();

    // boil: a turbulence displacement whose seed changes every frame
    const defs = el("defs", {}, svg);
    const f = el("filter", { id: "boil", x: "-10%", y: "-10%", width: "120%", height: "120%" }, defs);
    const turb = el("feTurbulence", { type: "fractalNoise", baseFrequency: "0.035", numOctaves: "2", seed: "1", result: "n" }, f);
    el("feDisplacementMap", { in: "SourceGraphic", in2: "n", scale: "3.2", xChannelSelector: "R", yChannelSelector: "G" }, f);
    const root = el("g", { filter: "url(#boil)" }, svg);

    let seed = 1;
    const boil = setInterval(() => turb.setAttribute("seed", (seed = (seed % 9) + 1)), 1000 / FPS);

    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 1. doodles: draw, hold, cut
    if (!calm) {
      for (const set of DOODLES) {
        const g = el("g", {}, root);
        const paths = set.map((d) => sketch(g, d));
        for (const p of paths) await drawIn([p], 2);
        await frames(4);
        g.remove();
        await frames(1);
      }
    }

    // 2. construction lines for the fountain
    const guides = el("g", {}, root);
    const gp = GUIDES.map((d) => sketch(guides, d, 1));
    if (calm) gp.forEach((p) => (p.style.visibility = "visible"));
    else await drawIn(gp, 4);
    await frames(2);

    // 3. ink it in, tier by tier
    const ink = el("g", {}, root);
    const tiers = inkTiers(ink);
    for (const t of tiers) { t.style.visibility = "visible"; if (!calm) await frames(2); }
    await frames(2);
    guides.remove();

    // 4. water
    const water = el("g", {}, root);
    const streams = STREAMS.map((d) =>
      el("path", { d, fill: "none", stroke: INK, "stroke-width": 2.6, "stroke-linecap": "round", style: "visibility:hidden" }, water));
    if (!calm) await drawIn(streams, 3);
    else streams.forEach((s) => (s.style.visibility = "visible"));
    const splash = SPLASH.map((d) => el("path", { d, fill: "none", stroke: INK, "stroke-width": 2, "stroke-linecap": "round" }, water));

    // dashed so it reads as falling droplets, stepped each frame
    streams.forEach((s) => (s.style.strokeDasharray = "5 6"));
    let off = 0, n = 0;
    if (calm) { clearInterval(boil); return; }
    setInterval(() => {
      off -= 4;
      streams.forEach((s) => (s.style.strokeDashoffset = off));
      splash.forEach((s, i) => (s.style.visibility = (n + i) % 2 ? "visible" : "hidden"));
      n++;
    }, 1000 / FPS);
  }

  return { start };
})();
