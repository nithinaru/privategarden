// everything you'd want to swap lives here
window.SITE = {
  email: "hello@nithinaruswamy.com",

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
};
