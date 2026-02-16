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
