// everything you'd want to swap lives here
window.SITE = {
  // the big title on the main screen
  title: "Private Garden",

  // the quote beside the fountain
  quote: { text: "Good design is as little design as possible.", by: "Dieter Rams" },

  // the three lines on the right of the fountain. **double stars** make a word bold,
  // [square brackets](https://a.link) make a bold link. both get the colour sweep on hover.
  bio: [
    "[Global traveler](https://travel.nithinaruswamy.com) turned designer.",
    "Architected ad campaign for **CapCut Design Studio**.",
    "Tending **Private Garden**.",
  ],
  // where the About button goes
  about: "https://nithinaruswamy.com",

  // bottom-right link
  x: "nithinaru",

  // the small caption at the foot of the screen while the photos run. one string per line.
  caption: ["A collective by Nithin Aruswamy · Est. 2026"],


  // the 20s montage (music baked in). if this file is missing, a placeholder reel plays instead.
  video: "assets/intro.mp4",

  // subtitles, in seconds of the video. rendered live in the page, so don't burn them into the mp4.
  cues: [
    { start: 12.0, end: 16.0, text: "Less, but better." },
    { start: 16.2, end: 99,   text: "The world can be saved through design." },
  ],

  // photos that flicker inside the card after the reel. ~12-16 is a good number.
  // e.g. "assets/flicker/01.jpg". empty = generated placeholder frames.
  // run new photos through tools/flicker.py so they match.
  flicker: Array.from({ length: 17 }, (_, i) => i + 1).map((n) => `assets/flicker/${String(n).padStart(2, "0")}.jpg`),

  // the work section below the fountain.
  work: {
    // the two phrases either side of the stack
    words: ["Things made", "with care"],
    // one entry per card. empty = 28 skeleton placeholders.
    // e.g. { src: "assets/work/poster.jpg", title: "Poster · 2026", href: "https://…", ratio: 16 / 9 }
    items: [],
  },
};
