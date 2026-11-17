# private garden

A small enclosure for things made with care.

Studio site for studio.nithinaruswamy.com. Plain HTML/CSS/JS, no build step.

## Run it

```
python3 -m http.server
```

Open http://localhost:8000. The intro only plays on your first visit, so add `?intro` to the URL to see it again.

## The sequence

1. **enter**: one click, so the browser allows sound
2. **reel**: `assets/intro.mp4` (the ~20s montage with music). Subtitles come from `config.js`, not the video.
3. **card**: the reel shrinks to a small card, and the last line rises
4. **flicker**: photos from `config.js` flash inside the card
5. **ruler lines**: guides draw across the screen, then the name sets onto them
6. **hero**: the name (hover a letter to swap its font), a stop-motion fountain on the left, and the line on the right

## Files

- `config.js`: email, video path, subtitle timings, flicker photos
- `main.js`: the intro sequence and the name
- `fountain.js`: doodles, then construction lines, then ink, then water, all at 8fps with boiling lines
- `style.css`: two colors, paper and ink, with grain over everything
