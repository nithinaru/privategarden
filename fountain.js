// the fountain as a hairline construction drawing: pale guide geometry first
// (axis, levels, circles, the triangle the tiers sit in), then the fountain
// itself in thin ink, then water. every line is one unit long (pathLength=1)
// and draws itself; starts are staggered so the lines overlap. ~3s in all.
window.Fountain = (() => {
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs = {}, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    parent && parent.appendChild(n);
    return n;
  };
  const E = (cx, cy, rx, ry) =>
    `M${cx - rx},${cy} A${rx},${ry} 0 1 0 ${cx + rx},${cy} A${rx},${ry} 0 1 0 ${cx - rx},${cy} Z`;

  // pale construction, drawn first
  const GUIDES = [
    "M200,40 L200,372",                                   // axis
    "M10,296 L390,296", "M10,200 L390,200", "M10,150 L390,150", "M10,115 L390,115",
    E(200, 208, 152, 152),                                // the circle the basin sits on
    E(200, 200, 72, 72),
    "M200,58 L20,326", "M200,58 L380,326",                // the triangle the tiers fit inside
  ];

  // the fountain, bottom to top. `mask` is a paper fill that hides whatever is behind.
  const PARTS = [
    { lines: [E(200, 296, 152, 34), E(200, 297, 138, 27), "M48,296 L48,320", "M352,296 L352,320", "M48,320 A152,34 0 0 0 352,320"] },
    { lines: ["M184,300 C190,272 192,240 194,204", "M216,300 C210,272 208,240 206,204"] },
    { mask: "M128,200 C140,232 175,240 200,240 C225,240 260,232 272,200 Z",
      lines: [E(200, 200, 72, 11), "M128,200 C140,232 175,240 200,240 C225,240 260,232 272,200"] },
    { lines: ["M195,150 L193,198", "M205,150 L207,198", E(200, 182, 10, 6)] },
    { mask: "M154,150 C165,172 185,178 200,178 C215,178 235,172 246,150 Z",
      lines: [E(200, 150, 46, 7), "M154,150 C165,172 185,178 200,178 C215,178 235,172 246,150"] },
    { lines: ["M196,115 L195,149", "M204,115 L205,149", E(200, 135, 7, 4.5)] },
    { mask: "M172,115 C178,130 190,134 200,134 C210,134 222,130 228,115 Z",
      lines: [E(200, 115, 28, 5), "M172,115 C178,130 190,134 200,134 C210,134 222,130 228,115"] },
    { lines: ["M196,116 C190,108 192,98 197,94 L197,89", "M204,116 C210,108 208,98 203,94 L203,89", E(200, 84.5, 4.5, 4.5)] },
  ];

  // water, top down: falling streams, then the still surface in each bowl
  const STREAMS = [
    "M200,80 C197,66 190,64 185,74", "M200,80 C203,66 210,64 215,74",
    "M174,116 C163,119 159,131 161,146", "M226,116 C237,119 241,131 239,146",
    "M157,152 C142,157 136,176 138,196", "M243,152 C258,157 264,176 262,196",
    "M131,203 C108,210 101,250 103,288", "M269,203 C292,210 299,250 297,288",
  ];
  const SURFACES = [E(200, 116, 20, 2.4), E(200, 151, 36, 4), E(200, 201, 60, 7), E(200, 298, 120, 20), E(200, 298, 96, 14)];

  function start(svg) {
    if (!svg || svg.dataset.on) return;
    svg.dataset.on = "1";
    svg.replaceChildren();
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let at = 0; // running start time, ms

    const draw = (parent, d, cls, dur, gap) => {
      const p = el("path", { d, class: cls, pathLength: 1 }, parent);
      if (calm) { p.style.strokeDashoffset = 0; return p; }
      p.style.transitionDuration = dur + "ms";
      setTimeout(() => (p.style.strokeDashoffset = 0), at);
      at += gap;
      return p;
    };

    const guides = el("g", {}, svg);
    GUIDES.forEach((d) => draw(guides, d, "f-guide", 1100, 60));

    at = 350;
    const stone = el("g", {}, svg);
    for (const part of PARTS) {
      const g = el("g", {}, stone);
      if (part.mask) el("path", { d: part.mask, class: "f-mask" }, g);
      part.lines.forEach((d) => draw(g, d, "f-line", 900, 55));
    }

    at += 250;
    const water = el("g", {}, svg);
    const streams = STREAMS.map((d) => draw(water, d, "f-water", 500, 70));
    SURFACES.forEach((d) => draw(water, d, "f-still", 700, 50));
    if (calm) return;
    // once drawn, the streams turn into falling dashes
    setTimeout(() => streams.forEach((s) => s.classList.add("run")), at + 600);
  }

  return { start };
})();
