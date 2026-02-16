# Morphing Images + Logo Overlay

A click-triggered version combining morphing ASCII images with an "ANAcycle" text overlay.

## Key Features

This version combines two effects:
1. **Background**: Morphing ASCII images (from click-snap)
2. **Overlay**: "ANAcycle" text rendered in ASCII (from text-morph)

Both layers:
- Use the **same character set** for seamless integration
- Characters rendered at the same font size/spacing for tight visual lock
- Logo stays **black and white** while images change duotone colors

## Visual Effect

The ASCII characters from the logo and image "lock tightly" together because:
- Both use identical character sets (`.`, `○`, `+`, `⁘`, `∗`, `◎`)
- Characters are rendered at the same font size/spacing
- Text overlay positioned directly on top of image layer
- Logo uses grayscale (black to white) while images use changing duotone colors

## Configuration

Edit `main.js` to configure:

```javascript
// Character set (shared by both image and text)
const CHARACTER_SET = ['.', '○', '+', '⁘', '∗', '◎'];

// Text overlay
const TEXT_OVERLAY = 'ANAcycle';

// Images to morph between
const THUMBNAIL_IMAGES = [
  '1_LifeOnMars.jpg',
  '2_Edible.png',
  // ...
];

// Duotone color pairs (applied to both layers)
const COLOR_SET = [
  { name: 'Blue & Yellow', dark: {...}, light: {...} },
  { name: 'Pink & Green', dark: {...}, light: {...} },
  { name: 'Violet & Orange', dark: {...}, light: {...} },
  { name: 'Red & Green', dark: {...}, light: {...} }
];
```

## How It Works

1. **Click anywhere** on the screen
2. Advances to the next image in the sequence
3. Randomly selects a new duotone color pair for the **image layer**
4. Prepares new **text overlay state** with new random character positions (stays black and white)
5. **Both layers morph simultaneously**:
   - Image morphs smoothly to next image with new colors
   - Text characters swap randomly throughout the transition
6. Each character in the text has a random "swap timing" (0-1) that determines when it switches
7. Creates an organic, cascading animation effect as characters swap at different times
8. Cycles back to first image after reaching the last one

## Layer Structure

```
┌─────────────────────────────────┐
│  Text Layer (z-index: 20)       │  ← ANAcycle logo in ASCII
│  Transparent background          │
└─────────────────────────────────┘
           ↓ overlay
┌─────────────────────────────────┐
│  Image Layer (z-index: 10)      │  ← Morphing images in ASCII
│  Full viewport                   │
└─────────────────────────────────┘
```

## Implementation Details

### Shared Character Set
Both the image background and text overlay use `CHARACTER_SET` ensuring visual coherence.

### Color Rendering
- **Images**: Use `getDuotoneColor()` with changing color pairs (Blue/Yellow, Pink/Green, Violet/Orange, Red/Green)
- **Text**: Uses random grayscale values (black to white) that remain constant

### Text Rendering & Morphing
The text morphing system works similar to the original text-morph:
- Text is rendered as a canvas-based bitmap, sampled at every 8th pixel
- Each character position gets a random character from the set and a random grayscale value
- Each character is assigned a random "swap timing" (0-1) for smooth transitions
- During animation, characters swap from old → new based on their individual timing
- Creates a cascading, organic animation effect as characters change at different moments

### Animation Loop
During each transition (1500ms):
- **Image layer**: Morphs from current → next image with interpolated duotone colors
- **Text layer**: Characters individually swap based on their random timing
- Both use cubic ease-in-out for smooth motion
- `requestAnimationFrame` ensures 60fps performance

### Click Handler
Each click triggers:
- `setRandomColorPair()` - selects new duotone colors for images
- `prepareTextTransition()` - generates new text state with random characters (stays black and white)
- Image and text morph simultaneously over `TRANSITION_DURATION`
