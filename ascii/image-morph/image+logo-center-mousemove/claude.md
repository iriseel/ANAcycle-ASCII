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
