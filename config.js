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


  // the intro film. it opens with its sound on; a click switches it off and on.
  // on a narrow screen the smaller copy plays.
  video: "assets/intro.mp4",
  videoSmall: "assets/intro-sm.mp4",
  // the second its picture ends (21s + 21 frames at 24fps). the page moves on to the photos
  // there, and the rest of the soundtrack keeps playing under them.
  cut: 21.875,

  // photos that flicker inside the card after the reel. ~12-16 is a good number.
  // run new photos through tools/flicker.py so they match.
  flicker: Array.from({ length: 17 }, (_, i) => i + 1).map((n) => `assets/flicker/${String(n).padStart(2, "0")}.webp`),

  // the work section below the fountain.
  work: {
    // the two phrases either side of the stack
    words: ["What I", "keep returning to"],
    // one entry per card.
    // each can have: src (image), title (caption under it; "" for none), href (link), ratio (default 16 / 9).
    items: [
      { src: "assets/flicker/01.webp", title: "" },
      { src: "assets/flicker/02.webp", title: "" },
      { src: "assets/flicker/03.webp", title: "" },
      { src: "assets/flicker/04.webp", title: "" },
      { src: "assets/flicker/05.webp", title: "" },
      { src: "assets/flicker/06.webp", title: "" },
      { src: "assets/flicker/07.webp", title: "" },
      { src: "assets/flicker/08.webp", title: "" },
      { src: "assets/flicker/09.webp", title: "" },
      { src: "assets/flicker/10.webp", title: "" },
      { src: "assets/flicker/11.webp", title: "" },
      { src: "assets/flicker/12.webp", title: "" },
      { src: "assets/flicker/13.webp", title: "" },
      { src: "assets/flicker/14.webp", title: "" },
      { src: "assets/flicker/15.webp", title: "" },
      { src: "assets/flicker/16.webp", title: "" },
      { src: "assets/flicker/17.webp", title: "" },
    ],
  },
};
