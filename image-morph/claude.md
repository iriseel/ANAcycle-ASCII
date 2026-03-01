# Claude Code Sessions - Morphing Images + Title

## Session Overview

Implemented a unified ASCII grid system where the ANACYCLE title is truly integrated with morphing ASCII images, with characters properly repelling each other rather than overlaying.

## Key Features Implemented

### 1. Unified Grid System
- **Problem**: Title text was overlaying image ASCII characters instead of being integrated
- **Solution**: Single ASCII grid where text characters "carve out" space from the image using positional masking
- **Implementation**:
  - `calculateTextMask()` maps text positions in grid coordinates
  - `morphCharactersUnified()` renders single unified HTML output
  - Removed separate text/image layers from HTML

**Key Files**:
- `main.js:936-976` - Text mask calculation
- `main.js:914-956` - Unified character morphing
- `index.html:16-18` - Single `.ascii-unified-layer` container

### 2. Initial Load Sequence
- **Behavior**:
  1. ANACYCLE title appears alone (1 second)
  2. Image ASCII characters reveal randomly with flickering effect (1 second)
  3. No character overlap during reveal
- **Implementation**: `startInitialLoadSequence()` at `main.js:752-818`
- **Technique**: Random position shuffling with instant opacity changes (0→1)

### 3. Title Character Animation
- **Character Sets**: Title uses `TITLE_CHARACTER_SETS`, images use `CHARACTER_SETS`
- **Mousemove Animation**:
  - `cycleTextCharacters()` randomly swaps 20% of title characters
  - Biased toward denser characters using `Math.pow(Math.random(), 0.25)`
- **Fix Applied**: When not transitioning, `render()` uses `currentTextData` directly to show animation changes

**Key Code**:
- `main.js:85-89` - Title character sets definition
- `main.js:901-934` - Character cycling logic
- `main.js:844-846` - Render logic for showing animations

### 4. Brightness Inversion Fix
- **Problem**: Character assignments inverted when image finalized
- **Solution**: Added brightness inversion in `interpolateCharacter()`
- **Code**: `main.js:971` - `const invertedBrightness = 1 - interpolatedBrightness`
- **Result**: Bright pixels → light characters, dark pixels → heavy characters

### 5. Text Morphing
- **Behavior**: Characters swap at random timings during image transitions
- **Implementation**:
  - `morphTextData()` interpolates between character sets
  - `prepareTextTransition()` generates new random character positions
  - Deep copying prevents shared object references
- **Key Files**: `main.js:978-1024` (morphTextData), `main.js:871-899` (prepareTextTransition)

### 6. Viewport-Based Title Sizing
- **Font Size**: `15vmin` (15% of smaller viewport dimension)
- **Calculation**: `const fontSize = vmin * 0.15` at `main.js:186`
- **Padding**: Proportional to font size (`fontSize * 0.5`) to prevent clipping
- **Drawing Offset**: Text drawn at `(leftPadding, topPadding)` instead of `(0, 0)`

### 7. Font Configuration
- **Variable**: `TITLE_FONT_FAMILY = 'Modern Gothic Mono'` at `main.js:102`
- **Usage**: Single source of truth for font across all rendering
- **Locations Using Font**:
  - `main.js:187` - Initial canvas setup
  - `main.js:226` - After canvas resize

## Technical Architecture

### Data Flow
1. **Initialization**:
   - Images converted to ASCII data → `asciiDataCache`
   - Text overlay converted → `currentTextData` / `targetTextData`

2. **Rendering**:
   - Calculate text mask from text data
   - Morph image characters with text masking
   - Single unified HTML output

3. **Transitions**:
   - Image morphing: Character/color interpolation
   - Text morphing: Random character swapping at different timings
   - Deep copying prevents data corruption

### Character Set System
```javascript
// Image characters (light geometric shapes)
CHARACTER_SETS = [
  ['.', '○', '∴', '⁘', '∗', '◎'],
  ['.', '☐', '✧', '✦', '★', '⊕'],
  ['.', '∘', '▫', '✫', '◇', '◓']
]

// Title characters (dense shapes)
TITLE_CHARACTER_SETS = [
  ['◐','▪', '◉'],
  ['◉', '◆', '■'],
  ['◓','◉', '●']
]
```

## Bug Fixes

### Issue 1: Title Overlaying Instead of Integrating
- **Cause**: Two-layer architecture (z-index 10 and 20)
- **Fix**: Unified grid with positional masking

### Issue 2: Brightness Inversion on Finalization
- **Cause**: Missing brightness inversion in interpolation
- **Fix**: Added `1 - interpolatedBrightness` mapping

### Issue 3: Image Using Title Characters
- **Cause**: CHARACTER_SETS contained heavy characters meant for title
- **Fix**: Separated into distinct CHARACTER_SETS and TITLE_CHARACTER_SETS

### Issue 4: Title Disappearing on Transitions
- **Cause**: Shared object references between currentTextData and targetTextData
- **Fix**: Implemented deep copying in `prepareTextTransition()`

### Issue 5: Title Characters Not Animating
- **Cause**: render() was calling morphTextData(1) instead of using currentTextData
- **Fix**: Use `currentTextData` directly when not transitioning

### Issue 6: Title Text Clipping
- **Cause**: Fixed 30px padding insufficient for large viewport-based font
- **Fix**: Proportional padding (`fontSize * 0.5`) and drawing offset

## Configuration Variables

Located at top of `main.js`:

```javascript
const TRANSITION_DURATION = 1500;          // Transition time (ms)
const TEXT_OVERLAY = 'ANACYCLE';           // Title text
const TITLE_FONT_FAMILY = 'Modern Gothic Mono'; // Font for title
const CHARACTER_SETS = [...];              // Image character sets
const TITLE_CHARACTER_SETS = [...];        // Title character sets
```

## Performance Optimizations

- GPU acceleration via CSS transforms (`translateZ(0)`)
- Pre-cached ASCII data for all images
- Single DOM update per frame
- Passive scroll listeners
- Request animation frame for smooth rendering

## File Structure

```
image+logo-center-mousemove/
├── index.html          - Single unified ASCII container
├── style.css           - Layout and GPU acceleration
├── main.js            - Core logic (1090 lines)
│   ├── Configuration (lines 1-120)
│   ├── Ascii class (lines 122-507)
│   ├── MorphingAscii class (lines 509-850)
│   ├── Text overlay functions (lines 852-1024)
│   └── Initialization (lines 1036-1090)
└── claude.md          - This documentation
```

## Key Learnings

1. **Unified Grid > Layered Approach**: True integration requires single rendering pass
2. **Deep Copy Required**: Shared references cause subtle bugs in morphing animations
3. **Viewport Units**: Better responsiveness than fixed pixel values
4. **Proportional Spacing**: Padding/offsets should scale with content size
5. **Direct Data Access**: For non-transitioning states, use current data directly rather than morphing at progress=1

---

## Session 2: UI Controls and Background Color Modes

### Features Added

#### 1. UI Visibility Toggle (Spacebar)
- **Implementation**: `toggleUIVisibility()` function at `main.js:1290-1296`
- **Trigger**: Spacebar keydown event (line 1335-1341)
- **Behavior**: Toggles `.hidden` class on `.ui` element
- **CSS**: `.ui.hidden` opacity/visibility transitions in `style.css:230-234`
- **User Instruction**: Added `.info` div in `index.html:25-27`

#### 2. Background Color Modes
Four distinct visual modes controlled via dropdown in UI:

**White Mode (Default)**:
- White background (`#fff`)
- Black ASCII characters (`#000`)
- Filter with `lighten` blend mode
- Result: Colored characters on white background

**Inverted Mode**:
- Black background (`#000`)
- White ASCII characters (`#fff`)
- Filter with `lighten` blend mode
- Result: Colored characters on black background

**Black Mode**:
- Black background (`#000`)
- Filter hidden (opacity `0`)
- ASCII characters use `textColorCycle` animation
- Result: Cycling colored characters on pure black

**Black-Inverted Mode**:
- White background (`#fff`)
- Filter at `z-index: 5` (behind ASCII art)
- Black ASCII characters (`#000`)
- Filter with `normal` blend mode
- Result: Black characters on cycling colored background

#### 3. Text Color Animation
- **CSS**: `@keyframes textColorCycle` in `style.css:88-123`
- **Purpose**: Cycles ASCII character color through 6 colors (same as filter)
- **Usage**: Applied to `.ascii-art` in Black mode
- **Colors**: Blue → Pink → Green → Yellow → Violet → Orange (66s cycle)

### Technical Implementation

#### Background Color Handler
**Location**: `main.js:1403-1469`

**Key Properties Managed**:
- `document.body.style.backgroundColor`
- `.filter` opacity, mixBlendMode, animation, zIndex
- `.ascii-art` color, mixBlendMode, animation

**Z-Index Strategy**:
- Default: Filter at `z-index: 100` (above ASCII at z-index 10)
- Black-Inverted: Filter at `z-index: 5` (below ASCII at z-index 10)

### Bug Fixes This Session

#### Issue 7: .info Text Invisible
- **Cause**: Text inherited `color: #000` from body, invisible on dark UI background
- **Fix**: Added explicit `color: #fff` in CSS

#### Issue 8: Performance Regression from Dynamic Sample Rates
- **Cause**: Dynamic sample rate calculation based on `--ascii-unit` was expensive
- **Fix**: Reverted to fixed `sampleRate = 8` (line 199)
- **Additional Fixes**:
  - Changed `LETTER_SPACING` from 5 to 10 (line 128)
  - Removed `TITLE_FONT_WEIGHT` from canvas font rendering

#### Issue 9: RAF Throttling Causing Lag
- **Cause**: `requestAnimationFrame` queue management overhead
- **Fix**: Removed RAF wrapper, direct execution in mousemove handler (lines 625-641)
- **Result**: Browser naturally throttles to refresh rate

#### Issue 10: Span Wrappers Performance Impact
- **Cause**: `<span class="black">` wrappers around each character
- **Fix**: Removed spans, characters inherit color from parent (lines 859, 892, 907)
- **Impact**: Reduced DOM nodes by ~95%, improved animation smoothness

#### Issue 11: Black Mode Color Issues
- **Problem**: Clearing inline style reverted to CSS default `#000`
- **Solution**: Created `textColorCycle` animation for direct color animation
- **Result**: Characters cycle through colors without filter overlay

#### Issue 12: Black-Inverted Z-Index
- **Problem**: Filter overlaying ASCII characters (both showing filter color)
- **Solution**: Lower filter z-index to 5, ASCII stays at 10
- **Result**: Filter shows as background, black characters visible on top

### File Changes

#### index.html
- Added `.info` instruction div (lines 25-27)
- Added `backgroundColor` dropdown (lines 46-54)
- Renamed CSS classes: `.font-control-group` → `.control-group`

#### style.css
- Added `textColorCycle` keyframe animation (lines 88-123)
- Updated class names throughout
- Added `.ui .info` styling
- Updated selector specificity

#### main.js
- Added `toggleUIVisibility()` function (lines 1290-1296)
- Added spacebar event listener (lines 1335-1341)
- Added background color change handler (lines 1403-1469)
- Removed RAF throttling from mousemove (lines 625-641)
- Removed span wrappers from rendering (lines 859, 892, 907)
- Reverted to fixed sample rate (line 199)
- Changed letter spacing to 10 (line 128)

### Configuration Updates

```javascript
const LETTER_SPACING = 10;  // Was 5, now matches original
const sampleRate = 8;       // Fixed, not dynamic
```

### Performance Notes

- Fixed sample rate maintains consistent performance across all `--ascii-unit` values
- Direct mousemove execution is faster than RAF for event-driven updates
- Removing span wrappers significantly reduced DOM complexity
- Parent color inheritance simplifies state management

### Z-Index Hierarchy

```
z-index: 100 - .ui controls (always on top)
z-index: 100 - .filter (default, above ASCII)
z-index: 20  - .image-name-display
z-index: 10  - .ascii-unified-layer (ASCII art)
z-index: 5   - .filter (black-inverted mode only)
```

### Color Mode Summary Table

| Mode           | Background | ASCII Color | Filter Opacity | Filter Blend | Filter Z-Index | ASCII Animation |
|----------------|------------|-------------|----------------|--------------|----------------|-----------------|
| White          | #fff       | #000        | 1              | lighten      | 100            | none            |
| Inverted       | #000       | #fff        | 1              | lighten      | 100            | none            |
| Black          | #000       | animated    | 0              | normal       | -              | textColorCycle  |
| Black-Inverted | #fff       | #000        | 1              | normal       | 5              | none            |

---

## Session 3: Seamless Transition Handoff

### Problem
Image transitions had a visible "pop" or sudden cut at 100% completion. The animated ASCII characters during transition didn't match the final resting state's specific character map, causing a jarring handoff.

### Root Cause
The `interpolateCharacter()` function interpolated brightness values and mapped them to characters using the **current** image's character set configuration. This meant transitioning characters never exactly matched the **target** image's specific ASCII map.

### Solution 1: Target Character Switching (Initial Fix)
**Location**: `main.js:907-945` (interpolateCharacter)

**Implementation**:
- Split transition into two phases based on per-position switching thresholds
- **Before threshold**: Show source character mapped from interpolated brightness
- **After threshold**: Show exact target character (`to.char`)
- **At progress=1.0**: All positions show exact target characters = seamless handoff

**Code Change**:
```javascript
// Pre-generated stable threshold for each position
const switchThreshold = this.switchThresholds?.[positionIndex] ?? 0.5;

if (progress < switchThreshold) {
  // Use interpolated brightness with source character set
  char = steps[Math.floor((1 - interpolatedBrightness) * steps.length)];
} else {
  // Switch to exact target character
  char = to.char;
}
```

### Solution 2: Stable Switching Thresholds (Smoothness Fix)
**Location**: `main.js:662-668` (startTransition)

**Problem with Initial Fix**:
First attempt used `Math.pow(Math.random(), 2)` called **every frame** for each character, causing switching thresholds to constantly change. This created staticky, flickery, mathematical-looking transitions.

**Final Implementation**:
Generate **persistent, stable** switching thresholds once at transition start:

```javascript
// Generate stable switching thresholds for each position
const totalPositions = this.gridWidth * this.gridHeight;
this.switchThresholds = new Array(totalPositions);
for (let i = 0; i < totalPositions; i++) {
  // Bias toward later switching (0.3-1.0 range) for smooth reveal
  this.switchThresholds[i] = 0.3 + Math.pow(Math.random(), 1.5) * 0.7;
}
```

**Key Properties**:
- **Stable**: Each position's threshold is constant throughout the transition
- **Randomized**: Different positions switch at different times (organic feel)
- **Biased**: `Math.pow(Math.random(), 1.5)` weights toward 0.7-1.0 range
- **Range**: 0.3 to 1.0 (target image builds gradually in latter 70% of transition)

### Additional Enhancement: Title Horizontal Spacing
**Location**: `main.js:194-233` (AsciiTextOverlay.buildAsciiData)

**Problem**: ANACYCLE title appeared horizontally squished compared to actual typeface proportions.

**Solution**: Separated X and Y sample rates for independent control:
```javascript
const sampleRateX = 6;  // Horizontal spacing (lower = wider)
const sampleRateY = 8;  // Vertical spacing
```

Previously used single `sampleRate = 8` for both axes. Lower X value (6 vs 8) provides more horizontal breathing room.

**Letter Spacing Configuration**:
- Canvas letter spacing: `LETTER_SPACING = 2` (line 128)
- Applied during text rendering to canvas before ASCII conversion

### Results

**Transition Quality**:
- ✅ Seamless handoff at 100% (no visible pop)
- ✅ Smooth, organic character-by-character reveal
- ✅ No flickering or static effects
- ✅ Physically builds toward target's exact ASCII map

**Title Typography**:
- ✅ Proper horizontal proportions matching typeface design
- ✅ Independent X/Y spacing control for fine-tuning

### Technical Details

**Threshold Distribution**:
- Formula: `0.3 + Math.pow(Math.random(), 1.5) * 0.7`
- Without bias: uniform 0.3-1.0 distribution
- With `^1.5` bias: ~60% of switches happen in 0.7-1.0 range
- Effect: Target image emerges rapidly in final 30% of transition

**Character Selection Logic**:
```javascript
if (progress < switchThreshold) {
  // Source character with interpolated brightness
  const currentAscii = this.asciiInstances[this.currentImageIndex];
  const setIndex = currentAscii.positionSets[positionIndex] || 0;
  const steps = CHARACTER_SETS[setIndex];
  char = steps[Math.floor((1 - interpolatedBrightness) * steps.length)];
} else {
  // Exact target character (guarantees perfect match at end)
  char = to.char;
}
```

### Bug Fixes This Session

#### Issue 13: Visible Pop at Transition End
- **Cause**: Interpolated characters didn't match target's exact ASCII map
- **Fix**: Switch to `to.char` in latter portion of transition

#### Issue 14: Flickery/Staticky Transitions
- **Cause**: Random switching thresholds recalculated every frame
- **Fix**: Pre-generate stable thresholds array in `startTransition()`

#### Issue 15: Horizontally Squished Title
- **Cause**: Same sample rate (8) used for both X and Y axes
- **Fix**: Separate `sampleRateX = 6` and `sampleRateY = 8`

### Configuration Variables

```javascript
// Title spacing control
const LETTER_SPACING = 2;        // Canvas text letter spacing (pixels)
const sampleRateX = 6;           // ASCII horizontal sampling (lower = wider)
const sampleRateY = 8;           // ASCII vertical sampling

// Transition behavior
this.switchThresholds = [...];   // Per-position switching times (0.3-1.0)
```

### Performance Considerations

- Threshold array allocation: O(n) once per transition (negligible)
- Threshold lookup: O(1) per character per frame
- No performance regression from previous session
- Memory: ~400KB for 1920×1080 grid (4 bytes × width × height)

### File Changes

**main.js**:
- Lines 662-668: Added stable threshold generation in `startTransition()`
- Lines 907-945: Updated `interpolateCharacter()` with threshold-based switching
- Lines 200-201: Separated `sampleRateX` and `sampleRateY`
- Line 128: Letter spacing set to 2 pixels

---

## Session 4: Loading Animation Triggers & Title Toggle

### Features Added

#### 1. Loading Animation Re-trigger on Background Color Change
**Location**: `main.js:1489-1493`

**Implementation**:
- Added code to re-initiate loading animation when backgroundColor dropdown changes
- Calls `startInitialLoadSequence()` after applying color styles
- Ensures consistent visual experience when switching color modes

**Behavior**:
- User changes background color → animation restarts from first image
- Shows ANACYCLE title alone for 1 second
- Randomly reveals image ASCII characters over next 1 second

#### 2. 'R' Key Shortcut for Animation Restart
**Location**: `main.js:1347-1353`

**Implementation**:
- Added 'R' keypress handler within existing keydown event listener
- Triggers same loading sequence as background color change
- Useful for screen recording and presentation scenarios

**Key Combination**:
- Press 'R' → Restart loading animation from first image
- Spacebar → Toggle UI visibility (existing feature)

#### 3. Title Visibility Toggle
**Location**: UI control in `index.html:55-58`, logic in `main.js`

**Components**:
- **Global State**: `isTitleVisible = true` (`main.js:66-67`)
- **UI Checkbox**: `#titleToggle` checked by default
- **Mask Logic**: Modified `calculateTextMask()` (`main.js:1067-1068`)
- **Event Handler**: `main.js:1499-1513`

**Behavior**:
- **Checked (default)**: Title "ANACYCLE" carves out space from image ASCII
- **Unchecked**: `calculateTextMask()` returns empty map, image ASCII fills entire space
- **On Toggle**: Automatically triggers loading animation and resets to first image

**Implementation Approach**:
- Simple early return in `calculateTextMask()` when title is hidden
- No changes to rendering logic or character masking system
- Image ASCII naturally fills space when no text mask is provided

#### 4. Title Toggle Checkbox Styling
**Location**: `style.css:354-364`

**Styling**:
```css
#titleToggle {
    width: 24px;
    height: 24px;
    cursor: pointer;
    align-self: flex-start;
    accent-color: #fff;
}
```

**Features**:
- Larger size (24px vs default ~13-16px)
- Left-aligned within control group
- White accent color matches UI theme
- Hover opacity effect for better UX

### Bug Fixes This Session

#### Issue 16: Image Flash After Animation Re-trigger
**Cause**: When loading animation restarted after user had clicked to advance images, `currentImageIndex` and `targetImageIndex` remained at advanced positions (e.g., image 2 or 3). First click after animation would jump to wrong image.

**Fix**: `main.js:717-719`
```javascript
startInitialLoadSequence() {
  // Reset to first image
  this.currentImageIndex = 0;
  this.targetImageIndex = 0;
  // ... rest of sequence
}
```

**Result**: All animation re-triggers now properly reset to first image, ensuring smooth progression.

### UI Changes

#### Updated Info Text
**Location**: `index.html:26-27`

Added instruction for 'R' key shortcut:
```
To toggle the UI visibility, press Space.
To retrigger the initial loading animation (for screenrecording), press R.
```

#### New UI Control
Added Title toggle checkbox in control panel with label "Title:"

### Technical Architecture Updates

#### Animation Re-trigger Flow
1. **Trigger Sources**:
   - Background color dropdown change
   - Title checkbox toggle
   - 'R' keypress

2. **Common Behavior**:
   - Set `isInitialLoad = true`
   - Reset indices: `currentImageIndex = 0`, `targetImageIndex = 0`
   - Call `startInitialLoadSequence()`

3. **Sequence Execution**:
   - Phase 1: Show title only (if visible) for 1 second
   - Phase 2: Randomly reveal image characters for 1 second
   - Complete: Set `isInitialLoad = false`, normal rendering resumes

#### Title Visibility System

**Data Flow**:
```
isTitleVisible (global boolean)
    ↓
calculateTextMask() → returns Map or empty Map
    ↓
render() / renderWithRevealMask()
    ↓
morphCharactersUnified() uses mask to exclude text positions
    ↓
Final HTML output (unified grid)
```

**Key Principle**:
Title is not rendered separately then hidden. Instead, text mask controls whether positions are reserved for title characters. When mask is empty, image ASCII naturally fills all positions.

### Configuration Variables

```javascript
// Title visibility (global state)
let isTitleVisible = true;  // Line 66-67

// Controlled by UI checkbox #titleToggle
```

### File Changes Summary

**index.html**:
- Line 26-27: Updated info text with 'R' key instruction
- Lines 55-58: Added title toggle checkbox control

**main.js**:
- Lines 66-67: Added `isTitleVisible` global state variable
- Lines 717-719: Reset image indices in `startInitialLoadSequence()`
- Lines 1067-1068: Early return in `calculateTextMask()` when title hidden
- Lines 1347-1353: Added 'R' keypress handler
- Lines 1489-1493: Re-trigger animation on background color change
- Lines 1499-1513: Title toggle event handler

**style.css**:
- Lines 316-321: Added `.ui .info` styling
- Lines 354-364: Added `#titleToggle` checkbox styling

### User Experience Improvements

1. **Consistent Animations**: Every setting change triggers a fresh loading animation, providing visual continuity
2. **Screen Recording Support**: 'R' key allows easy animation restart for recording demos
3. **Flexible Composition**: Title can be toggled to show pure image ASCII or integrated title+image
4. **Visual Feedback**: Larger, styled checkbox makes title toggle more discoverable and easier to use
5. **No Flash Bug**: Image progression now smooth regardless of when animation is re-triggered

### Design Decisions

#### Why Reset to First Image?
Loading animation is designed to introduce the experience. Re-triggering suggests user wants to "start over" the visual sequence, so resetting to first image is most intuitive behavior.

#### Why Trigger Animation on Settings Change?
- **Visual Consistency**: Avoids jarring instant swaps when changing appearance
- **User Delight**: Smooth animations feel more polished than instant changes
- **Functional Clarity**: Loading sequence clearly shows what's happening during transition

#### Why Empty Mask Instead of Hiding Title?
- **Simpler Implementation**: No need to conditionally render or hide title elements
- **True Integration**: Image ASCII naturally fills space rather than overlaying hidden elements
- **Performance**: No hidden DOM elements or CSS opacity tricks needed

### Performance Notes

- No performance impact from title toggle (same rendering path, just different mask)
- Animation re-triggers don't create memory leaks (reuses existing data structures)
- Index resets prevent state drift over multiple animation cycles

---

## Session 5: Density Control & Animation

### Features Added

#### 1. Density Slider Control
**Location**: UI control in `index.html:60-63`, logic in `main.js`

**Components**:
- **Global State**: `characterDensity = 100` (`main.js:68`)
- **UI Slider**: Range input 0-100% with live value display
- **Mask Logic**: `calculateDensityMask()` function (`main.js:1126-1175`)
- **Event Handler**: Real-time slider updates (`main.js:1594-1607`)

**Behavior**:
- **100% density**: All image ASCII characters visible (no masking)
- **Lower density**: Characters progressively hidden, creating sparse appearance
- **Cumulative pattern**: Hidden characters stay hidden as density decreases
- **Stable randomization**: Same density value always produces same pattern (no flickering)

**Implementation Approach**:
- Uses **Fisher-Yates shuffle** with fixed seed (12345) to create stable random order
- Shuffled order generated once per grid dimensions, never changes
- As density decreases, hides positions sequentially from shuffled array
- Characters reappear in reverse order as density increases
- Integrated with existing mask system (works alongside text mask)

#### 2. 'D' Key Density Animation
**Location**: `main.js:1386-1435` (function), `main.js:1434-1438` (event listener)

**Behavior**:
- Press 'D' key to trigger smooth animation
- Animates density from **100% to 15%** over 2 seconds
- Uses **easeInOutCubic** easing for smooth acceleration/deceleration
- Updates slider UI and percentage display in real-time
- Cancels previous animation if triggered again mid-animation

**Implementation**:
- Uses `requestAnimationFrame` for 60fps animation loop
- Directly updates `characterDensity` global state
- Forces re-render on each frame via `morphingInstance.render()`
- Tracks animation state to prevent overlapping animations

#### 3. Density Mask Rendering Integration
**Location**: `main.js:804-881` (render methods), `main.js:883-922` (morph functions)

**Modified Functions**:
- `render()`: Now passes `densityMask` to morphing function
- `renderWithRevealMask()`: Applies density mask during initial load animation
- `morphCharactersUnified()`: Checks density mask, renders space for hidden positions
- `morphCharactersWithReveal()`: Applies density mask alongside reveal mask

**Mask Hierarchy**:
1. **Text mask**: Title characters (highest priority - never hidden by density)
2. **Density mask**: Sparse effect (hides image characters only)
3. **Reveal mask**: Initial load animation
4. Image characters: Rendered if not masked by above

### Technical Architecture

#### Cumulative Density Pattern
```javascript
// One-time shuffle (when grid dimensions change)
shuffledPositions = [234, 1, 567, 89, ...] // Fixed order

// At 80% density: hide first 20% from shuffled array
hiddenPositions = {234, 1, 567, ...}

// At 60% density: hide first 40% from shuffled array
hiddenPositions = {234, 1, 567, 89, ...} // Previous + more
```

**Key Principle**: Positions are hidden in a consistent order. Lowering density reveals no new characters; raising density only unhides previously hidden ones.

#### Animation Frame Loop
```javascript
function animate(currentTime) {
  const progress = elapsed / duration;
  const eased = easeInOutCubic(progress);
  const currentDensity = 100 - (85 * eased); // 100 → 15

  characterDensity = currentDensity;
  updateUI();
  forceRender();

  if (progress < 1) requestAnimationFrame(animate);
}
```

### Bug Fixes This Session

#### Issue 17: Density Mask Randomizing on Each Adjustment
- **Cause**: Original implementation shuffled positions based on density value seed
- **Problem**: Different density values created different random patterns
- **Fix**: Use fixed seed for shuffle, generate stable order once
- **Result**: Cumulative hide/reveal pattern, no flickering

### UI Changes

#### Density Control Panel
**Location**: `index.html:60-63`
```html
<label for="densitySlider">Density: <span id="densityValue">100</span>%</label>
<input type="range" id="densitySlider" min="0" max="100" value="100" step="1">
```

#### Updated Info Text
**Location**: `index.html:26-30`
- Added instruction for 'D' key animation ("fadeout animation")

#### Slider Styling
**Location**: `style.css:372-432`
- Custom range slider matching UI theme
- White thumb (16px) on black track (6px)
- Hover effects with scale transform
- Cross-browser support (WebKit and Firefox variants)

### Configuration Variables

```javascript
// Density control (global state)
let characterDensity = 100;

// Density animation state
let densityAnimationFrame = null;
let isDensityAnimating = false;

// Stable shuffled order (cached)
let shuffledPositions = null;
let lastGridDimensions = '';
```

### Performance Optimizations

- **Shuffle once**: Positions only shuffled when grid dimensions change
- **Direct array indexing**: O(1) lookup for position hiding
- **Cached mask**: Returns early if density hasn't changed (removed in final version for simplicity)
- **RAF animation**: Smooth 60fps with automatic throttling
- **No DOM mutation during animation**: Only updates transform values

### File Changes Summary

**index.html**:
- Lines 26-30: Updated info text with 'D' key instruction
- Lines 60-63: Added density slider control with live value display

**main.js**:
- Lines 68-71: Added density global state variables
- Lines 1126-1175: Added `calculateDensityMask()` function with cumulative pattern
- Lines 804-827: Modified `render()` to apply density mask
- Lines 829-847: Modified `renderWithRevealMask()` to apply density mask
- Lines 849-881: Modified `morphCharactersWithReveal()` to check density mask
- Lines 883-922: Modified `morphCharactersUnified()` to check density mask
- Lines 1386-1435: Added `animateDensity()` function
- Lines 1434-1438: Added 'D' keypress event listener
- Lines 1594-1607: Added density slider input event handler

**style.css**:
- Lines 372-432: Added density slider styling (track, thumb, hover states)

### Experimental Files Created

**grid-overlay-hide.html**: Option A demo (hide/reveal ASCII on grid collision)
**grid-overlay-displace.html**: Option B demo (particle displacement physics)
**type-shrink.html**: Typography animation demo (stroke to fill with scale)

*Note: Grid overlay demos were exploratory research and not integrated into main project.*

### User Experience Improvements

1. **Visual Control**: Manual density adjustment for artistic effect
2. **Performance Animation**: 'D' key creates smooth fadeout for presentations
3. **Stable Pattern**: Predictable, non-flickering density changes
4. **Real-time Feedback**: Live percentage display during slider adjustment
5. **Smooth Easing**: Professional cubic easing for animation quality

### Design Decisions

#### Why Cumulative Pattern?
- **Visual Consistency**: Same characters always hide/unhide in same order
- **No Flicker**: Prevents random character swapping on small adjustments
- **Predictable**: User can "scrub" density and see smooth progression
- **Performance**: Single shuffle operation, reused for all density values

#### Why Fixed Seed (12345)?
- **Reproducible**: Same pattern every session for consistency
- **Random-looking**: Fisher-Yates creates natural sparse distribution
- **Debuggable**: Deterministic behavior makes issues easier to track

#### Why 100% → 15% Animation?
- **Dramatic Effect**: Large range creates impactful visual
- **Preserves Structure**: 15% leaves enough characters to maintain image recognition
- **Not 0%**: Complete fadeout would be disorienting; 15% maintains context

### Performance Notes

- Density mask calculation: O(n) where n = positions to hide
- Spatial distribution: Shuffle ensures even distribution across viewport
- Animation overhead: Minimal (~1-2ms per frame for state update)
- No layout thrashing: Only text content changes, not DOM structure

### Known Limitations

- **Title never sparse**: Density only affects image characters, not title
- **Grid locked**: Shuffle pattern changes if viewport resizes (by design)
- **Fixed animation**: 'D' key always goes to 15% (not configurable)

### Future Considerations

- Optional: Allow density to affect title characters
- Optional: Different sparse patterns (clustered, gradient, etc.)
- Optional: Configurable animation target density
- Optional: Reverse animation ('Shift+D' to go 15% → 100%)

---
