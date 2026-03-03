# Morphing Images + Large Logo Overlay

A click-triggered version with a **large, prominent logo** that changes colors with the images.

## Key Features

This version combines two effects:
1. **Background**: Morphing ASCII images (from click-snap)
2. **Overlay**: **Large** "ANAcycle" text rendered in ASCII (from text-morph)

Both layers:
- Use the **same character set** for seamless integration
- Characters rendered at the same font size/spacing for tight visual lock
- Logo **changes color** with each click, using the **dark color** from duotone set

## Key Differences from image+logo

**image+logo:**
- Small logo (fontSize: 200)
- Logo stays black and white (grayscale)

**This Version (image+logo-large):**
- **Large logo (fontSize: 500)** - much more prominent
- Logo uses **dark color from duotone set** (Blue, Pink, Violet, or Red depending on color pair)
- Logo changes color with each click to match the image's dark color

## Visual Effect

The ASCII characters from the logo and image "lock tightly" together because:
- Both use identical character sets (`.`, `○`, `+`, `⁘`, `∗`, `◎`)
- Characters are rendered at the same font size/spacing
- Text overlay positioned directly on top of image layer
- Logo uses the **dark color** from current duotone (matches the dark areas of the image)

## Configuration

Edit `main.js` to configure:

```javascript
// Character set (shared by both image and text)
const CHARACTER_SET = ['.', '○', '+', '⁘', '∗', '◎'];

// Text overlay
const TEXT_OVERLAY = 'ANAcycle';

// Font size for logo (in AsciiTextOverlay class)
const fontSize = 500; // MUCH LARGER than regular version

// Images to morph between
const THUMBNAIL_IMAGES = [
  '1_LifeOnMars.jpg',
  '2_Edible.png',
  // ...
];

// Duotone color pairs - logo uses the "dark" color
const COLOR_SET = [
  { name: 'Blue & Yellow', dark: {...}, light: {...} },      // Logo = Blue
  { name: 'Pink & Green', dark: {...}, light: {...} },       // Logo = Pink
  { name: 'Violet & Orange', dark: {...}, light: {...} },    // Logo = Violet
  { name: 'Red & Green', dark: {...}, light: {...} }         // Logo = Red
];
```

## Controls

- **Click anywhere**: Advance to next image
- **Spacebar**: Start/stop screen recording

## How It Works

### Image Morphing

1. **Click anywhere** on the screen
2. Advances to the next image in the sequence
3. Randomly selects a new duotone color pair
4. **Both image and logo change colors**:
   - Image: Uses both dark and light colors
   - Logo: Uses **only the dark color** from the pair
5. Prepares new **text overlay state** with new random character positions
6. **Both layers morph simultaneously**:
   - Image morphs smoothly to next image with new colors
   - Logo characters swap randomly throughout the transition with new color
7. Each character in the text has a random "swap timing" (0-1) that determines when it switches
8. Creates an organic, cascading animation effect as characters swap at different times
9. Cycles back to first image after reaching the last one

### Screen Recording

1. Press **SPACEBAR** to start recording
2. Browser will prompt you to select which screen/tab to record
3. A red **REC** indicator appears in the top-right corner
4. Click through images and interact with the page normally
5. Press **SPACEBAR** again to stop recording
6. Recording automatically downloads as `.webm` file
7. File named: `anacycle-recording-[timestamp].webm`

**Technical Details:**
- Uses `MediaRecorder API` with `getDisplayMedia()`
- Records at 60fps for smooth animation capture
- VP9 codec (fallback to VP8 if unavailable)
- 8 Mbps bitrate for high quality
- Captures all frames between start/stop

## Layer Structure

```
┌─────────────────────────────────┐
│  Text Layer (z-index: 20)       │  ← LARGE ANAcycle logo in ASCII
│  Transparent background          │     (uses dark color)
│  fontSize: 500                   │
└─────────────────────────────────┘
           ↓ overlay
┌─────────────────────────────────┐
│  Image Layer (z-index: 10)      │  ← Morphing images in ASCII
│  Full viewport                   │     (uses dark + light colors)
└─────────────────────────────────┘
```

## Implementation Details

### Shared Character Set
Both the image background and text overlay use `CHARACTER_SET` ensuring visual coherence.

### Color Rendering
- **Images**: Use `getDuotoneColor()` with changing color pairs (interpolates dark → light)
- **Logo**: Uses only `DUOTONE.dark` color (the dark color from the current pair)

### Font Size
- Logo uses **fontSize: 500** (2.5x larger than regular version)
- Creates a dominant, prominent text overlay

### Text Rendering & Morphing
The text morphing system works similar to the original text-morph:
- Text is rendered as a canvas-based bitmap, sampled at every 8th pixel
- Each character position gets a random character from the set (biased towards denser ones)
- Each character is assigned a random "swap timing" (0-1) for smooth transitions
- During animation, characters swap from old → new based on their individual timing
- All characters use the current `DUOTONE.dark` color
- Creates a cascading, organic animation effect as characters change at different moments

### Animation Loop
During each transition (1500ms):
- **Image layer**: Morphs from current → next image with interpolated duotone colors
- **Logo layer**: Characters individually swap based on their random timing, using the new dark color
- Both use cubic ease-in-out for smooth motion
- `requestAnimationFrame` ensures 60fps performance

### Click Handler
Each click triggers:
- `setRandomColorPair()` - selects new duotone colors for both layers
- `prepareTextTransition()` - generates new text state with random characters
- Logo switches to new dark color immediately
- Image and text morph simultaneously over `TRANSITION_DURATION`
