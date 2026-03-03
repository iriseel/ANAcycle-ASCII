# Morphing Images - Click

A click-triggered version of the morphing ASCII images effect.

## Key Differences from scroll-snap

**Scroll-Snap Version:**
- Scroll position triggers transitions between images
- Uses CSS scroll-snap for section-based scrolling
- User scrolls through images

**This Version (click-snap):**
- **Click anywhere** to advance to the next image
- Cycles through all images in sequence
- No scrolling required - single page view
- Each click triggers a new random duotone color pair

## Configuration

Edit `main.js` to configure:

```javascript
// Transition duration (ms)
const TRANSITION_DURATION = 1500;

// Images to morph between
const THUMBNAIL_IMAGES = [
  '1_LifeOnMars.jpg',
  '2_Edible.png',
  // ...
];

// Duotone color pairs
const COLOR_SET = [
  { name: 'Blue & Yellow', dark: {...}, light: {...} },
  { name: 'Pink & Green', dark: {...}, light: {...} },
  // ...
];
```

## How It Works

1. Click anywhere on the screen
2. Advances to the next image in the sequence
3. Randomly selects a new duotone color pair
4. Transition animates smoothly over `TRANSITION_DURATION` milliseconds
5. Uses cubic ease-in-out for natural motion
6. Cycles back to first image after reaching the last one
