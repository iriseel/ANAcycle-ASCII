// ============================================
// CONFIGURATION
// ============================================

// List of images in _thumbnails folder
const THUMBNAIL_IMAGES = [
  '1_LifeOnMars.jpg',
  '2_Edible.png',
  '3_AlgaeSipsandJavaBrews.jpg',
  '4_ClosedWorldsExhibition.jpg',
  '5_ClimateHouse.jpg',
];

// Transition duration in milliseconds
const TRANSITION_DURATION = 1500;

// Color pair sets for duotone effects
const COLOR_SET = [
  {
    name: 'Black & White',
    dark: { r: 0, g: 0, b: 0 },
    light: { r: 255, g: 255, b: 255 }
  }
];

// Current duotone color configuration (will be updated from COLOR_SET)
let DUOTONE = {
  dark: { r: 0, g: 0, b: 0 },
  light: { r: 255, g: 255, b: 255 },
  threshold: 0.5
};

// Multiple character sets with similar visual densities for cycling
const CHARACTER_SETS = [
  ['.', '○', '∴', '⁘', '∗', '◎'],
  ['.', '☐', '✧', '✦', '★', '⊕'],
  ['.', '∘', '▫', '✫', '◇', '◓']
];

const TITLE_CHARACTER_SETS = [
  ['◐','▪', '◉'],
  ['◉', '◆', '■'],
  ['◓','◉', '●']
];


// Current character set (defaults to first set)
const CHARACTER_SET = CHARACTER_SETS[0];

// Title character set (defaults to first set of TITLE_CHARACTER_SETS)
const TITLE_CHARACTER_SET = TITLE_CHARACTER_SETS[0];

// Text overlay configuration
const TEXT_OVERLAY = 'ANACYCLE';

// Title font family (used for text overlay rendering)
let TITLE_FONT_FAMILY = 'Sharp Earth Mono';

// Title font weight (used for text overlay rendering)
let TITLE_FONT_WEIGHT = 800;

// Toggle state for minimal mode
let isMinimalMode = false;

// Title visibility state
let isTitleVisible = true;

// ============================================
// DUOTONE COLOR MAPPING
// ============================================

// Track the last used color pair index to avoid repeats
let lastColorIndex = -1;

// Randomly select and apply a color pair from COLOR_SET (ensures different from previous)
function setRandomColorPair() {
  let randomIndex;

  // If we have more than one color pair, ensure we pick a different one
  if (COLOR_SET.length > 1) {
    do {
      randomIndex = Math.floor(Math.random() * COLOR_SET.length);
    } while (randomIndex === lastColorIndex);
  } else {
    randomIndex = 0;
  }

  lastColorIndex = randomIndex;
  const selectedPair = COLOR_SET[randomIndex];

  DUOTONE.dark = { ...selectedPair.dark };
  DUOTONE.light = { ...selectedPair.light };

  console.log(`Color pair changed to: ${selectedPair.name}`);
  return selectedPair;
}

// Map brightness (0-1) to duotone colors
function getDuotoneColor(brightness) {
  // Return pure black for all characters so the filter blend mode can apply colors
  // The brightness variation will be handled by character density/shape
  return {
    r: 0,
    g: 0,
    b: 0
  };
}

// ============================================
// ASCII TEXT CONVERSION (for logo overlay)
// ============================================

class AsciiTextOverlay {
  constructor(text, characterSet) {
    this.text = text;
    this.characterSet = characterSet;
  }

  // Convert text to ASCII data structure (for morphing)
  convert() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Set canvas size based on text
    // Calculate font size as 15vmin (15% of the smaller viewport dimension)
    const vmin = Math.min(window.innerWidth, window.innerHeight);
    const fontSize = vmin * 0.15;
    ctx.font = `${fontSize}px '${TITLE_FONT_FAMILY}', sans-serif`;

    // custom letter spacing (pixels)
      const LETTER_SPACING = 2;

      // preserve originals
      const _originalMeasureText = ctx.measureText.bind(ctx);
      const _originalFillText = ctx.fillText.bind(ctx);

      // override measureText to include extra spacing between glyphs
      ctx.measureText = (str) => {
        const metrics = _originalMeasureText(str);
        const extra = LETTER_SPACING * Math.max(0, String(str).length - 1);
        // return an object with at least width so later code can use metrics.width
        return { ...metrics, width: metrics.width + extra };
      };

      // override fillText to draw each glyph with spacing
      ctx.fillText = (text, x, y, maxWidth) => {
        let cursorX = x;
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          _originalFillText(ch, cursorX, y, maxWidth);
          const chWidth = _originalMeasureText(ch).width;
          cursorX += chWidth + LETTER_SPACING;
        }
      };
      const metrics = ctx.measureText(this.text);

    // Add padding to ensure no clipping (proportional to font size)
    const padding = Math.ceil(fontSize * 0.5);
    const width = Math.ceil(metrics.width) + padding;
    const height = Math.ceil(fontSize * 1.2) + padding;

    canvas.width = width;
    canvas.height = height;

    // Clear canvas (transparent background)
    ctx.clearRect(0, 0, width, height);

    // Set font before defining fillText override
    ctx.font = `${fontSize}px '${TITLE_FONT_FAMILY}', sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Re-apply fillText override after canvas resize (which resets context)
    ctx.fillText = (text, x, y, maxWidth) => {
      let cursorX = x;
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        _originalFillText(ch, cursorX, y, maxWidth);
        const chWidth = _originalMeasureText(ch).width;
        cursorX += chWidth + LETTER_SPACING;
      }
    };

    // Draw text with padding offset to prevent clipping
    const leftPadding = Math.ceil(padding / 2);
    const topPadding = Math.ceil(padding / 2);
    ctx.fillText(this.text, leftPadding, topPadding);

    // Get image data
    const imageData = ctx.getImageData(0, 0, width, height);

    // Build ASCII data structure
    return this.buildAsciiData(imageData, width, height);
  }

  buildAsciiData(imageData, width, height) {
    const data = imageData.data;
    const asciiData = [];

    // Sample every few pixels for reasonable resolution
    // Use different sample rates for X and Y to adjust horizontal spacing
    const sampleRateX = 6;  // Lower value = wider spacing (more horizontal stretch)
    const sampleRateY = 8;  // Vertical spacing

    for (let y = 0; y < height; y += sampleRateY) {
      const row = [];
      for (let x = 0; x < width; x += sampleRateX) {
        const i = (y * width + x) * 4;

        // Check if this pixel is part of the text (alpha > threshold)
        const alpha = data[i + 3];
        const isText = alpha > 128;

        if (isText) {
          // Pick a random character from the set, heavily biased towards denser characters (end of array)
          // Using power of 0.25 for strong bias towards higher indices
          const biasedRandom = Math.pow(Math.random(), 0.25);
          const charIndex = Math.floor(biasedRandom * (this.characterSet.length - 1)) + 1;
          const char = this.characterSet[charIndex];

          // Assign random swap timing for morphing
          const swapTiming = Math.random();

          // Will use brightened DUOTONE.light color when rendering
          row.push({ char, isText: true, swapTiming });
        } else {
          // Empty space
          row.push({ char: ' ', isText: false, swapTiming: 0 });
        }
      }
      asciiData.push(row);
    }

    return asciiData;
  }
}

// ============================================
// DYNAMIC IMAGE LOADING FROM _THUMBNAILS
// ============================================

// Populate hidden images dynamically
function populateHiddenImages() {
  const hiddenImagesContainer = document.getElementById('hiddenImages');

  THUMBNAIL_IMAGES.forEach((filename, index) => {
    const img = document.createElement('img');
    img.src = `../../../assets/thumbnails/${filename}`;
    img.alt = `Image ${index + 1}`;
    img.className = 'source-img';
    img.dataset.index = index;
    hiddenImagesContainer.appendChild(img);
  });
}

// ============================================
// ASCII IMAGE CONVERSION (adapted from ascii folder)
// ============================================

class Ascii {
  constructor(ref, options = {}) {
    this.ref = ref; // Source img element

    // Store all character sets for cycling
    this.characterSets = CHARACTER_SETS;
    this.positionSets = []; // Track which character set each position uses

    // Merge default options
    this.options = Object.assign({
      steps: CHARACTER_SETS[0], // Start with first character set
      contrast: 100,
      invert: false,
      width: null,
      height: null,
      fit: 'cover',
      glyphRatio: 0.45
    }, options);
  }

  init() {
    // Reverse character set if invert is true
    if (this.options.invert) {
      this.options.steps = this.options.steps.reverse();
    }

    // Create off-screen canvas
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

    // Start conversion
    this.build();
  }

  build() {
    this.buildImage();
    this.buildPixelData();
    return this.buildAsciiData();
  }

  buildImage() {
    // Calculate image aspect ratio with glyph compensation
    this.imageRatio = this.ref.naturalWidth /
                      (this.ref.naturalHeight * this.options.glyphRatio);

    // Calculate grid dimensions
    this.options.width = this.options.width ||
                         Math.floor(this.options.height * this.imageRatio);

    this.options.height = this.options.height ||
                          Math.ceil(this.options.width / this.imageRatio);

    this.containerRatio = this.options.width / this.options.height;

    // Set canvas size to match ASCII grid
    this.ctx.canvas.width = this.options.width;
    this.ctx.canvas.height = this.options.height;

    // Calculate image positioning for cover fit
    if (this.containerRatio >= this.imageRatio) {
      this.imageWidth = this.canvas.width;
      this.imageHeight = this.imageWidth / this.imageRatio;
      this.x = 0;
      this.y = (this.canvas.height - this.imageHeight) / 2;
    } else {
      this.imageHeight = this.canvas.height;
      this.imageWidth = this.imageHeight * this.imageRatio;
      this.x = (this.canvas.width - this.imageWidth) / 2;
      this.y = 0;
    }

    // Draw image to canvas
    this.ctx.drawImage(
      this.ref,
      0, 0,
      this.ref.naturalWidth,
      this.ref.naturalHeight,
      this.x, this.y,
      this.imageWidth,
      this.imageHeight
    );

    // Extract pixel data
    this.imgData = this.ctx.getImageData(
      0, 0,
      this.options.width,
      this.options.height
    ).data;

    // Apply contrast adjustment
    if (this.options.contrast) {
      this.adjustContrast();
    }
  }

  adjustContrast() {
    const contrast = this.options.contrast / 100 + 1;
    const intercept = 128 * (1 - contrast);

    for (let i = 0; i < this.imgData.length; i += 4) {
      this.imgData[i] = this.imgData[i] * contrast + intercept;
      this.imgData[i + 1] = this.imgData[i + 1] * contrast + intercept;
      this.imgData[i + 2] = this.imgData[i + 2] * contrast + intercept;
    }
  }

  buildPixelData() {
    this.pixelData = [];
    this.positionSets = []; // Initialize position sets array

    // Convert each pixel to brightness value (0-1) and store RGB
    for (let i = 0; i < this.options.width * this.options.height; i++) {
      // Extract R, G, B values
      const r = this.imgData[i * 4];
      const g = this.imgData[i * 4 + 1];
      const b = this.imgData[i * 4 + 2];

      // Calculate average brightness
      const avg = (r + g + b) / 3;

      // Normalize to 0-1
      const pctg = Math.ceil(avg / 255 * 100) / 100;

      this.pixelData.push({
        brightness: pctg,
        r: Math.round(r),
        g: Math.round(g),
        b: Math.round(b)
      });

      // Initialize each position to character set 0
      this.positionSets.push(0);
    }
  }

  buildAsciiData() {
    const asciiData = [];

    for (let i = 0; i < this.pixelData.length; i++) {
      // Get character set for this position (for cycling)
      const setIndex = this.positionSets[i] || 0;
      const steps = this.characterSets[setIndex];

      const pixel = this.pixelData[i];

      // Map brightness to character - INVERTED so bright pixels get light chars
      let char;
      const invertedBrightness = 1 - pixel.brightness;
      if (invertedBrightness >= 1) {
        char = steps[steps.length - 1];
      } else {
        char = steps[Math.floor(invertedBrightness * steps.length)];
      }

      // Apply duotone color mapping
      const duotoneColor = getDuotoneColor(pixel.brightness);

      asciiData.push({
        char: char,
        brightness: pixel.brightness,
        r: duotoneColor.r,
        g: duotoneColor.g,
        b: duotoneColor.b
      });
    }

    return {
      data: asciiData,
      width: this.options.width,
      height: this.options.height
    };
  }

  // Swap to next character set for random positions (mousemove feature)
  swapCharacterSet() {
    // Calculate how many positions to swap (20% of total)
    const totalPositions = this.positionSets.length;
    const swapCount = Math.floor(totalPositions * 0.2);

    // Create array of all position indices
    const allIndices = Array.from({ length: totalPositions }, (_, i) => i);

    // Randomly select 20% of positions to swap
    const indicesToSwap = [];
    for (let i = 0; i < swapCount; i++) {
      const randomIndex = Math.floor(Math.random() * allIndices.length);
      indicesToSwap.push(allIndices[randomIndex]);
      allIndices.splice(randomIndex, 1);  // Remove to avoid duplicates
    }

    // Swap selected positions to next character set
    indicesToSwap.forEach(index => {
      this.positionSets[index] = (this.positionSets[index] + 1) % this.characterSets.length;
    });

    // Rebuild ASCII data with new characters (reuses existing pixel data)
    return this.buildAsciiData();
  }
}

// ============================================
// MORPHING SYSTEM
// ============================================

class MorphingAscii {
  constructor() {
    this.asciiArt = document.getElementById('asciiArt');
    this.imageNameDisplay = document.getElementById('imageName');
    this.images = Array.from(document.querySelectorAll('.source-img'));
    this.unit = document.querySelector('.ascii-unit');

    this.asciiDataCache = [];
    this.asciiInstances = []; // Store Ascii instances for character cycling
    this.isInitialized = false;
    this.currentImageIndex = 0;
    this.targetImageIndex = 0;

    // Transition animation state
    this.isTransitioning = false;
    this.transitionProgress = 0;
    this.transitionDuration = TRANSITION_DURATION;
    this.transitionStartTime = 0;

    // Initial load animation state
    this.isInitialLoad = true;

    // Extract image names from src attributes
    this.imageNames = this.images.map(img => {
      const src = img.getAttribute('src');
      return src.split('/').pop(); // Get filename only
    });

    // Calculate dimensions
    this.calculateDimensions();

    // Bind handlers
    this.handleClick = this.handleClick.bind(this);
    this.animate = this.animate.bind(this);
  }

  calculateDimensions() {
    // Get character dimensions from the fixed CSS font size
    const unitRect = this.unit.getBoundingClientRect();
    this.charWidth = unitRect.width;
    this.charHeight = unitRect.height;

    // Calculate viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Store viewport dimensions - we'll use these to calculate per-image grids
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;

    // Character aspect ratio (width/height)
    this.charAspectRatio = this.charWidth / this.charHeight;

    console.log(`Character size: ${this.charWidth}x${this.charHeight}px (aspect: ${this.charAspectRatio.toFixed(2)})`);
    console.log(`Viewport: ${viewportWidth}x${viewportHeight}px (aspect: ${(viewportWidth/viewportHeight).toFixed(2)})`);
  }

  async init() {
    console.log('Initializing Morphing ASCII...');

    // Wait for all images to load
    await Promise.all(this.images.map(img => {
      if (img.complete && img.naturalHeight !== 0) {
        return Promise.resolve();
      }
      return new Promise(resolve => {
        img.addEventListener('load', resolve);
      });
    }));

    // Calculate dimensions for ASCII grid
    // All images must use the same grid dimensions for morphing to work

    // Calculate actual glyph ratio from real character dimensions
    // glyphRatio = charWidth / charHeight
    const glyphRatio = this.charAspectRatio;
    console.log(`Using actual glyph ratio: ${glyphRatio.toFixed(3)} (was hardcoded to 0.45)`);

    // Calculate grid dimensions to fill viewport
    const gridWidth = Math.ceil(this.viewportWidth / this.charWidth);
    const gridHeight = Math.ceil(this.viewportHeight / this.charHeight);

    // Store grid dimensions for text masking
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;

    // Calculate resulting pixel dimensions
    const pixelWidth = gridWidth * this.charWidth;
    const pixelHeight = gridHeight * this.charHeight;
    const gridPixelAspect = pixelWidth / pixelHeight;

    console.log(`Grid: ${gridWidth}x${gridHeight} characters`);
    console.log(`Grid rendered size: ${pixelWidth.toFixed(0)}x${pixelHeight.toFixed(0)}px`);
    console.log(`Grid pixel aspect: ${gridPixelAspect.toFixed(2)}, viewport aspect: ${(this.viewportWidth / this.viewportHeight).toFixed(2)}`);

    // Convert all images to ASCII data using the same grid dimensions
    for (const img of this.images) {
      const imageAspect = img.naturalWidth / img.naturalHeight;
      console.log(`Image ${img.dataset.index} natural aspect: ${imageAspect.toFixed(2)}`);

      const ascii = new Ascii(img, {
        width: gridWidth,
        height: gridHeight,
        fit: 'cover',
        glyphRatio: glyphRatio
      });

      ascii.init();
      const asciiData = ascii.build();
      this.asciiDataCache.push(asciiData);
      this.asciiInstances.push(ascii); // Store instance for character cycling

      console.log(`Converted image ${img.dataset.index} to ASCII`);
    }

    this.isInitialized = true;

    // Start click listener
    const asciiContainer = document.querySelector('.ascii-container');
    asciiContainer.addEventListener('click', this.handleClick);
    window.addEventListener('resize', () => this.handleResize());

    // Add mousemove listener for character cycling
    this.setupMousemove();

    console.log('Morphing ASCII initialized successfully!');

    // Start initial load animation sequence
    this.startInitialLoadSequence();
  }

  setupMousemove() {
    let lastMouseX = 0;
    let lastMouseY = 0;
    let totalDistance = 0;

    document.addEventListener('mousemove', (e) => {
      // Only allow character swapping when NOT transitioning and NOT during initial load
      if (this.isTransitioning || this.isInitialLoad) {
        return;
      }

      // Calculate distance moved since last position
      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Accumulate distance
      totalDistance += distance;

      // Update last position
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;

      // Trigger swap when total distance exceeds 5px
      if (totalDistance >= 10) {
        totalDistance = 0; // Reset counter

        // Swap characters on the current displayed image only
        const fromAscii = this.asciiInstances[this.currentImageIndex];

        if (fromAscii) {
          const newFromData = fromAscii.swapCharacterSet();
          this.asciiDataCache[this.currentImageIndex] = newFromData;
        }

        // Also update title text characters on mousemove
        cycleTextCharacters();

        // Re-render with updated character sets (unified grid)
        this.render(0);
      }
    });
  }

  handleClick() {
    // Move to next image on each click
    const nextIndex = (this.targetImageIndex + 1) % this.asciiDataCache.length;
    this.startTransition(nextIndex);
  }

  startTransition(newTargetIndex) {
    this.currentImageIndex = this.targetImageIndex;
    this.targetImageIndex = newTargetIndex;
    this.isTransitioning = true;
    this.transitionProgress = 0;
    this.transitionStartTime = performance.now();

    // Change to a random color pair for this transition (images only)
    setRandomColorPair();

    // Rebuild ASCII data for both images with new colors
    const fromAscii = this.asciiInstances[this.currentImageIndex];
    const toAscii = this.asciiInstances[this.targetImageIndex];

    if (fromAscii) {
      this.asciiDataCache[this.currentImageIndex] = fromAscii.build();
    }
    if (toAscii) {
      this.asciiDataCache[this.targetImageIndex] = toAscii.build();
    }

    // Generate stable switching thresholds for each position (organic, non-flickering animation)
    const totalPositions = this.gridWidth * this.gridHeight;
    this.switchThresholds = new Array(totalPositions);
    for (let i = 0; i < totalPositions; i++) {
      // Bias toward later switching (0.3-1.0 range) for smooth reveal
      this.switchThresholds[i] = 0.3 + Math.pow(Math.random(), 1.5) * 0.7;
    }

    // Prepare text overlay transition with new random character positions (stays black and white)
    prepareTextTransition();

    // Immediately render with new colors at the start of transition (unified grid)
    this.render(0);

    console.log(`Starting transition: ${this.currentImageIndex} → ${this.targetImageIndex}`);

    // Start animation loop
    this.animate();
  }

  animate() {
    if (!this.isTransitioning) return;

    const now = performance.now();
    const elapsed = now - this.transitionStartTime;
    this.transitionProgress = Math.min(elapsed / this.transitionDuration, 1);

    // Ease-in-out function for smooth transition
    const eased = this.easeInOutCubic(this.transitionProgress);

    // Render morphed state (unified grid with text)
    this.render(eased);

    // Update image name during transition
    if (this.transitionProgress >= 0.5) {
      this.updateImageName(this.targetImageIndex);
    }

    // Check if transition is complete
    if (this.transitionProgress >= 1) {
      this.isTransitioning = false;
      this.currentImageIndex = this.targetImageIndex;
      console.log(`Transition complete. Current image: ${this.currentImageIndex}`);
    } else {
      // Continue animation
      requestAnimationFrame(this.animate);
    }
  }

  // Initial load animation sequence
  startInitialLoadSequence() {
    console.log('Starting initial load sequence...');

    // Reset to first image
    this.currentImageIndex = 0;
    this.targetImageIndex = 0;

    // Phase 1: Show text only for 1 second
    this.updateImageName(0);
    this.renderWithRevealMask(new Set()); // Render with no image characters visible (text only)

    // Phase 2: After 1 second, reveal image characters randomly over 1 second
    setTimeout(() => {
      console.log('Revealing image characters randomly...');

      const fromData = this.asciiDataCache[this.currentImageIndex];
      const totalCharacters = fromData.width * fromData.height;

      // Create array of all character positions (excluding text positions)
      const morphedText = morphTextData(1);
      const textMask = morphedText
        ? calculateTextMask(morphedText, this.gridWidth, this.gridHeight, this.charWidth, this.charHeight)
        : new Map();

      const availablePositions = [];
      for (let i = 0; i < totalCharacters; i++) {
        const x = i % fromData.width;
        const y = Math.floor(i / fromData.width);
        const key = `${x},${y}`;

        // Only include positions that don't have text
        if (!textMask.has(key)) {
          availablePositions.push(i);
        }
      }

      // Shuffle positions for random reveal
      const shuffledPositions = this.shuffleArray([...availablePositions]);

      const revealStartTime = performance.now();
      const revealDuration = 1000; // 1 second
      const revealedSet = new Set();

      const revealAnimation = () => {
        const elapsed = performance.now() - revealStartTime;
        const progress = Math.min(elapsed / revealDuration, 1);

        // Calculate how many characters should be revealed at this point
        const targetCount = Math.floor(progress * shuffledPositions.length);

        // Add newly revealed positions
        for (let i = revealedSet.size; i < targetCount; i++) {
          revealedSet.add(shuffledPositions[i]);
        }

        // Render with current reveal mask
        this.renderWithRevealMask(revealedSet);

        if (progress < 1) {
          requestAnimationFrame(revealAnimation);
        } else {
          console.log('Initial load complete');
          this.isInitialLoad = false;
          // Final render without mask (normal rendering)
          this.render(0);
        }
      };

      revealAnimation();
    }, 1000); // 1 second pause
  }

  // Helper function to shuffle array
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  render(progress = 0) {
    const fromIndex = this.currentImageIndex;
    const toIndex = this.targetImageIndex;

    const fromData = this.asciiDataCache[fromIndex];
    const toData = this.asciiDataCache[toIndex];

    // Get morphed text data for masking
    // When not transitioning, use currentTextData directly to show mousemove animations
    const morphedText = this.isTransitioning
      ? morphTextData(progress)
      : currentTextData;

    // Calculate text mask positions
    const textMask = morphedText
      ? calculateTextMask(morphedText, this.gridWidth, this.gridHeight, this.charWidth, this.charHeight)
      : new Map();

    // Morph between the two images with text masking
    const morphedHTML = this.morphCharactersUnified(fromData, toData, progress, textMask);

    // Update DOM (unified grid - single element)
    this.asciiArt.innerHTML = morphedHTML;
  }

  // Render with reveal mask for initial load animation
  renderWithRevealMask(revealedPositions) {
    const fromIndex = this.currentImageIndex;
    const fromData = this.asciiDataCache[fromIndex];

    // Get text data for masking
    const morphedText = morphTextData(1);

    // Calculate text mask positions
    const textMask = morphedText
      ? calculateTextMask(morphedText, this.gridWidth, this.gridHeight, this.charWidth, this.charHeight)
      : new Map();

    // Render with reveal mask
    const morphedHTML = this.morphCharactersWithReveal(fromData, textMask, revealedPositions);

    // Update DOM
    this.asciiArt.innerHTML = morphedHTML;
  }

  // Morph characters with reveal mask (for initial load)
  morphCharactersWithReveal(fromData, textMask, revealedPositions) {
    let result = '';
    const width = fromData.width;
    const height = fromData.height;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        const key = `${x},${y}`;

        // Check if this position has text
        const textCell = textMask.get(key);

        if (textCell) {
          // Render text character (inherit color from parent)
          result += textCell.char;
        } else if (revealedPositions.has(i)) {
          // Render revealed image character
          const char = fromData.data[i];
          result += char.char;
        } else {
          // Not yet revealed - render as space
          result += ' ';
        }
      }

      // Add newline at end of each row
      result += '\n';
    }

    return result;
  }

  morphCharactersUnified(fromData, toData, progress, textMask) {
    let result = '';
    const width = fromData.width;
    const height = fromData.height;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        const key = `${x},${y}`;

        // Check if this position has text
        const textCell = textMask.get(key);

        if (textCell) {
          // Render text character (inherit color from parent)
          result += textCell.char;
        } else {
          // Render image character
          const fromChar = fromData.data[i];
          const toChar = toData.data[i];

          // Interpolate between characters
          const morphed = this.interpolateCharacter(
            fromChar,
            toChar,
            progress,
            i
          );

          // Generate character (inherit color from parent)
          result += morphed.char;
        }
      }

      // Add newline at end of each row
      result += '\n';
    }

    return result;
  }

  interpolateCharacter(from, to, progress, positionIndex) {
    // Interpolate brightness
    const interpolatedBrightness = from.brightness + (to.brightness - from.brightness) * progress;

    // Use pre-generated stable switching threshold for smooth, organic transitions
    const switchThreshold = this.switchThresholds?.[positionIndex] ?? 0.5;

    let char;
    if (progress < switchThreshold) {
      // Still showing source character - use interpolated brightness with source's character set
      const currentAscii = this.asciiInstances[this.currentImageIndex];
      const setIndex = (currentAscii && currentAscii.positionSets[positionIndex]) || 0;
      const steps = CHARACTER_SETS[setIndex];

      // Map brightness to character - INVERTED so bright pixels get light chars
      const invertedBrightness = 1 - interpolatedBrightness;
      if (invertedBrightness >= 1) {
        char = steps[steps.length - 1];
      } else {
        char = steps[Math.floor(invertedBrightness * steps.length)];
      }
    } else {
      // Switch to target character - use the exact character from target image
      char = to.char;
    }

    // Apply duotone color mapping to interpolated brightness
    const duotoneColor = getDuotoneColor(interpolatedBrightness);

    return {
      char: char,
      brightness: interpolatedBrightness,
      r: duotoneColor.r,
      g: duotoneColor.g,
      b: duotoneColor.b
    };
  }

  updateImageName(imageIndex) {
    // Only update if the image has changed
    if (imageIndex !== this.currentImageIndex) {
      this.currentImageIndex = imageIndex;
      this.imageNameDisplay.textContent = this.imageNames[imageIndex];
    }
  }

  handleResize() {
    // Debounce resize for performance
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.calculateDimensions();
      this.isInitialized = false;
      this.asciiDataCache = [];
      this.asciiInstances = [];
      this.init();
    }, 300);
  }
}

// ============================================
// TEXT OVERLAY RENDERING (Unified Grid System)
// ============================================

// Store text overlay states for morphing
let currentTextData = null;
let targetTextData = null;

// Generate new text data
function generateTextData() {
  const asciiText = new AsciiTextOverlay(TEXT_OVERLAY, TITLE_CHARACTER_SET);
  return asciiText.convert();
}

// Track the last used title character set index to avoid repeats
let lastTitleCharSetIndex = 0;

// Prepare new text transition
function prepareTextTransition() {
  // Deep copy targetTextData to currentTextData to avoid shared references
  if (targetTextData) {
    currentTextData = targetTextData.map(row =>
      row.map(cell => ({ ...cell }))
    );
  } else {
    currentTextData = generateTextData();
  }

  // Randomly select a different character set from TITLE_CHARACTER_SETS
  let newIndex;
  if (TITLE_CHARACTER_SETS.length > 1) {
    do {
      newIndex = Math.floor(Math.random() * TITLE_CHARACTER_SETS.length);
    } while (newIndex === lastTitleCharSetIndex);
  } else {
    newIndex = 0;
  }

  lastTitleCharSetIndex = newIndex;

  // Generate new text data with the selected character set
  const selectedCharSet = TITLE_CHARACTER_SETS[newIndex];
  const asciiText = new AsciiTextOverlay(TEXT_OVERLAY, selectedCharSet);
  targetTextData = asciiText.convert();

  console.log(`Text transition prepared with character set ${newIndex}`);
}

// Cycle text characters on mousemove (randomly swap some character positions)
function cycleTextCharacters() {
  if (!currentTextData) return;

  // Randomly select a character set from TITLE_CHARACTER_SETS
  const randomSetIndex = Math.floor(Math.random() * TITLE_CHARACTER_SETS.length);
  const selectedCharSet = TITLE_CHARACTER_SETS[randomSetIndex];

  // Recreate currentTextData with new random character assignments
  // This simulates the character cycling effect
  const height = currentTextData.length;

  for (let y = 0; y < height; y++) {
    const row = currentTextData[y];
    const width = row.length;

    for (let x = 0; x < width; x++) {
      const cell = row[x];

      // Only update cells that have text
      if (cell && cell.isText) {
        // 20% chance to swap this character (matching image character swap rate)
        if (Math.random() < 0.2) {
          // Pick a random character from the selected set, biased towards denser characters
          const biasedRandom = Math.pow(Math.random(), 0.25);
          const charIndex = Math.floor(biasedRandom * selectedCharSet.length);
          // Ensure we don't exceed array bounds
          const safeIndex = Math.min(charIndex, selectedCharSet.length - 1);
          cell.char = selectedCharSet[safeIndex];
        }
      }
    }
  }
}

// Calculate text mask positions in the main grid
// Returns a Map of grid positions (as "x,y" strings) to text data
function calculateTextMask(textData, gridWidth, gridHeight, charWidth, charHeight) {
  const mask = new Map();

  // If title is hidden, return empty mask so image ASCII fills the entire space
  if (!isTitleVisible) return mask;

  if (!textData || textData.length === 0) return mask;

  // Calculate text dimensions in characters
  const textWidthChars = textData[0].length;
  const textHeightChars = textData.length;

  // Calculate center position in the viewport
  const viewportCenterX = Math.floor(gridWidth / 2);
  const viewportCenterY = Math.floor(gridHeight / 2);

  // Calculate text starting position (top-left corner)
  const textStartX = viewportCenterX - Math.floor(textWidthChars / 2);
  const textStartY = viewportCenterY - Math.floor(textHeightChars / 2);

  // Map text characters to grid positions
  for (let y = 0; y < textHeightChars; y++) {
    for (let x = 0; x < textWidthChars; x++) {
      const gridX = textStartX + x;
      const gridY = textStartY + y;

      // Only include positions within grid bounds
      if (gridX >= 0 && gridX < gridWidth && gridY >= 0 && gridY < gridHeight) {
        const textCell = textData[y][x];

        // Only mask positions that have actual text characters
        if (textCell && textCell.isText) {
          const key = `${gridX},${gridY}`;
          mask.set(key, textCell);
        }
      }
    }
  }

  console.log(`Text mask calculated: ${mask.size} positions occupied`);
  return mask;
}

// Morph text overlay data based on transition progress
// Returns morphed text data (but doesn't render - that happens in unified grid)
function morphTextData(progress) {
  if (!currentTextData || !targetTextData) return null;

  const height = Math.min(currentTextData.length, targetTextData.length);
  const morphedData = [];

  for (let y = 0; y < height; y++) {
    const fromRow = currentTextData[y];
    const toRow = targetTextData[y];
    const width = Math.min(fromRow.length, toRow.length);
    const morphedRow = [];

    for (let x = 0; x < width; x++) {
      const fromCell = fromRow[x];
      const toCell = toRow[x];

      // If this is part of the text
      if (fromCell.isText || toCell.isText) {
        // Use the swap timing from whichever cell has text
        const swapTiming = fromCell.isText ? fromCell.swapTiming : toCell.swapTiming;
        const swapThreshold = swapTiming || 0.5;

        // Pick character based on swap timing
        let char;
        if (progress < swapThreshold) {
          char = fromCell.isText ? fromCell.char : ' ';
        } else {
          char = toCell.isText ? toCell.char : ' ';
        }

        morphedRow.push({
          char,
          isText: fromCell.isText || toCell.isText,
          swapTiming
        });
      } else {
        // Empty space
        morphedRow.push({ char: ' ', isText: false, swapTiming: 0 });
      }
    }
    morphedData.push(morphedRow);
  }

  return morphedData;
}

// ============================================
// SCREEN RECORDING
// ============================================

let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;
let displayStream = null;

async function startRecording() {
  try {
    // Capture the current tab/window
    // Note: Don't specify mediaSource to allow user to choose tab, window, or screen
    displayStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        frameRate: 60,
        displaySurface: 'browser' // Prefer browser tab
      },
      audio: false,
      preferCurrentTab: true // Chrome-specific hint to show current tab
    });

    // Set up MediaRecorder
    const options = {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 8000000 // 8 Mbps for good quality
    };

    // Fallback to vp8 if vp9 not supported
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = 'video/webm;codecs=vp8';
    }

    mediaRecorder = new MediaRecorder(displayStream, options);
    recordedChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      // Create blob and download
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);

      // Create download link
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `anacycle-recording-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      // Stop all tracks
      displayStream.getTracks().forEach(track => track.stop());
      displayStream = null;

      console.log('Recording saved and stream stopped');
    };

    // Start recording
    mediaRecorder.start();
    isRecording = true;

    console.log('Recording started - press SPACE again to stop');

  } catch (err) {
    console.error('Error starting recording:', err);
    isRecording = false;
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    isRecording = false;
    console.log('Recording stopped - saving file...');
  }
}

function toggleRecording() {
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
}

// ============================================
// MINIMAL MODE TOGGLE
// ============================================

function toggleMinimalMode() {
  isMinimalMode = !isMinimalMode;
  document.body.classList.toggle('minimal-mode', isMinimalMode);

  // Re-render current state with new mode (unified grid)
  if (window.morphingInstance) {
    window.morphingInstance.render(0);
  }

  console.log(`Minimal mode: ${isMinimalMode ? 'ON' : 'OFF'}`);
}

// ============================================
// FONT CONTROLS
// ============================================

// Change font settings for both title and ASCII characters
async function changeFontSettings(fontFamily, fontWeight) {
  // Update JavaScript variables
  TITLE_FONT_FAMILY = fontFamily;
  TITLE_FONT_WEIGHT = parseInt(fontWeight);

  // Update CSS body font
  document.body.style.fontFamily = `'${fontFamily}', Courier, monospace`;
  document.body.style.fontWeight = fontWeight;

  // Wait for font to load
  try {
    await document.fonts.load(`${TITLE_FONT_WEIGHT} 90px "${TITLE_FONT_FAMILY}"`);
    console.log(`${TITLE_FONT_FAMILY} (${TITLE_FONT_WEIGHT}) loaded`);
  } catch (err) {
    console.warn('Font loading failed:', err);
  }

  // Regenerate text data with new font
  currentTextData = generateTextData();
  targetTextData = generateTextData();

  // Re-render with new font
  if (window.morphingInstance) {
    window.morphingInstance.render(0);
  }

  console.log(`Font changed to: ${fontFamily} ${fontWeight}`);
}

// Toggle UI visibility
function toggleUIVisibility() {
  const ui = document.getElementById('ui');
  if (ui) {
    ui.classList.toggle('hidden');
  }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  // Set initial random color pair
  setRandomColorPair();

  // Populate the hidden images from _thumbnails
  populateHiddenImages();

  // Set initial image name
  const imageNameDisplay = document.getElementById('imageName');
  if (THUMBNAIL_IMAGES.length > 0) {
    imageNameDisplay.textContent = THUMBNAIL_IMAGES[0];
  }

  // Wait for custom font to load
  try {
    await document.fonts.load(`${TITLE_FONT_WEIGHT} 90px "${TITLE_FONT_FAMILY}"`);
    console.log(`${TITLE_FONT_FAMILY} font loaded`);
  } catch (err) {
    console.warn('Font loading failed, falling back to sans-serif:', err);
  }

  // Initialize the morphing system after images are loaded
  window.addEventListener('load', () => {
    const morphing = new MorphingAscii();
    window.morphingInstance = morphing; // Store globally for toggle function

    // Initialize text overlay data (needed before init for initial render)
    currentTextData = generateTextData();
    targetTextData = generateTextData(); // Generate separate copy to avoid shared reference

    morphing.init();
  });

  // Add spacebar listener to toggle UI visibility
  document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && event.target === document.body) {
      event.preventDefault(); // Prevent page scroll
      toggleUIVisibility();
    }

    // Add 'r' key listener to re-initiate loading animation
    if (event.key === 'r' && event.target === document.body) {
      if (window.morphingInstance) {
        window.morphingInstance.isInitialLoad = true;
        window.morphingInstance.startInitialLoadSequence();
      }
    }
  });

  // Add font control listeners
  const fontFamilySelect = document.getElementById('fontFamily');
  const fontWeightSelect = document.getElementById('fontWeight');
  const backgroundColorSelect = document.getElementById('backgroundColor');

  if (fontFamilySelect && fontWeightSelect) {
    // Set initial values
    fontFamilySelect.value = TITLE_FONT_FAMILY;
    fontWeightSelect.value = TITLE_FONT_WEIGHT.toString();

    // Update available weights based on font family
    function updateWeightOptions(fontFamily) {
      const sharpEarthWeights = ['200', '300', '400', '500', '700', '800'];
      const modernGothicWeights = ['200', '300', '500'];

      const weights = fontFamily === 'Modern Gothic Mono' ? modernGothicWeights : sharpEarthWeights;
      const currentWeight = fontWeightSelect.value;

      // Clear and rebuild options
      fontWeightSelect.innerHTML = '';
      weights.forEach(weight => {
        const option = document.createElement('option');
        option.value = weight;
        const labels = {
          '200': '200 - Thin',
          '300': '300 - Light',
          '400': '400 - Regular',
          '500': '500 - Medium',
          '700': '700 - Bold',
          '800': '800 - Extra Bold'
        };
        option.textContent = labels[weight];
        fontWeightSelect.appendChild(option);
      });

      // Restore previous weight if available, otherwise select first option
      if (weights.includes(currentWeight)) {
        fontWeightSelect.value = currentWeight;
      } else {
        fontWeightSelect.value = weights[0];
      }
    }

    // Font family change handler
    fontFamilySelect.addEventListener('change', (event) => {
      event.stopPropagation();
      updateWeightOptions(event.target.value);
      changeFontSettings(fontFamilySelect.value, fontWeightSelect.value);
    });

    // Font weight change handler
    fontWeightSelect.addEventListener('change', (event) => {
      event.stopPropagation();
      changeFontSettings(fontFamilySelect.value, fontWeightSelect.value);
    });

    // Initialize weight options
    updateWeightOptions(TITLE_FONT_FAMILY);
  }

  // Background color change handler
  if (backgroundColorSelect) {
    backgroundColorSelect.addEventListener('change', (event) => {
      event.stopPropagation();
      const color = event.target.value;
      const filter = document.querySelector('.filter');
      const asciiArt = document.querySelector('.ascii-art');

      if (color === 'inverted') {
        // Inverted: black background, white characters, filter lightens to color
        document.body.style.backgroundColor = '#000';
        if (filter) {
          filter.style.opacity = '1';
          filter.style.mixBlendMode = 'lighten';
          filter.style.animation = 'colorCycle 66s linear infinite';
          filter.style.zIndex = '100';
        }
        if (asciiArt) {
          asciiArt.style.color = '#fff';
          asciiArt.style.mixBlendMode = 'normal';
          asciiArt.style.animation = 'none';
        }
      } else if (color === 'black-inverted') {
        // Black-inverted: filter color background, black characters
        document.body.style.backgroundColor = '#fff';
        if (filter) {
          filter.style.opacity = '1';
          filter.style.mixBlendMode = 'normal';
          filter.style.animation = 'colorCycle 66s linear infinite';
          filter.style.zIndex = '5';
        }
        if (asciiArt) {
          asciiArt.style.color = '#000';
          asciiArt.style.mixBlendMode = 'normal';
          asciiArt.style.animation = 'none';
        }
      } else if (color === 'black') {
        // Black: black background, colored characters
        document.body.style.backgroundColor = '#000';
        if (filter) {
          filter.style.opacity = '0';
          filter.style.mixBlendMode = 'normal';
          filter.style.animation = 'none';
        }
        if (asciiArt) {
          asciiArt.style.color = '';
          asciiArt.style.mixBlendMode = 'normal';
          asciiArt.style.animation = 'textColorCycle 66s linear infinite';
        }
      } else {
        // White background: normal mode
        document.body.style.backgroundColor = '#fff';
        if (filter) {
          filter.style.opacity = '1';
          filter.style.mixBlendMode = 'lighten';
          filter.style.animation = 'colorCycle 66s linear infinite';
          filter.style.zIndex = '100';
        }
        if (asciiArt) {
          asciiArt.style.color = '#000';
          asciiArt.style.mixBlendMode = 'normal';
          asciiArt.style.animation = 'none';
        }
      }

      console.log(`Background color changed to: ${color}`);

      // Re-initiate loading animation
      if (window.morphingInstance) {
        window.morphingInstance.isInitialLoad = true;
        window.morphingInstance.startInitialLoadSequence();
      }
    });
  }

  // Title toggle handler
  const titleToggle = document.getElementById('titleToggle');
  if (titleToggle) {
    titleToggle.addEventListener('change', (event) => {
      event.stopPropagation();
      isTitleVisible = event.target.checked;

      console.log(`Title visibility changed to: ${isTitleVisible}`);

      // Re-initiate loading animation
      if (window.morphingInstance) {
        window.morphingInstance.isInitialLoad = true;
        window.morphingInstance.startInitialLoadSequence();
      }
    });
  }
});
