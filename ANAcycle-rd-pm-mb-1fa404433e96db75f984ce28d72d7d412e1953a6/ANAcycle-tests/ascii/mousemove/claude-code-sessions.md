# Claude Code Sessions

## Session 1: ASCII Image Gallery Creation (2025-11-13)

### Task
Create a standalone ASCII image conversion site in the `ascii` folder that applies the ASCII conversion functionality from `ANAcycle-PHP/assets/js/main.js` and `general.js` to images in the ascii folder.

### Files Created
1. **index.html** - Gallery page with 16 image containers
2. **main.js** - ASCII conversion engine with mouse-interactive character swapping
3. **style.css** - Responsive dark-themed styling

### Key Features Implemented

#### ASCII Image Conversion
- Converts images to ASCII art using brightness-to-character mapping
- Uses 5 different character sets that randomly swap for animated effect
- Character sets include blocks, squares, dots, half circles, and line characters

#### Mouse-Driven Animation
- ASCII characters change based on mouse movement instead of time intervals
- Triggers character swap every 1px of mouse movement
- Calculates distance using Pythagorean theorem for accurate tracking
- 20% of characters swap to different sets with each trigger

#### Responsive Design
- Grid layout adapts to screen size (desktop/tablet/mobile)
- Character sizing adjusts for different devices
- Dark theme with monospace font for authentic ASCII display

### Code Architecture

#### Classes
- **`Ascii`**: Core conversion engine
  - Handles canvas rendering, pixel data extraction, brightness calculation
  - Manages multiple character sets and random swapping logic
  - Provides contrast/gamma adjustment options

- **`AsciiImage`**: Wrapper for individual image conversions
  - Manages DOM structure (wrapper, ASCII overlay, original image)
  - Calculates grid dimensions based on container width and character size
  - Provides device-specific aspect ratio and glyph compensation

#### Initialization Flow
1. Wait for DOM and window load events
2. Find `.ascii-unit` measurement element
3. Locate all `.target-img` images
4. Create `AsciiImage` instance for each loaded image
5. Set up global mouse movement listener

### Customization Options

#### Resolution Control (style.css)
Adjust ASCII detail level by changing font-size:

```css
.ascii-unit {
    font-size: 5px;  /* Smaller = higher resolution */
}

.ascii-art {
    font-size: 5px;  /* Must match .ascii-unit */
}
```

Resolution guide:
- `10px` = Default (~40-80 chars wide)
- `6px` = Higher resolution (~70-130 chars wide)
- `4px` = Very high resolution (~100-200 chars wide)
- `2px` = Ultra high resolution

#### Mouse Sensitivity (main.js:479)
Adjust swap trigger threshold:

```javascript
if (totalDistance >= 1) {  // Change this value
```

- `>= 0.5` = More sensitive (more frequent swaps)
- `>= 2` = Less sensitive
- `>= 5` = Much less sensitive

#### Character Sets (main.js:96-103)
Modify or add character sets:

```javascript
this.characterSets = [
    [" ", '„', '▂', '▄', '●', '█'].reverse(),
    [" ", '.', '▁', '▀', '◆', '■'].reverse(),
    // Add more sets here
];
```

#### Visual Options (main.js:433-441)
Configure conversion options:

```javascript
this.options = {
    fit: 'cover',        // 'cover' or 'contain'
    contrast: 100,       // 0-200
    invert: false,       // true/false
    glyphRatio: 0.45     // Character aspect compensation
};
```

### Technical Details

#### Character Measurement
- Hidden `.ascii-unit` element provides accurate character width measurement
- Used to calculate how many characters fit in container width
- Critical for proper grid sizing and aspect ratio

#### Image Processing
1. Load source image to off-screen canvas
2. Extract RGBA pixel data
3. Calculate brightness for each pixel (RGB average)
4. Map brightness to character index in character set
5. Apply contrast/gamma adjustments if specified

#### Performance Optimizations
- Uses `requestAnimationFrame` for layout calculations
- Reuses pixel data during character swaps (doesn't re-process image)
- Only swaps 20% of characters per trigger for smooth animation

### Issues Resolved

**Issue**: Changing `.ascii-art` font-size made entire image smaller instead of increasing resolution.

**Solution**: The `.ascii-unit` element controls resolution calculation. Both `.ascii-unit` and `.ascii-art` must have matching font-size values. The `.ascii-unit` determines how many characters fit, while `.ascii-art` renders them at the correct size.

### File Structure
```
ascii/
├── index.html           # Gallery page
├── main.js              # ASCII conversion engine
├── style.css            # Styling
├── claude-code-sessions.md  # This file
└── ../_img/             # Image files (1.JPG - 16.jpg)
```

### Usage
1. Open `index.html` in a web browser
2. Wait for images to load and convert to ASCII
3. Move mouse to trigger character swapping animation
4. Images dynamically update as you move the cursor

### Next Steps / Future Enhancements
- Add touch movement support for mobile devices
- Implement scroll-based triggers as alternative to mouse movement
- Add color support (colored ASCII characters)
- Create controls for real-time contrast/resolution adjustment
- Add ability to export ASCII art as text files
- Implement lazy loading optimization for large galleries
