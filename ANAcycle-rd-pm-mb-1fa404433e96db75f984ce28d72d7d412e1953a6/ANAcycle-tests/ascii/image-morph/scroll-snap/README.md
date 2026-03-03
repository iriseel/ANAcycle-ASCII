# Morphing Images - Scroll Snap

A scroll-triggered version of the morphing ASCII images effect.

## Key Differences from morphing-images

**Original (morphing-images):**
- Scroll position is **directly mapped** to transition progress
- Moving the scroll 1 pixel = 1 unit of transition progress
- Pixel-perfect scroll-linked animation

**This Version (morphing-images-scroll-snap):**
- Scroll **triggers** transitions instead of controlling them
- Once a scroll threshold is crossed, the transition plays out on its own timing
- Uses CSS scroll-snap for section-based scrolling
- Transitions animate independently using requestAnimationFrame

## Configuration

Edit `main.js` to configure:

```javascript
// Transition duration (ms)
const TRANSITION_DURATION = 1500;

// Images to morph between
const THUMBNAIL_IMAGES = [
  'AlgaeSipsandJavaBrews.jpg',
  'ClimateHouse.jpg',
  // ...
];
```

## How It Works

1. Page has scroll-snap sections (one per image)
2. When user scrolls to a new section, a transition is triggered
3. Transition animates smoothly over `TRANSITION_DURATION` milliseconds
4. Uses cubic ease-in-out for natural motion
5. Only animates during transitions (performance-optimized)
