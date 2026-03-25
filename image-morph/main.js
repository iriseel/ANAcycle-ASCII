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

// Animation timing constants
const DENSITY_FADE_TARGET = 15; // Target density percentage for fade animation
const DENSITY_FADE_DURATION = 1500; // Density fade animation duration in ms
const REVEAL_PAUSE_DURATION = 1000; // Pause before revealing image on initial load (ms)
const REVEAL_ANIMATION_DURATION = 1000; // Image reveal animation duration in ms

// Color pair sets for duotone effects
const COLOR_SET = [
  {
    name: 'Blue & Yellow',
    dark: { r: 30, g: 80, b: 200 },
    light: { r: 255, g: 220, b: 60 }
  },
  {
    name: 'Pink & Green',
    dark: { r: 255, g: 61, b: 130 },
    light: { r: 0, g: 255, b: 147 }
  },
  {
    name: 'Violet & Orange',
    dark: { r: 138, g: 43, b: 226 },
    light: { r: 255, g: 140, b: 0 }
  },
  {
    name: 'Red & Green',
    dark: { r: 220, g: 20, b: 60 },
    light: { r: 50, g: 205, b: 50 }
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

// Text overlay configuration
const TEXT_OVERLAY = 'ANAcycle';

// Title font family (used for text overlay rendering)
const TITLE_FONT_FAMILY = 'Modern Gothic';

// Title font weight (used for text overlay rendering)
const TITLE_FONT_WEIGHT = 800;

// Mouse interaction radius (in pixels) - controls how far from the cursor characters will animate
const MOUSE_INTERACTION_RADIUS = 150;

// Title visibility state
let isTitleVisible = true;

// Image visibility state
let isImageVisible = true;

// Density control state (0-100, where 100 = full density)
let characterDensity = 100;

// ============================================
// DUOTONE COLOR MAPPING
// ============================================

// Track the last used color pair index to avoid repeats
let lastColorIndex = -1;

// Store old and new color pairs for interpolation during transition
let oldColorPair = null;
let newColorPair = null;

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

  // Store old color pair for interpolation
  oldColorPair = {
    dark: { ...DUOTONE.dark },
    light: { ...DUOTONE.light }
  };

  // Store new color pair for interpolation
  newColorPair = {
    dark: { ...selectedPair.dark },
    light: { ...selectedPair.light }
  };

  console.log(`Color pair transition: → ${selectedPair.name}`);
  return selectedPair;
}

// Interpolate between old and new color pairs during transition
function interpolateColorPairs(progress) {
  // If no transition data, use current DUOTONE
  if (!oldColorPair || !newColorPair) {
    return;
  }

  // Interpolate dark color
  DUOTONE.dark.r = Math.round(oldColorPair.dark.r + (newColorPair.dark.r - oldColorPair.dark.r) * progress);
  DUOTONE.dark.g = Math.round(oldColorPair.dark.g + (newColorPair.dark.g - oldColorPair.dark.g) * progress);
  DUOTONE.dark.b = Math.round(oldColorPair.dark.b + (newColorPair.dark.b - oldColorPair.dark.b) * progress);

  // Interpolate light color
  DUOTONE.light.r = Math.round(oldColorPair.light.r + (newColorPair.light.r - oldColorPair.light.r) * progress);
  DUOTONE.light.g = Math.round(oldColorPair.light.g + (newColorPair.light.g - oldColorPair.light.g) * progress);
  DUOTONE.light.b = Math.round(oldColorPair.light.b + (newColorPair.light.b - oldColorPair.light.b) * progress);
}

// Reusable color object to reduce GC pressure
const reusableColor = { r: 0, g: 0, b: 0 };

// Map brightness (0-1) to duotone colors (returns reusable object)
function getDuotoneColor(brightness) {
  // Interpolate between dark and light colors based on brightness
  const t = brightness; // 0 = dark, 1 = light

  reusableColor.r = Math.round(DUOTONE.dark.r + (DUOTONE.light.r - DUOTONE.dark.r) * t);
  reusableColor.g = Math.round(DUOTONE.dark.g + (DUOTONE.light.g - DUOTONE.dark.g) * t);
  reusableColor.b = Math.round(DUOTONE.dark.b + (DUOTONE.light.b - DUOTONE.dark.b) * t);

  return reusableColor;
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
    // Calculate font size as 10vmin (11% of the smaller viewport dimension)
    const vmin = Math.min(window.innerWidth, window.innerHeight);
    const fontSize = vmin * 0.11;    ctx.font = `${TITLE_FONT_WEIGHT} ${fontSize}px '${TITLE_FONT_FAMILY}', sans-serif`;

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
    ctx.font = `${TITLE_FONT_WEIGHT} ${fontSize}px '${TITLE_FONT_FAMILY}', sans-serif`;
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
    const sampleRateX = 5;  // Lower value = wider spacing (more horizontal stretch)
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
    img.src = `../assets/thumbnails/${filename}`;
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

    // Store character dimensions (will be set by MorphingAscii)
    this.charWidth = null;
    this.charHeight = null;

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

  // Swap to next character set for positions within radius of mouse (mousemove feature)
  swapCharacterSet(mouseX = null, mouseY = null, radius = 300) {
    const totalPositions = this.positionSets.length;

    // If no mouse position provided, use old behavior (20% random)
    if (mouseX === null || mouseY === null) {
      const swapCount = Math.floor(totalPositions * 0.2);
      const allIndices = Array.from({ length: totalPositions }, (_, i) => i);
      const indicesToSwap = [];

      for (let i = 0; i < swapCount; i++) {
        const randomIndex = Math.floor(Math.random() * allIndices.length);
        indicesToSwap.push(allIndices[randomIndex]);
        allIndices.splice(randomIndex, 1);
      }

      indicesToSwap.forEach(index => {
        this.positionSets[index] = (this.positionSets[index] + 1) % this.characterSets.length;
      });

      return this.buildAsciiData();
    }

    // New behavior: only swap characters within radius of mouse
    const indicesToSwap = [];

    for (let i = 0; i < totalPositions; i++) {
      const x = i % this.options.width;
      const y = Math.floor(i / this.options.width);

      // Calculate pixel position of this character
      const charPixelX = x * this.charWidth;
      const charPixelY = y * this.charHeight;

      // Calculate distance from mouse
      const dx = charPixelX - mouseX;
      const dy = charPixelY - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If within radius, add to swap list
      if (distance <= radius) {
        indicesToSwap.push(i);
      }
    }

    // Randomly swap 30% of characters within radius
    const swapCount = Math.floor(indicesToSwap.length * 0.3);
    const shuffled = indicesToSwap.sort(() => Math.random() - 0.5);
    const toSwap = shuffled.slice(0, swapCount);

    toSwap.forEach(index => {
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

    // Resizing state - blocks all interactions during resize
    this.isResizing = false;

    // Density fade animation state
    this.isDensityAnimating = false;

    // Performance caches
    this.textMaskCache = null;
    this.densityMaskCache = null;
    this.lastCachedDensity = -1;

    // Calculate dimensions
    this.calculateDimensions();

    // Bind handlers
    this.handleClick = this.handleClick.bind(this);
    this.animate = this.animate.bind(this);
  }

  calculateDimensions() {
    // Force a reflow to ensure we get the latest CSS values
    // This is critical when CSS media queries change --ascii-unit
    this.unit.offsetHeight; // Trigger reflow

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

      // Pass character dimensions to ascii instance
      ascii.charWidth = this.charWidth;
      ascii.charHeight = this.charHeight;

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

    // Add scroll listener for density fade animation
    this.setupScroll();

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
      // Block all mousemove processing during resize, transition, or initial load
      if (this.isResizing || this.isTransitioning || this.isInitialLoad) {
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

      // Trigger swap when total distance exceeds 10px
      if (totalDistance >= 10) {
        totalDistance = 0; // Reset counter

        // Swap characters on the current displayed image only, within radius of mouse
        const fromAscii = this.asciiInstances[this.currentImageIndex];

        if (fromAscii) {
          const newFromData = fromAscii.swapCharacterSet(e.clientX, e.clientY, MOUSE_INTERACTION_RADIUS);
          this.asciiDataCache[this.currentImageIndex] = newFromData;
        }

        // Also update title text characters on mousemove (within radius)
        cycleTextCharacters(e.clientX, e.clientY, MOUSE_INTERACTION_RADIUS, this.gridWidth, this.gridHeight, this.charWidth, this.charHeight);

        // Re-render with updated character sets (unified grid)
        this.render(0);
      }
    });
  }

  setupScroll() {
    let lastScrollTime = 0;
    const scrollCooldown = 1000; // 1 second cooldown between scroll triggers

    window.addEventListener('wheel', (e) => {
      // Block during resize, transition, or initial load
      if (this.isResizing || this.isTransitioning || this.isInitialLoad || this.isDensityAnimating) {
        return;
      }

      // Cooldown to prevent multiple triggers
      const now = Date.now();
      if (now - lastScrollTime < scrollCooldown) {
        return;
      }

      lastScrollTime = now;

      // Detect scroll direction (down = positive, up = negative)
      if (Math.abs(e.deltaY) > 10) { // Threshold to avoid accidental triggers
        console.log('Scroll detected, starting density fade animation');
        this.startDensityFadeAnimation();
      }
    }, { passive: true });
  }

  handleClick() {
    // Block clicks during resize
    if (this.isResizing) {
      console.log('Click ignored - resizing in progress');
      return;
    }

    // Move to next image on each click
    const nextIndex = (this.targetImageIndex + 1) % this.asciiDataCache.length;
    this.startTransition(nextIndex);
  }

  startDensityFadeAnimation() {
    console.log('Starting density fade animation...');

    this.isDensityAnimating = true;
    const startDensity = 100;
    const startTime = performance.now();

    const densityAnimation = () => {
      if (!this.isDensityAnimating) return; // Stop if interrupted

      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / DENSITY_FADE_DURATION, 1);

      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);

      // Calculate current density
      const currentDensity = startDensity - (startDensity - DENSITY_FADE_TARGET) * eased;
      characterDensity = Math.round(currentDensity);

      // Render with current density
      this.render(0);

      if (progress < 1) {
        requestAnimationFrame(densityAnimation);
      } else {
        console.log('Density fade complete');
        this.isDensityAnimating = false;

        // After fade completes, move to next image
        const nextIndex = (this.targetImageIndex + 1) % this.asciiDataCache.length;
        this.startTransition(nextIndex);
      }
    };

    densityAnimation();
  }

  startTransition(newTargetIndex) {
    this.currentImageIndex = this.targetImageIndex;
    this.targetImageIndex = newTargetIndex;
    this.isTransitioning = true;
    this.transitionProgress = 0;
    this.transitionStartTime = performance.now();

    // Reset density to 100% when starting a new transition
    characterDensity = 100;

    // Select a random color pair for this transition (will interpolate during animation)
    setRandomColorPair();

    // Generate stable switching thresholds for each position (organic, non-flickering animation)
    const totalPositions = this.gridWidth * this.gridHeight;
    this.switchThresholds = new Array(totalPositions);
    for (let i = 0; i < totalPositions; i++) {
      // Bias toward later switching (0.3-1.0 range) for smooth reveal
      this.switchThresholds[i] = 0.3 + Math.pow(Math.random(), 1.5) * 0.7;
    }

    // Prepare text overlay transition with new random character positions
    prepareTextTransition();

    console.log(`Starting transition: ${this.currentImageIndex} → ${this.targetImageIndex}`);

    // Start animation loop (color interpolation happens during render)
    this.animate();
  }

  animate() {
    if (!this.isTransitioning) return;

    const now = performance.now();
    const elapsed = now - this.transitionStartTime;
    this.transitionProgress = Math.min(elapsed / this.transitionDuration, 1);

    // Ease-in-out function for smooth transition
    const eased = this.easeInOutCubic(this.transitionProgress);

    // Interpolate color pairs during transition
    interpolateColorPairs(eased);

    // Render morphed state (unified grid with text) - colors are now interpolated
    this.render(eased);

    // Check if transition is complete
    if (this.transitionProgress >= 1) {
      this.isTransitioning = false;
      this.currentImageIndex = this.targetImageIndex;

      // Finalize color pair (set DUOTONE to the new color pair)
      if (newColorPair) {
        DUOTONE.dark = { ...newColorPair.dark };
        DUOTONE.light = { ...newColorPair.light };
      }

      console.log(`Transition complete. Current image: ${this.currentImageIndex}`);
    } else {
      // Continue animation
      requestAnimationFrame(this.animate);
    }
  }

  // Initial load animation sequence
  startInitialLoadSequence() {
    console.log('Starting initial load sequence...');

    // Cancel any ongoing transitions or animations
    this.isTransitioning = false;

    // Clear any existing reveal timeout
    if (this.revealTimeout) {
      clearTimeout(this.revealTimeout);
      this.revealTimeout = null;
    }

    // Reset to first image
    this.currentImageIndex = 0;
    this.targetImageIndex = 0;

    // Check if viewport dimensions have changed (e.g., browser inspector resize)
    const currentViewportWidth = window.innerWidth;
    const currentViewportHeight = window.innerHeight;
    const viewportChanged = currentViewportWidth !== this.viewportWidth || currentViewportHeight !== this.viewportHeight;

    // If viewport changed, recalculate dimensions and reinitialize everything
    if (viewportChanged) {
      console.log(`Viewport changed from ${this.viewportWidth}x${this.viewportHeight} to ${currentViewportWidth}x${currentViewportHeight}, reinitializing...`);
      this.isResizing = true; // Block interactions during reinit
      this.calculateDimensions();
      this.isInitialized = false;
      this.asciiDataCache = [];
      this.asciiInstances = [];
      this.init().then(() => {
        this.isResizing = false; // Re-enable interactions
      });
      return; // Exit early as init() will call startInitialLoadSequence() again
    }

    // Rebuild ASCII data for current image with current DUOTONE colors (optimization for smooth reveal)
    const currentAscii = this.asciiInstances[this.currentImageIndex];
    if (currentAscii) {
      console.log('Rebuilding ASCII data with current colors...');
      this.asciiDataCache[this.currentImageIndex] = currentAscii.build();
    } else {
      console.error('No ASCII instance found for current image index:', this.currentImageIndex);
      return; // Exit if no instance found
    }

    // Phase 1: Show text only
    this.renderWithRevealMask(new Set()); // Render with no image characters visible (text only)

    // Phase 2: After pause, reveal image characters randomly
    this.revealTimeout = setTimeout(() => {
      console.log('Revealing image characters randomly...');

      const fromData = this.asciiDataCache[this.currentImageIndex];
      const totalCharacters = fromData.width * fromData.height;

      // Pre-calculate text and density masks (optimization - these don't change during reveal)
      const morphedText = morphTextData(1);
      const textMask = morphedText
        ? calculateTextMask(morphedText, this.gridWidth, this.gridHeight, this.charWidth, this.charHeight)
        : new Map();
      const densityMask = calculateDensityMask(this.gridWidth, this.gridHeight, characterDensity);

      // Store masks for reveal animation
      this.cachedTextMask = textMask;
      this.cachedDensityMask = densityMask;

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
      const revealedSet = new Set();

      const revealAnimation = () => {
        const elapsed = performance.now() - revealStartTime;
        const progress = Math.min(elapsed / REVEAL_ANIMATION_DURATION, 1);

        // Calculate how many characters should be revealed at this point
        const targetCount = Math.floor(progress * shuffledPositions.length);

        // Add newly revealed positions
        for (let i = revealedSet.size; i < targetCount; i++) {
          revealedSet.add(shuffledPositions[i]);
        }

        // Render with current reveal mask (uses cached masks)
        this.renderWithRevealMask(revealedSet);

        if (progress < 1) {
          requestAnimationFrame(revealAnimation);
        } else {
          console.log('Initial load complete');
          this.isInitialLoad = false;
          // Clear cached masks
          this.cachedTextMask = null;
          this.cachedDensityMask = null;
          // Clear reveal timeout reference
          this.revealTimeout = null;
          // Final render without mask (normal rendering)
          this.render(0);
        }
      };

      revealAnimation();
    }, REVEAL_PAUSE_DURATION);
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

    // Calculate or use cached text mask
    let textMask;
    if (!this.isTransitioning && this.textMaskCache && morphedText === currentTextData) {
      // Use cached text mask when not transitioning
      textMask = this.textMaskCache;
    } else {
      // Recalculate during transitions or when text changes
      textMask = morphedText
        ? calculateTextMask(morphedText, this.gridWidth, this.gridHeight, this.charWidth, this.charHeight)
        : new Map();

      // Cache for next frame if not transitioning
      if (!this.isTransitioning) {
        this.textMaskCache = textMask;
      }
    }

    // Calculate or use cached density mask
    let densityMask;
    if (characterDensity === this.lastCachedDensity && this.densityMaskCache) {
      // Use cached density mask if density hasn't changed
      densityMask = this.densityMaskCache;
    } else {
      // Recalculate when density changes
      densityMask = calculateDensityMask(this.gridWidth, this.gridHeight, characterDensity);
      this.densityMaskCache = densityMask;
      this.lastCachedDensity = characterDensity;
    }

    // Morph between the two images with text masking and density masking
    const morphedHTML = this.morphCharactersUnified(fromData, toData, progress, textMask, densityMask);

    // Update DOM (unified grid - single element)
    this.asciiArt.innerHTML = morphedHTML;
  }

  // Render with reveal mask for initial load animation
  renderWithRevealMask(revealedPositions) {
    const fromIndex = this.currentImageIndex;
    const fromData = this.asciiDataCache[fromIndex];

    // Use cached masks if available (optimization), otherwise calculate
    let textMask, densityMask;

    if (this.cachedTextMask && this.cachedDensityMask) {
      // Use pre-calculated masks (fast path during reveal animation)
      textMask = this.cachedTextMask;
      densityMask = this.cachedDensityMask;
    } else {
      // Calculate masks (fallback)
      const morphedText = morphTextData(1);
      textMask = morphedText
        ? calculateTextMask(morphedText, this.gridWidth, this.gridHeight, this.charWidth, this.charHeight)
        : new Map();
      densityMask = calculateDensityMask(this.gridWidth, this.gridHeight, characterDensity);
    }

    // Render with reveal mask and density mask
    const morphedHTML = this.morphCharactersWithReveal(fromData, textMask, revealedPositions, densityMask);

    // Update DOM
    this.asciiArt.innerHTML = morphedHTML;
  }

  // Morph characters with reveal mask (for initial load)
  morphCharactersWithReveal(fromData, textMask, revealedPositions, densityMask) {
    let result = '';
    const width = fromData.width;
    const height = fromData.height;

    // Pre-calculate title color once (optimization)
    const brightenedColor = getDuotoneColor(1);
    const titleColorStyle = `rgb(${brightenedColor.r}, ${brightenedColor.g}, ${brightenedColor.b})`;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        const key = `${x},${y}`;

        // Check if this position has text
        const textCell = textMask.get(key);

        if (textCell) {
          // Render text character with pre-calculated brightened color
          result += `<span style="color: ${titleColorStyle}">${textCell.char}</span>`;
        } else if (!isImageVisible) {
          // Image is hidden - render as space
          result += ' ';
        } else if (densityMask.has(i)) {
          // This position is hidden by density mask
          result += ' ';
        } else if (revealedPositions.has(i)) {
          // Render revealed image character using cached color (no recalculation during reveal)
          const char = fromData.data[i];
          const colorStyle = `rgb(${char.r}, ${char.g}, ${char.b})`;
          result += `<span style="color: ${colorStyle}">${char.char}</span>`;
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

  morphCharactersUnified(fromData, toData, progress, textMask, densityMask) {
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
          // Render text character with brightened color
          const brightenedColor = getDuotoneColor(1); // Use full brightness for title
          const colorStyle = `rgb(${brightenedColor.r}, ${brightenedColor.g}, ${brightenedColor.b})`;
          result += `<span style="color: ${colorStyle}">${textCell.char}</span>`;
        } else if (!isImageVisible) {
          // Image is hidden - render as space
          result += ' ';
        } else if (densityMask.has(i)) {
          // This position is hidden by density mask
          result += ' ';
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

          // Generate character with color
          const colorStyle = `rgb(${morphed.r}, ${morphed.g}, ${morphed.b})`;
          result += `<span style="color: ${colorStyle}">${morphed.char}</span>`;
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


  handleResize() {
    // Immediately block all interactions
    this.isResizing = true;

    // Invalidate caches
    this.textMaskCache = null;
    this.densityMaskCache = null;
    this.lastCachedDensity = -1;

    // Debounce resize for performance
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      console.log('Resize event triggered, reinitializing...');
      this.calculateDimensions();
      this.isInitialized = false;
      this.asciiDataCache = [];
      this.asciiInstances = [];
      this.init().then(() => {
        // Re-enable interactions after initialization complete
        this.isResizing = false;
      });
    }, 100);
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
  const asciiText = new AsciiTextOverlay(TEXT_OVERLAY, TITLE_CHARACTER_SETS[0]);
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

  // Invalidate text mask cache since text changed
  if (window.morphingInstance) {
    window.morphingInstance.textMaskCache = null;
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

// Cycle text characters on mousemove (randomly swap some character positions within radius)
function cycleTextCharacters(mouseX = null, mouseY = null, radius = 150, gridWidth, gridHeight, charWidth, charHeight) {
  if (!currentTextData) return;

  // Randomly select a character set from TITLE_CHARACTER_SETS
  const randomSetIndex = Math.floor(Math.random() * TITLE_CHARACTER_SETS.length);
  const selectedCharSet = TITLE_CHARACTER_SETS[randomSetIndex];

  // Calculate text dimensions and position
  const textWidthChars = currentTextData[0].length;
  const textHeightChars = currentTextData.length;
  const viewportCenterX = Math.floor(gridWidth / 2);
  const viewportCenterY = Math.floor(gridHeight / 2);
  const textStartX = viewportCenterX - Math.floor(textWidthChars / 2);
  const textStartY = viewportCenterY - Math.floor(textHeightChars / 2);

  // Recreate currentTextData with new random character assignments
  const height = currentTextData.length;

  for (let y = 0; y < height; y++) {
    const row = currentTextData[y];
    const width = row.length;

    for (let x = 0; x < width; x++) {
      const cell = row[x];

      // Only update cells that have text
      if (cell && cell.isText) {
        // If mouse position provided, check if within radius
        let withinRadius = true;
        if (mouseX !== null && mouseY !== null) {
          // Calculate pixel position of this text character in the grid
          const gridX = textStartX + x;
          const gridY = textStartY + y;
          const charPixelX = gridX * charWidth;
          const charPixelY = gridY * charHeight;

          // Calculate distance from mouse
          const dx = charPixelX - mouseX;
          const dy = charPixelY - mouseY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          withinRadius = distance <= radius;
        }

        // Only swap if within radius (or no radius check)
        if (withinRadius) {
          // 30% chance to swap this character
          if (Math.random() < 0.3) {
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

// Generate a density mask - returns a Set of positions to hide based on density percentage
// Uses a stable cumulative pattern where positions hide in a consistent order
let shuffledPositions = null; // Stable shuffled order of all positions
let lastGridDimensions = '';

function calculateDensityMask(gridWidth, gridHeight, densityPercent) {
  const currentDimensions = `${gridWidth}x${gridHeight}`;
  const totalPositions = gridWidth * gridHeight;

  // Return empty set if density is 100% (all characters visible)
  if (densityPercent >= 100) {
    return new Set();
  }

  // Regenerate shuffled positions if grid dimensions changed
  if (!shuffledPositions || lastGridDimensions !== currentDimensions) {
    // Create array of all positions
    shuffledPositions = [];
    for (let i = 0; i < totalPositions; i++) {
      shuffledPositions.push(i);
    }

    // Shuffle array using Fisher-Yates with a fixed seed for consistency
    // This creates a stable order that doesn't change between density adjustments
    let random = 12345; // Fixed seed for consistent pattern
    function seededRandom() {
      random = (random * 9301 + 49297) % 233280;
      return random / 233280;
    }

    for (let i = shuffledPositions.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom() * (i + 1));
      [shuffledPositions[i], shuffledPositions[j]] = [shuffledPositions[j], shuffledPositions[i]];
    }

    lastGridDimensions = currentDimensions;
  }

  // Calculate how many positions to hide based on density
  const hideRatio = 1 - (densityPercent / 100);
  const positionsToHide = Math.floor(totalPositions * hideRatio);

  // Build cumulative set - always hide the first N positions from shuffled order
  // This ensures that as density decreases, previously hidden positions stay hidden
  const hiddenPositions = new Set();
  for (let i = 0; i < positionsToHide; i++) {
    hiddenPositions.add(shuffledPositions[i]);
  }

  return hiddenPositions;
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
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
  // Set initial random color pair
  setRandomColorPair();

  // Initialize DUOTONE with the first color pair (no transition on first load)
  if (newColorPair) {
    DUOTONE.dark = { ...newColorPair.dark };
    DUOTONE.light = { ...newColorPair.light };
  }

  // Populate the hidden images from _thumbnails
  populateHiddenImages();


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

  // Add 'r' key listener to re-initiate loading animation
  document.addEventListener('keydown', (event) => {
    if (event.key === 'r' || event.key === 'R') {
      console.log('R key pressed, target:', event.target, 'morphingInstance:', window.morphingInstance);
      if (window.morphingInstance) {
        window.morphingInstance.isInitialLoad = true;
        window.morphingInstance.startInitialLoadSequence();
      } else {
        console.error('No morphingInstance found!');
      }
    }
  });

});
