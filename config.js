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
    words: ["What I", "keep returning to"],
    // one entry per card. an empty list shows 28 skeleton placeholders.
    // each can have: src (image), title (caption under it; "" for none), href (link), ratio (default 16 / 9).
    // an entry with no src stays a skeleton, so you can reserve a slot: {}
    items: [
      { src: "assets/flicker/01.jpg", title: "" },
      { src: "assets/flicker/02.jpg", title: "" },
      { src: "assets/flicker/03.jpg", title: "" },
      { src: "assets/flicker/04.jpg", title: "Wright Flyer, first flight, 1903" },
      { src: "assets/flicker/05.jpg", title: "Starship, liftoff" },
      { src: "assets/flicker/06.jpg", title: "" },
      { src: "assets/flicker/07.jpg", title: "" },
      { src: "assets/flicker/08.jpg", title: "" },
      { src: "assets/flicker/09.jpg", title: "" },
      { src: "assets/flicker/10.jpg", title: "Starship, 33 engines" },
      { src: "assets/flicker/11.jpg", title: "Painting the Golden Gate Bridge" },
      { src: "assets/flicker/12.jpg", title: "" },
      { src: "assets/flicker/13.jpg", title: "Half Dome, Yosemite" },
      { src: "assets/flicker/14.jpg", title: "Daniel in the Lions\u2019 Den, Briton Rivi\u00e8re, 1872" },
      { src: "assets/flicker/15.jpg", title: "Monet\u2019s garden, Giverny" },
      { src: "assets/flicker/16.jpg", title: "Ye, live" },
      { src: "assets/flicker/17.jpg", title: "" },
    ],
  },
};
