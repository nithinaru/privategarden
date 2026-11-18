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
  // where the name in "A Collective by Nithin Aruswamy" goes
  by: "https://cosmos.so/nithinaru",

  // bottom-right link
  x: "nithinaru",

  // the small caption at the foot of the screen while the photos run. one string per line.
  caption: ["A collective by Nithin Aruswamy · Est. 2026"],


  // the intro film. it opens with its sound on; a click switches it off and on.
  // three copies of each, because the film has grain all over it: av1 keeps the grain and
  // stays small, hevc is for safari, h264 is for anything older. the page plays the first
  // one the browser can. on a narrow screen the smaller set plays.
  // (raise the ?v= when the film is replaced, so browsers fetch the new one.)
  video: { av1: "assets/intro-av1.mp4?v=3", hevc: "assets/intro-hevc.mp4?v=3", h264: "assets/intro.mp4?v=3" },
  videoSmall: { av1: "assets/intro-sm-av1.mp4?v=3", hevc: "assets/intro-sm-hevc.mp4?v=3", h264: "assets/intro-sm.mp4?v=3" },
  // the second its picture ends (25s). the page moves on to the photos
  // there, and the rest of the soundtrack keeps playing under them.
  cut: 25,

  // (the ?v= on every photo below: browsers keep photos for a day, so when a photo is
  // swapped or the order changes under the same file names, raise the number on all of
  // them, here and in work.items, or visitors see a mix of old and new.)
  // photos that flicker inside the card after the reel. ~12-16 is a good number.
  // run new photos through tools/flicker.py so they match.
  flicker: Array.from({ length: 15 }, (_, i) => i + 1).map((n) => `assets/flicker/${String(n).padStart(2, "0")}.webp?v=2`),

  // the work section below the fountain.
  work: {
    // the two phrases either side of the stack
    words: ["What I", "keep returning to"],
    // one entry per card. 01-15 are the same photos as the flicker, cut in colour; the
    // rest are shown only here, each at its own shape.
    // each can have: src (image), title (caption under it; "" for none), href (link),
    // ratio (width / height of the picture; default 16 / 9).
    items: [
      { src: "assets/work/01.webp?v=2", title: "" },
      { src: "assets/work/16.webp?v=1", title: "", ratio: 538 / 717 },
      { src: "assets/work/17.webp?v=1", title: "", ratio: 556 / 693 },
      { src: "assets/work/02.webp?v=2", title: "" },
      { src: "assets/work/18.webp?v=1", title: "", ratio: 547 / 706 },
      { src: "assets/work/19.webp?v=1", title: "", ratio: 565 / 683 },
      { src: "assets/work/03.webp?v=2", title: "" },
      { src: "assets/work/20.webp?v=1", title: "", ratio: 533 / 723 },
      { src: "assets/work/21.webp?v=1", title: "", ratio: 569 / 678 },
      { src: "assets/work/04.webp?v=2", title: "" },
      { src: "assets/work/22.webp?v=1", title: "", ratio: 621 / 621 },
      { src: "assets/work/23.webp?v=1", title: "", ratio: 600 / 397 },
      { src: "assets/work/05.webp?v=2", title: "" },
      { src: "assets/work/24.webp?v=1", title: "", ratio: 621 / 621 },
      { src: "assets/work/25.webp?v=1", title: "", ratio: 612 / 608 },
      { src: "assets/work/06.webp?v=2", title: "" },
      { src: "assets/work/26.webp?v=1", title: "", ratio: 420 / 630 },
      { src: "assets/work/07.webp?v=2", title: "" },
      { src: "assets/work/27.webp?v=1", title: "", ratio: 717 / 538 },
      { src: "assets/work/08.webp?v=2", title: "" },
      { src: "assets/work/28.webp?v=1", title: "", ratio: 555 / 694 },
      { src: "assets/work/09.webp?v=2", title: "" },
      { src: "assets/work/29.webp?v=1", title: "", ratio: 573 / 673 },
      { src: "assets/work/10.webp?v=2", title: "" },
      { src: "assets/work/30.webp?v=1", title: "", ratio: 466 / 828 },
      { src: "assets/work/11.webp?v=2", title: "" },
      { src: "assets/work/31.webp?v=1", title: "", ratio: 555 / 694 },
      { src: "assets/work/12.webp?v=2", title: "" },
      { src: "assets/work/32.webp?v=1", title: "", ratio: 482 / 801 },
      { src: "assets/work/13.webp?v=2", title: "" },
      { src: "assets/work/33.webp?v=1", title: "", ratio: 538 / 717 },
      { src: "assets/work/14.webp?v=2", title: "" },
      { src: "assets/work/34.webp?v=1", title: "", ratio: 621 / 621 },
      { src: "assets/work/15.webp?v=2", title: "" },
      { src: "assets/work/35.webp?v=1", title: "", ratio: 555 / 694 },
    ],
  },
};
