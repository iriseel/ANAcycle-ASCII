# Claude Code Sessions

## Session 1: Animated Typography Effects (2025-11-13)

### Task
Create 5 different organic, motion-heavy text animation effects for "ANA cycle" that animate the fill or stroke of the text.

### Files Created
1. **index.html** - Main page with 5 SVG/Canvas text effects
2. **style.css** - Styling and CSS animations for effects
3. **main.js** - JavaScript animations for complex effects

### Five Text Effects

#### Effect 1: Liquid Wave Fill
- **Technique**: SVG clip path with animated wave path
- **Animation**: Organic wave fills text from bottom with morphing path
- **Features**:
  - Multiple sine waves combined for natural motion
  - Gradient color fill (pink → purple → blue)
  - Text outline for contrast
  - Wave amplitude and frequency variation

**Implementation:**
```javascript
// Multiple sine waves combined
const wave1 = Math.sin((x / 100 + time) * frequency) * waveHeight;
const wave2 = Math.sin((x / 150 + time * 0.7) * 2) * (waveHeight * 0.5);
const wave3 = Math.sin((x / 80 + time * 1.3) * 4) * (waveHeight * 0.3);
```

#### Effect 2: Particle Explosion
- **Technique**: Canvas-based particle system
- **Animation**: Text composed of particles orbiting their home positions
- **Features**:
  - Particles sampled from text pixels
  - Circular orbital motion around original positions
  - Secondary wave motion for organic feel
  - Multi-color particles with glow effect
  - Trailing effect using alpha blending

**Particle Motion:**
```javascript
// Primary circular orbit
offsetX = Math.cos(angle) * radius;
offsetY = Math.sin(angle) * radius;

// Secondary wave motion
wave = Math.sin(phase) * 10;
```

#### Effect 3: Stroke Drawing with Organic Growth
- **Technique**: SVG stroke with dash-offset animation
- **Animation**: Text strokes draw and undraw continuously
- **Features**:
  - Gradient stroke (cyan → yellow → pink)
  - Stroke width pulsing
  - Glow/shadow pulsing effect
  - Smooth drawing animation using dasharray/dashoffset

**CSS Animation:**
```css
stroke-dasharray: 2000;
stroke-dashoffset: 2000 → 0 → -2000;
stroke-width: 3 → 8 → 3;
```

#### Effect 4: Flowing Gradient
- **Technique**: SVG with animated gradient stops and position
- **Animation**: Colors cycle through gradient stops, gradient rotates
- **Features**:
  - 4 gradient stops with independent color cycling
  - Gradient angle animation (organic rotation)
  - Glow pulse effect
  - Smooth color transitions

**Color Cycling Pattern:**
- Stop 1: Pink → Purple → Blue → Cyan → Pink
- Stop 2: Purple → Blue → Cyan → Pink → Purple
- Stop 3: Blue → Cyan → Pink → Purple → Blue
- Stop 4: Cyan → Pink → Purple → Blue → Cyan

#### Effect 5: Noise/Glitch Morph
- **Technique**: SVG filters with displacement map
- **Animation**: Turbulence-based distortion with glitch effects
- **Features**:
  - feTurbulence filter for organic noise
  - feDisplacementMap for warping effect
  - Animated noise frequency and scale
  - Subtle shake/glitch effect
  - Hue rotation for color shifting

**Filter Animation:**
```svg
<feTurbulence baseFrequency="0.01 → 0.03 → 0.01" />
<feDisplacementMap scale="5 → 25 → 5" />
```

### Technical Details

#### Wave Path Generation (Effect 1)
- Combines 3 sine waves at different frequencies and amplitudes
- Base Y position oscillates slowly for overall wave motion
- Path regenerated every frame using requestAnimationFrame
- SVG path updated via setAttribute

#### Particle System (Effect 2)
- Text rendered to temporary canvas to extract pixel data
- Pixels sampled at 4px intervals for performance
- ~1000-2000 particles depending on text size
- Each particle has:
  - Home position (original pixel location)
  - Orbital radius and speed
  - Phase offset for wave motion
  - Random color from palette

#### Stroke Animation (Effect 3)
- Uses SVG stroke properties:
  - `stroke-dasharray`: Total path length
  - `stroke-dashoffset`: Animated from 2000 → 0 → -2000
- Double animation: drawing + pulsing width
- Gradient applied to stroke instead of fill

#### Gradient Animation (Effect 4)
- Gradient position animated using trigonometry:
  ```javascript
  x1 = 50 + sin(time * 0.02) * 50
  y1 = 50 + cos(time * 0.03) * 50
  ```
- Each stop has independent 8s color cycle
- Creates flowing, organic color movement

#### Noise Filter (Effect 5)
- SVG filter chain:
  1. feTurbulence generates Perlin noise
  2. feDisplacementMap uses noise to distort text
- Animated parameters:
  - baseFrequency: Controls noise detail
  - scale: Controls distortion intensity
- Additional CSS shake for glitch effect

### Color Palette

**Primary Colors:**
- Pink: `#ff006e` / `rgb(255, 0, 110)`
- Purple: `#8338ec` / `rgb(131, 56, 236)`
- Blue: `#3a86ff` / `rgb(58, 134, 255)`
- Cyan: `#06ffa5` / `rgb(6, 255, 165)`
- Yellow: `#fffb00` / `rgb(255, 251, 0)`
- Cyan-Teal: `#00f5d4` / `rgb(0, 245, 212)`
- Bright Pink: `#f15bb5` / `rgb(241, 91, 181)`
- Bright Yellow: `#fee440` / `rgb(254, 228, 64)`

### Performance Considerations

**Effect 1 (Wave):**
- Low CPU: Simple path calculation
- 60fps easily maintained
- SVG rendering hardware accelerated

**Effect 2 (Particles):**
- Medium-High CPU: Canvas rendering of 1000+ particles
- May drop to 30fps on slower devices
- Uses alpha blending for trails (efficient)

**Effect 3 (Stroke):**
- Low CPU: Pure CSS animation
- Hardware accelerated
- Very efficient

**Effect 4 (Gradient):**
- Low CPU: CSS + minimal JS
- Hardware accelerated
- Smooth 60fps

**Effect 5 (Noise):**
- Medium CPU: SVG filter calculations
- Hardware accelerated on modern browsers
- Efficient for static noise patterns

### Customization Options

#### Animation Speed (main.js)
```javascript
// Wave animation
this.time += 0.02;  // Increase for faster waves

// Particle speed
this.speed = Math.random() * 0.02 + 0.01;  // Adjust range

// Gradient flow
this.time += 0.5;  // Increase for faster rotation
```

#### Text Content
Change text in HTML:
```html
<text>Your Text Here</text>
```

And in JS for particles:
```javascript
this.text = 'Your Text Here';
```

#### Colors
Modify gradients in HTML:
```html
<stop offset="0%" stop-color="#ff006e" />
```

Modify particle colors in main.js:
```javascript
const colors = [
  { r: 255, g: 0, b: 110 },  // Add/modify colors
];
```

#### Stroke Width (Effect 3)
```css
@keyframes draw-stroke {
  0% { stroke-width: 3; }     /* Start width */
  50% { stroke-width: 8; }    /* Peak width */
  100% { stroke-width: 3; }   /* End width */
}
```

#### Noise Intensity (Effect 5)
```svg
<feDisplacementMap scale="15">  <!-- Adjust scale -->
  <animate values="5;25;5" />   <!-- Adjust range -->
</feDisplacementMap>
```

### File Structure
```
animated-type/
├── index.html              # Main page with 5 effects
├── main.js                 # Wave, particle, gradient animations
├── style.css               # Styling and CSS animations
└── claude-code-sessions.md # This file
```

### Browser Compatibility

**SVG Animations:**
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (12+)

**Canvas Particles:**
- All modern browsers
- Performance varies by device

**SVG Filters:**
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (some filter lag possible)

### Usage
1. Open `index.html` in a web browser
2. Scroll to see all 5 effects
3. Each effect runs continuously in a loop
4. Effects are independent and can be used separately

### Responsive Design
- Font size scales down on mobile (120px → 60px)
- Canvas resizes to fit container
- All effects maintain aspect ratio
- Reduced spacing on mobile

### Next Steps / Future Enhancements
- Add mouse interaction (particles follow cursor)
- Implement click to switch between effects
- Add audio reactivity (animate to music)
- Create WebGL versions for better performance
- Add 3D text rotation effects
- Implement morphing between different words
- Add color picker for custom palettes
- Create recording/export functionality
- Add motion blur for faster animations
- Implement touch gesture controls on mobile

---

## Session 2: Circling Logo Animation (2025-11-13)

### Task
Create a new page `circling-logo.html` where individual letters of "ANAcycle" circle around the screen in oval motions with organic clustering and spreading effects. Letters should maintain proper sequence, move continuously without stopping, and transition between randomized oval paths.

### File Created
**circling-logo.html** - Standalone page with individual letter animations

### Animation Features

#### Letter Sequencing
- Letters always maintain order: A-N-A-c-y-c-l-e
- "A" leads the animation (at front of sequence)
- Each letter positioned relative to center of word
- Spacing varies to create clustering/spreading effect

#### Continuous Motion
- No hard pauses - letters never fully stop
- Speed varies smoothly using sine wave: **0.4x to 1.6x base speed**
- Creates natural ease-in/ease-out feel
- Seamless transitions between different oval paths

#### Dynamic Spacing
- Letter spacing automatically adjusts with speed:
  - **Fast** (1.6x speed) = 85px spacing (spread out)
  - **Slow** (0.4x speed) = 65px spacing (clustered)
- Smooth interpolation between spacing values (0.06 lerp speed)
- Creates organic breathing effect

#### Randomized Oval Paths
- Oval parameters randomized for each cycle:
  - **Center X**: 300-500px
  - **Center Y**: 200-400px
  - **Radius X**: 150-300px (horizontal)
  - **Radius Y**: 100-220px (vertical)
- Always continues from current position
- No jumps or position resets
- Generates new target when close to current target (distance < 10)

### Technical Implementation

#### Letter Positioning
```javascript
// Calculate offset from center of word
const centerIndex = (totalLetters - 1) / 2;
const offsetFromCenter = index - centerIndex;

// Convert spacing to angle offset (reversed for A to lead)
const angleSpacing = letterSpacing / oval.radiusX;
const letterAngleOffset = -offsetFromCenter * angleSpacing;

// Position on oval
const finalAngle = baseAngle + letterAngleOffset + wobble;
const x = oval.centerX + Math.cos(finalAngle) * oval.radiusX;
const y = oval.centerY + Math.sin(finalAngle) * oval.radiusY;
```

#### Speed Modulation
```javascript
// Continuous sine wave modulation
const cycleProgress = cycleTime / cycleDuration;
const speedMultiplier = 1.0 + Math.sin(cycleProgress * Math.PI * 2 - Math.PI / 2) * 0.6;
this.currentSpeed = this.baseSpeed * speedMultiplier;
```

#### Oval Transitions
```javascript
// Check distance to target
const distanceToTarget =
  Math.abs(currentOval.centerX - targetOval.centerX) +
  Math.abs(currentOval.centerY - targetOval.centerY) +
  Math.abs(currentOval.radiusX - targetOval.radiusX) +
  Math.abs(currentOval.radiusY - targetOval.radiusY);

// Generate new target when close
if (distanceToTarget < 10) {
  targetOval = generateRandomOval();
}

// Smooth interpolation (always from current position)
currentOval.centerX += (targetOval.centerX - currentOval.centerX) * 0.015;
```

### Visual Design

#### Grayscale Color Scheme
Letters use gradient shades of grey for depth:
- A: `#ffffff` (white)
- N: `#e0e0e0` (light grey)
- A: `#c0c0c0` (medium-light grey)
- c: `#a0a0a0` (medium grey)
- y: `#808080` (dark grey)
- c: `#a0a0a0` (medium grey)
- l: `#c0c0c0` (medium-light grey)
- e: `#e0e0e0` (light grey)

Creates subtle depth without being distracting.

#### Typography
- Font size: 120px (60px on mobile)
- Font weight: 900 (heavy)
- Text shadow: `0 0 20px rgba(255, 255, 255, 0.5)` for glow effect
- Black background (`#0a0a0a`)

### Animation Parameters

**Base Settings:**
- Base speed: `0.015` radians per frame
- Speed range: `0.006` to `0.024` (0.4x to 1.6x)
- Cycle duration: 480 frames (8 seconds at 60fps)
- Oval interpolation: `0.015` (smooth transitions)
- Spacing interpolation: `0.06` (gradual changes)

**Spacing Range:**
- Minimum: 65px (clustered)
- Maximum: 85px (spread out)
- Range: 20px variation

**Organic Wobble:**
- Each letter has random phase offset
- Wobble amplitude: `0.005` radians
- Wobble frequency: `0.05` per frame

### Iterations and Fixes

#### Issue 1: Letters Out of Order
**Problem:** Letters were randomly positioned around oval instead of maintaining sequence.

**Solution:** Changed from individual letter angles to offset-based positioning. All letters share a base angle, and each is positioned relative to the center of the word using calculated offsets.

#### Issue 2: Obvious Pauses
**Problem:** Animation had distinct moving and paused phases with hard stops.

**Solution:**
- Removed pause phase entirely
- Implemented continuous speed variation using sine wave
- Speed modulates between 0.4x and 1.6x (never stops)
- Letter spacing automatically adjusts with speed

#### Issue 3: Wrong Leading Letter
**Problem:** "e" was leading instead of "A".

**Solution:** Reversed the letter angle offset calculation by negating `offsetFromCenter` value. This makes the first letter (A) lead and last letter (e) trail.

#### Issue 4: Jumping to New Start Points
**Problem:** Animation was resetting positions at the start of each cycle.

**Solution:**
- Removed pre-generated "next oval" pattern
- Removed cycle-based position resets
- Implemented distance-based target detection
- Generates new random target only when close to current target
- Always interpolates from current position (no jumps)

#### Issue 5: Dramatic Clustering
**Problem:** Clustering motion was too dramatic (120px to 30px range).

**Solution:**
- Reduced spacing range to 85px-65px (only 20px variation)
- Slowed interpolation from 0.08 to 0.06
- Made transitions more gradual and subtle

### Code Structure

```javascript
class CirclingLetter {
  constructor(char, index, totalLetters, logo)
  update(baseAngle, letterSpacing, time, oval)
}

class CirclingLogo {
  constructor()
  generateRandomOval()
  animate()
}
```

**CirclingLetter:**
- Manages individual letter DOM element
- Calculates position based on shared state
- Applies organic wobble
- Updates transform

**CirclingLogo:**
- Manages shared animation state
- Controls speed modulation
- Handles oval transitions
- Updates all letters each frame

### Performance

- Very lightweight: only 9 DOM elements
- Simple transform updates (GPU accelerated)
- Minimal JavaScript calculations per frame
- Smooth 60fps on all modern devices
- No canvas or heavy SVG operations

### Responsive Design

```css
@media (max-width: 768px) {
  #logo-container {
    width: 100vw;
    height: 100vh;
  }

  .letter {
    font-size: 60px;  /* Half size */
  }
}
```

### Usage

1. Open `circling-logo.html` in a web browser
2. Letters immediately start circling in continuous motion
3. Watch as they smoothly transition between different oval paths
4. Speed and spacing vary organically throughout

### Customization Options

#### Animation Speed
```javascript
this.baseSpeed = 0.015;  // Base rotation speed

// Speed multiplier range
const speedMultiplier = 1.0 + Math.sin(...) * 0.6;  // 0.4x to 1.6x
```

#### Spacing Range
```javascript
// Map speed to spacing
this.targetLetterSpacing = 65 + (speedMultiplier - 0.4) * (20 / 1.2);
// Range: 65px (slow) to 85px (fast)
```

#### Oval Ranges
```javascript
generateRandomOval() {
  const centerX = 300 + Math.random() * 200;  // 300-500
  const centerY = 200 + Math.random() * 200;  // 200-400
  const radiusX = 150 + Math.random() * 150;  // 150-300
  const radiusY = 100 + Math.random() * 120;  // 100-220
}
```

#### Colors
```css
.letter:nth-child(1) { color: #ffffff; }  /* Modify each letter */
```

#### Cycle Duration
```javascript
this.cycleDuration = 480;  // Frames (8 seconds at 60fps)
```

### File Structure
```
animated-type/
├── index.html              # Main 5 effects page
├── circling-logo.html      # Circling letters page (new)
├── main.js                 # Effects animations
├── style.css               # Effects styling
└── claude-code-sessions.md # This file
```

### Browser Compatibility

**All modern browsers:**
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support

**Requirements:**
- CSS transforms
- JavaScript ES6
- requestAnimationFrame

### Future Enhancements

- Add mouse attraction/repulsion
- Implement click to change text
- Add color themes beyond grayscale
- Create 3D rotation on hover
- Add motion trails
- Implement touch gestures on mobile
- Add pause/play controls
- Create multiple simultaneous words
- Add letter rotation based on velocity
- Implement physics-based collisions

---

## Session 3: Scroll-Based Turbulent Displacement on Images (2025-11-14)

### Task
Apply the turbulent displacement effect (Effect 5) to images from `_img` folder and make the effect responsive to scroll instead of auto-animating. When static, text and images remain in default state. When scrolling, the distortion intensifies based on scroll velocity.

### Files Modified
1. **index.html** - Added image grid with 4 images below Effect 5
2. **style.css** - Added image grid styling and responsive design
3. **main.js** - Converted auto-animation to scroll-based effect

### Implementation

#### Image Grid Addition
Added 4 images in a responsive grid layout below the turbulent text effect:
- `_img/1.JPG`
- `_img/5.jpg`
- `_img/9.jpg`
- `_img/12.jpg`

Each image wrapped in SVG with the same turbulent filter applied.

#### HTML Changes (index.html:88-126)
```html
<!-- Images with Turbulent Displacement -->
<div class="image-grid">
  <div class="image-effect">
    <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
      <defs>
        <filter id="noise-filter-img">
          <feTurbulence class="img-turbulence" type="fractalNoise"
                        baseFrequency="0.01" numOctaves="3" result="noise" seed="1" />
          <feDisplacementMap class="img-displacement" in="SourceGraphic"
                             in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <image href="../_img/1.JPG" filter="url(#noise-filter-img)" />
    </svg>
  </div>
  <!-- 3 more images... -->
</div>
```

#### Removed Auto-Animation
Removed `<animate>` tags from both text and image filters:
- **Before**: Filter had embedded animate tags for continuous animation
- **After**: Static filter controlled dynamically via JavaScript

```svg
<!-- Text filter (index.html:70-71) -->
<feTurbulence id="text-turbulence" type="fractalNoise"
              baseFrequency="0.01" numOctaves="3" result="noise" seed="1" />
<feDisplacementMap id="text-displacement" in="SourceGraphic"
                   in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
```

#### Scroll-Based Animation (main.js:208-249)

**New ScrollTurbulence Class:**
```javascript
class ScrollTurbulence {
  constructor() {
    this.textTurbulence = document.getElementById('text-turbulence');
    this.textDisplacement = document.getElementById('text-displacement');
    this.imgTurbulence = document.querySelectorAll('.img-turbulence');
    this.imgDisplacement = document.querySelectorAll('.img-displacement');

    this.lastScrollY = window.scrollY;
    this.scrollVelocity = 0;

    window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
  }

  handleScroll() {
    const currentScrollY = window.scrollY;
    const delta = Math.abs(currentScrollY - this.lastScrollY);

    // Calculate scroll velocity (normalized 0-1)
    this.scrollVelocity = Math.min(delta / 10, 1);

    // Map velocity to filter parameters
    const baseFrequency = 0.01 + (this.scrollVelocity * 0.02); // 0.01 to 0.03
    const scale = 5 + (this.scrollVelocity * 20);              // 5 to 25

    // Update all filters
    this.textTurbulence.setAttribute('baseFrequency', baseFrequency);
    this.textDisplacement.setAttribute('scale', scale);

    this.imgTurbulence.forEach(turbulence => {
      turbulence.setAttribute('baseFrequency', baseFrequency);
    });

    this.imgDisplacement.forEach(displacement => {
      displacement.setAttribute('scale', scale);
    });

    this.lastScrollY = currentScrollY;
  }
}
```

#### CSS Styling (style.css:197-218)

**Image Grid:**
```css
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  width: 100%;
  max-width: 1200px;
  padding: 20px;
  margin-top: 50px;
}

.image-effect {
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: 8px;
  background: #1a1a1a;
}
```

**Responsive Design (style.css:235-243):**
```css
@media (max-width: 768px) {
  .image-grid {
    grid-template-columns: 1fr;
    gap: 20px;
    margin-top: 30px;
  }

  .image-effect {
    height: 300px;
  }
}
```

### Technical Details

#### Scroll Velocity Calculation
- Measures absolute difference between current and last scroll position
- Normalizes to 0-1 range (delta / 10, capped at 1)
- Fast scrolling = high velocity = intense distortion
- No scrolling = zero velocity = no distortion

#### Filter Parameter Mapping
**baseFrequency:**
- Static: `0.01` (minimal noise detail)
- Max scroll: `0.03` (high noise detail)
- Controls granularity of turbulence pattern

**scale:**
- Static: `5` (subtle displacement)
- Max scroll: `25` (dramatic displacement)
- Controls intensity of image warping

#### Performance Optimization
- Uses `passive: true` on scroll listener (improves scroll performance)
- Direct attribute manipulation (faster than DOM queries)
- Queries filter elements once in constructor
- Updates via cached references

### Visual Behavior

**Static State (No Scrolling):**
- Text: Minimal distortion (barely noticeable)
- Images: Subtle warping effect
- baseFrequency: 0.01
- scale: 5

**Active Scrolling:**
- Text: Distorts and warps based on scroll speed
- Images: Synchronize with text effect
- Fast scroll: Maximum distortion
- Slow scroll: Proportional light distortion

**Smooth Transitions:**
- Parameters update every scroll event
- Creates fluid distortion that follows scroll behavior
- No sudden jumps or glitches

### Image Grid Layout

**Desktop (>768px):**
- Auto-fit columns with 300px minimum width
- Typically displays 2-4 images per row
- 30px gap between images
- 400px image height

**Mobile (≤768px):**
- Single column layout
- 20px gap between images
- 300px image height
- Full width images

### Browser Compatibility

**SVG Filters:**
- Chrome/Edge: Full support, smooth performance
- Firefox: Full support, good performance
- Safari: Full support (may have slight filter lag on older iOS)

**Scroll Events:**
- All modern browsers
- Passive listeners supported (better performance)

### File Structure
```
animated-type/
├── index.html              # 5 effects + image grid
├── circling-logo.html      # Circling letters page
├── main.js                 # All animations + scroll turbulence
├── style.css               # All styling + image grid
└── claude-code-sessions.md # This file
```

### Customization Options

#### Scroll Sensitivity
```javascript
// Adjust velocity calculation
this.scrollVelocity = Math.min(delta / 10, 1);
// Decrease divisor (e.g., /5) for more sensitive
// Increase divisor (e.g., /20) for less sensitive
```

#### Distortion Range
```javascript
// Adjust parameter ranges
const baseFrequency = 0.01 + (this.scrollVelocity * 0.02); // Intensity
const scale = 5 + (this.scrollVelocity * 20);              // Amount

// For subtler effect:
const baseFrequency = 0.01 + (this.scrollVelocity * 0.01);
const scale = 3 + (this.scrollVelocity * 10);

// For dramatic effect:
const baseFrequency = 0.01 + (this.scrollVelocity * 0.05);
const scale = 10 + (this.scrollVelocity * 40);
```

#### Image Selection
```html
<!-- Change image sources -->
<image href="../_img/YOUR_IMAGE.jpg" />
```

#### Grid Layout
```css
/* Adjust minimum column width */
.image-grid {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

/* Fixed columns instead of auto-fit */
.image-grid {
  grid-template-columns: repeat(3, 1fr); /* Always 3 columns */
}
```

#### Image Dimensions
```css
.image-effect {
  height: 400px; /* Adjust height */
}
```

### Usage

1. Open `index.html` in a web browser
2. Scroll down to see all effects
3. When reaching Effect 5 and images, scroll to see distortion
4. Faster scrolling = more intense warping effect
5. Stop scrolling to see effect return to static state

### Performance Notes

**Scroll Event Handling:**
- Uses passive listener (doesn't block scrolling)
- Minimal calculations per scroll event
- No requestAnimationFrame needed (direct attribute updates)

**Filter Performance:**
- SVG filters are GPU-accelerated on modern browsers
- 4 images with same filter is efficient (filter defined once)
- Static filters use less resources than animated ones

**Responsive Performance:**
- Mobile: Fewer/smaller images = better performance
- Desktop: Multiple images handle well with modern GPUs

### Future Enhancements

- Add easing to filter parameter changes (smooth decay after scroll stops)
- Implement separate velocity tracking per image (parallax-style effect)
- Add mouse movement as additional distortion input
- Create different turbulence patterns for each image
- Add intensity control slider for user preference
- Implement directional distortion (up/down scroll = different effects)
- Add optional auto-animation mode toggle
- Create color shift effect tied to scroll
- Add blur effect that increases with distortion
- Implement touch velocity tracking on mobile
