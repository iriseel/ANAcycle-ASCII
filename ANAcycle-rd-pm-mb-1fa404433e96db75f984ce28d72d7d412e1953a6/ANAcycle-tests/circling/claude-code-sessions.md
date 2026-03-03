# Claude Code Sessions

## Session 1: Circling Gallery with Oval Movement (2025-11-13)

### Task
Create a new "circling" folder based on the float folder, where instead of random floating movement, images move along 4 different oval paths. Images are randomly split into groups of 4, with each group following one oval. All images maintain 40% minimum on-screen visibility.

### Files Created
1. **index.html** - Same structure as float, updated title
2. **style.css** - Copied from float (identical)
3. **main.js** - New oval movement logic replacing random floating

### Key Features Implemented

#### Oval Path Movement
- 4 distinct oval configurations with different properties:
  - **Oval 1**: Large center oval (slow rotation)
  - **Oval 2**: Medium oval, offset top-right (medium-slow)
  - **Oval 3**: Small oval, offset bottom-left (medium-fast)
  - **Oval 4**: Very large oval, slightly off-center (very slow)
- Each oval has unique center point, radii (X/Y), and rotation speed
- Items follow elliptical paths using trigonometric calculations

#### Random Group Assignment
- All 16 images shuffled on page load
- Split into 4 groups of 4 images each
- Each group assigned to one oval path
- Different image distribution on every refresh

#### Synchronized Movement
- Items in same group follow the same oval path
- Different starting positions (random angles) on the oval
- Continuous smooth rotation using `requestAnimationFrame`
- Speed varies by oval (0.002 to 0.007 radians per frame)

### Code Architecture

#### Helper Functions
- **`shuffleArray()`**: Fisher-Yates shuffle for random image distribution

#### Classes
- **`CirclingItem`**: Individual circling image shape
  - Stores reference to oval configuration
  - Calculates position on oval using angle and trigonometry
  - Updates angle each frame based on oval's speed
  - Maintains 40% visibility constraint
  - Same SVG masking and hover behavior as float

- **`CirclingGallery`**: Main controller
  - Generates 4 oval configurations
  - Shuffles images and assigns to groups
  - Creates 16 items (4 per oval)
  - Handles animation loop and window resize

#### Oval Configurations

```javascript
[
  {
    // Oval 1: Large center oval
    centerX: screenCenterX,
    centerY: screenCenterY,
    radiusX: screenMin * 0.35,
    radiusY: screenMin * 0.25,
    speed: 0.003  // Slow
  },
  {
    // Oval 2: Medium, offset top-right
    centerX: screenCenterX + screenWidth * 0.15,
    centerY: screenCenterY - screenHeight * 0.1,
    radiusX: screenMin * 0.28,
    radiusY: screenMin * 0.2,
    speed: 0.005  // Medium-slow
  },
  {
    // Oval 3: Small, offset bottom-left
    centerX: screenCenterX - screenWidth * 0.2,
    centerY: screenCenterY + screenHeight * 0.15,
    radiusX: screenMin * 0.22,
    radiusY: screenMin * 0.15,
    speed: 0.007  // Medium-fast
  },
  {
    // Oval 4: Very large, slightly off-center
    centerX: screenCenterX - screenWidth * 0.05,
    centerY: screenCenterY + screenHeight * 0.05,
    radiusX: screenMin * 0.42,
    radiusY: screenMin * 0.32,
    speed: 0.002  // Very slow
  }
]
```

### Technical Details

#### Oval Position Calculation (main.js:56-71)
```javascript
updatePosition() {
  // Calculate raw position on oval using parametric equations
  const rawX = centerX + Math.cos(angle) * radiusX;
  const rawY = centerY + Math.sin(angle) * radiusY;

  // Constrain to 40% visibility
  this.x = Math.max(
    -(this.width * 0.6),
    Math.min(rawX, window.innerWidth - minVisibleWidth)
  );

  this.y = Math.max(
    -(this.height * 0.6),
    Math.min(rawY, window.innerHeight - minVisibleHeight)
  );
}
```

#### Movement Update (main.js:166-174)
```javascript
update() {
  // Increment angle based on oval's speed
  this.angle += this.ovalConfig.speed;

  // Recalculate position
  this.updatePosition();

  // Apply CSS transform
  this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
}
```

#### Image Shuffling and Grouping (main.js:253-267)
```javascript
// Shuffle all 16 images
const shuffledImages = shuffleArray(IMAGES);

// Split into 4 groups
const groups = [
  shuffledImages.slice(0, 4),   // Group 0
  shuffledImages.slice(4, 8),   // Group 1
  shuffledImages.slice(8, 12),  // Group 2
  shuffledImages.slice(12, 16)  // Group 3
];

// Create items for each group with corresponding oval
groups.forEach((group, groupIndex) => {
  group.forEach(imagePath => {
    new CirclingItem(index, imagePath, ovalConfigs[groupIndex]);
  });
});
```

#### Window Resize Handling (main.js:280-292)
- Regenerates oval configurations for new screen dimensions
- Updates all items' oval references
- Maintains group assignments (items stay on same oval)

### Differences from Float Folder

| Feature | Float | Circling |
|---------|-------|----------|
| Movement | Random linear with bouncing | Elliptical orbital paths |
| Velocity | Random constant velocity | Angle-based (trigonometric) |
| Direction | Changes only at edges | Continuous circular |
| Speed | Uniform per item | Varies by oval (4 speeds) |
| Grouping | None | 4 groups of 4 images |
| Pattern | Chaotic/organic | Organized/choreographed |

### Mathematical Foundation

#### Parametric Oval Equation
```
x(t) = centerX + radiusX * cos(angle)
y(t) = centerY + radiusY * sin(angle)
```

Where:
- `angle` = current position on oval (0 to 2π radians)
- `centerX, centerY` = oval center coordinates
- `radiusX` = horizontal radius (half-width)
- `radiusY` = vertical radius (half-height)

#### Speed as Angular Velocity
- Speed represents radians per frame
- One full rotation = 2π radians
- Frames for full circle = `2π / speed`

Examples:
- Speed 0.002: ~3142 frames (~52 seconds at 60fps)
- Speed 0.007: ~897 frames (~15 seconds at 60fps)

### File Structure
```
circling/
├── index.html           # Main page (same as float)
├── main.js              # Oval movement logic
├── style.css            # Styling (same as float)
└── claude-code-sessions.md  # This file
```

### Customization Options

#### Number of Ovals (main.js:213-250)
Add or remove oval configurations in `generateOvalConfigs()`:
```javascript
{
  centerX: screenCenterX + offsetX,
  centerY: screenCenterY + offsetY,
  radiusX: sizeX,
  radiusY: sizeY,
  speed: 0.004
}
```

#### Oval Speeds (main.js:225, 235, 245, 250)
```javascript
speed: 0.003  // Change to adjust rotation speed
```
- Larger = faster rotation
- Smaller = slower rotation
- Negative = reverse direction

#### Oval Sizes (main.js:223-224, etc.)
```javascript
radiusX: Math.min(window.innerWidth, window.innerHeight) * 0.35,
radiusY: Math.min(window.innerWidth, window.innerHeight) * 0.25,
```
- Multipliers control size relative to screen
- RadiusX ≠ radiusY creates ellipse
- RadiusX = radiusY creates circle

#### Items Per Group
Change slice ranges in `init()` method:
```javascript
shuffledImages.slice(0, 4),   // First 4 images
shuffledImages.slice(4, 8),   // Next 4 images
// etc.
```

### Usage
1. Open `index.html` in a web browser
2. Watch images orbit along their assigned oval paths
3. Hover over any shape to see centered text appear
4. Refresh page to see different random image groupings
5. Each oval rotates at its own speed

### Performance Considerations
- All 16 items update every frame (60fps target)
- Trigonometric calculations (sin/cos) run 16x per frame
- Relatively lightweight compared to complex physics
- Should run smoothly on most modern devices

### Next Steps / Future Enhancements
- Add controls to adjust oval speeds in real-time
- Allow manual oval path drawing/editing
- Implement orbital direction changes (clockwise/counter-clockwise)
- Add "Follow" mode where ovals track mouse position
- Create synchronized animation triggers (all start at top)
- Add orbital eccentricity variations for more complex paths
- Implement Lissajous curves for figure-8 patterns
- Add pause/play controls for individual ovals
- Create preset configurations (tight cluster, wide spread, etc.)
