# Claude Code Sessions

## Session 1: Floating Gallery with Image Masking (2025-11-13)

### Task
Modify the float folder to use images from `_img` folder as fills for randomly generated SVG shapes instead of solid colors. Add centered hover text display that appears when hovering over any floating image.

### Files Modified
1. **main.js** - Added image selection and SVG pattern-based masking
2. **index.html** - Added centered hover text div
3. **style.css** - Added hover text styling, fixed syntax error

### Key Features Implemented

#### Image-Based SVG Masking
- Replaced solid color fills with actual images from `_img` folder
- Each floating shape randomly selects one of 16 available images
- SVG uses `<clipPath>` to define organic shapes as masks
- Images fill shapes using SVG `<pattern>` elements
- Random scale (1x-1.5x) and offset positioning for variety

#### Hover Text Display
- Fixed centered div that shows project information on hover
- Appears/disappears with smooth 0.3s opacity transition
- Non-interactive (`pointer-events: none`) so mouse passes through
- Placeholder text: "Project Title" and "Project Tags"
- Elegant typography with text shadow for readability

#### Random Floating Movement
- 50 floating items with random sizes (80-400px)
- Random initial positions and velocities
- Bounces at screen edges maintaining 40% minimum visibility
- Smooth continuous animation using `requestAnimationFrame`

### Code Architecture

#### Classes
- **`FloatingItem`**: Individual floating image shape
  - Generates random organic SVG shapes (4-8 points)
  - Creates SVG pattern with randomly selected image
  - Handles hover events to show/hide text
  - Updates position each frame with bounce physics
  - Maintains 40% on-screen visibility constraint

- **`FloatingGallery`**: Main controller
  - Creates and manages 50 floating items
  - Handles animation loop
  - Manages window resize events

#### SVG Masking Implementation

```javascript
// Pattern with image
<pattern id="${patternId}" x="0" y="0" width="1" height="1" patternContentUnits="objectBoundingBox">
  <image href="${this.imagePath}"
         x="${offsetX / this.width}"
         y="${offsetY / this.height}"
         width="${scale}"
         height="${scale}"
         preserveAspectRatio="xMidYMid slice" />
</pattern>

// Clip path with organic shape
<clipPath id="${clipId}">
  <path d="${path}" />
</clipPath>

// Rectangle filled with image, clipped to shape
<rect fill="url(#${patternId})" clip-path="url(#${clipId})" />
```

### Technical Details

#### Image Selection
- 16 images stored in constant array at top of file
- Random selection: `IMAGES[Math.floor(Math.random() * IMAGES.length)]`
- Relative path: `../_img/[filename]`

#### Shape Generation
- Random number of points (4-8) arranged on ellipse
- Radius variation (0.7-1.3x) for organic shapes
- Choice between smooth curves (quadratic) or angular (straight lines)
- Curve intensity threshold: 0.3

#### Hover Text CSS
```css
.hover-text {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 1000;
  transition: opacity 0.3s ease;
  text-shadow: 2px 2px 2px white;
}
```

#### Movement Physics
- Velocity: Random between -0.25 and +0.25 pixels per frame
- Bounds checking: Reverses velocity on collision
- Minimum 40% visibility: Max 60% can be offscreen on any edge

### Issues Fixed

**CSS Syntax Error (line 45)**
- Missing closing brace after `text-shadow` property
- Fixed by properly closing `.hover-text` rule block

**Original code:**
```css
.hover-text {
  text-shadow: 2px 2px 2px white;

.hover-text.hidden {
```

**Fixed code:**
```css
.hover-text {
  text-shadow: 2px 2px 2px white;
}

.hover-text.hidden {
```

### File Structure
```
float/
├── index.html           # Main page with hover text
├── main.js              # Image masking & hover logic
├── style.css            # Styling with hover text styles
└── claude-code-sessions.md  # This file
```

### Customization Options

#### Number of Floating Items (main.js:191)
```javascript
this.numItems = 50; // Change to desired number
```

#### Item Size Range (main.js:14-15)
```javascript
this.width = Math.random() * 320 + 80;  // 80-400px
this.height = Math.random() * 320 + 80; // 80-400px
```

#### Movement Speed (main.js:28-29)
```javascript
this.vx = (Math.random() - 0.5) * 0.5; // Change multiplier
this.vy = (Math.random() - 0.5) * 0.5; // Change multiplier
```

#### Hover Text Content (index.html:16-17)
```html
<h1 class="hover-title">Project Title</h1>
<p class="hover-subtitle">Project Tags</p>
```

#### Hover Text Styling (style.css:49-65)
```css
.hover-title {
  font-size: 3em;      /* Adjust size */
  font-weight: 300;    /* Adjust weight */
  letter-spacing: 0.05em;
}

.hover-subtitle {
  font-size: 1.2em;    /* Adjust size */
  text-transform: uppercase;
}
```

### Usage
1. Open `index.html` in a web browser
2. Watch shapes float randomly across the screen
3. Hover over any shape to see centered text appear
4. Shapes will bounce at edges while maintaining visibility

### Next Steps / Future Enhancements
- Add unique project data for each image
- Implement click handlers to navigate to project pages
- Add different movement patterns (circular, orbital, etc.)
- Create mobile touch interaction support
- Add loading states for images
- Implement parallax effects with multiple layers
- Add mouse attraction/repulsion physics
