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
  dark: { r: 30, g: 80, b: 200 },
  light: { r: 255, g: 220, b: 60 },
  threshold: 0.5
};

// Character set for ASCII art - modify this to change the characters used
const CHARACTER_SET = ['.', '○', '+', '⁘', '∗', '◎'];
// const CHARACTER_SET = ['cycle', 'ANA']; // Very cool unintended effect with this as character set!


// Geometric/Block Characters

  // '.', '▫', '▪', '◆', '◼', '█'
  // '.', '░', '▒', '▓', '█'
  // '.', '○', '◐', '◓', '●'
  // '.', '□', '▣', '■', '█'

  // Punctuation/Symbol Progression

  // '.', '·', '∘', '∙', '●', '█'
  // '.', ':', ';', '=', '#', '█'
  // '.', ',', 'o', 'O', '@', '█'
  // '.', '-', '+', '*', '#', '█'

  // Line/Shade Characters

  // ' ', '─', '═', '▬', '█'
  // ' ', '┃', '║', '▌', '█'
  // '.', '╱', '╳', '▓', '█'

  // Circle Variations

  // '.', '∘', '○', '◎', '◉', '●'
  // '.', '◦', '◯', '⦿', '⬤'

  // Artistic/Unique

  // '.', '·', '✦', '✧', '★', '█'
  // '.', '∴', '⁘', '▣', '█'
  // '.', '⋅', '∗', '⊕', '⊗', '█'
  // '.', '▵', '▴', '▲', '█'

  // Unicode Box Drawing (for texture)

  // ' ', '╌', '╍', '━', '█'
  // '.', '┄', '┅', '┈', '━', '█'

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
  // Interpolate between dark and light colors based on brightness
  const t = brightness; // Already normalized 0-1

  return {
    r: Math.round(DUOTONE.dark.r + (DUOTONE.light.r - DUOTONE.dark.r) * t),
    g: Math.round(DUOTONE.dark.g + (DUOTONE.light.g - DUOTONE.dark.g) * t),
    b: Math.round(DUOTONE.dark.b + (DUOTONE.light.b - DUOTONE.dark.b) * t)
  };
}

// ============================================
// DYNAMIC IMAGE LOADING FROM _THUMBNAILS
// ============================================

// Populate hidden images dynamically
function populateHiddenImages() {
  const hiddenImagesContainer = document.getElementById('hiddenImages');

  THUMBNAIL_IMAGES.forEach((filename, index) => {
    const img = document.createElement('img');
    img.src = `../../../_thumbnails/${filename}`;
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

    // Merge default options
    this.options = Object.assign({
      steps: CHARACTER_SET,
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
    }
  }

  buildAsciiData() {
    const asciiData = [];

    for (let i = 0; i < this.pixelData.length; i++) {
      const steps = this.options.steps;
      const pixel = this.pixelData[i];

      // Map brightness to character - this creates ASCII texture
      let char;
      if (pixel.brightness >= 1) {
        char = steps[steps.length - 1];
      } else {
        char = steps[Math.floor(pixel.brightness * steps.length)];
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
    this.isInitialized = false;
    this.currentImageIndex = 0;
    this.targetImageIndex = 0;

    // Transition animation state
    this.isTransitioning = false;
    this.transitionProgress = 0;
    this.transitionDuration = TRANSITION_DURATION;
    this.transitionStartTime = 0;

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

      console.log(`Converted image ${img.dataset.index} to ASCII`);
    }

    this.isInitialized = true;

    // Initial render - show first image
    this.updateImageName(0);
    this.render();

    // Start click listener
    document.addEventListener('click', this.handleClick);
    window.addEventListener('resize', () => this.handleResize());

    console.log('Morphing ASCII initialized successfully!');
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

    // Change to a random color pair for this transition
    setRandomColorPair();

    // Immediately render with new colors at the start of transition
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

    // Render morphed state
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

    // Morph between the two images
    const morphedHTML = this.morphCharacters(fromData, toData, progress);

    // Update DOM
    this.asciiArt.innerHTML = morphedHTML;
  }

  morphCharacters(fromData, toData, progress) {
    let result = '';
    const width = fromData.width;

    for (let i = 0; i < fromData.data.length; i++) {
      // Add newline at end of each row
      if (i > 0 && i % width === 0) {
        result += '\n';
      }

      const fromChar = fromData.data[i];
      const toChar = toData.data[i];

      // Interpolate between characters and colors
      const morphed = this.interpolateCharacter(
        fromChar,
        toChar,
        progress
      );

      // Generate colored span for each character
      result += `<span style="color:rgb(${morphed.r},${morphed.g},${morphed.b})">${morphed.char}</span>`;
    }

    return result;
  }

  interpolateCharacter(from, to, progress) {
    // Interpolate brightness
    const interpolatedBrightness = from.brightness + (to.brightness - from.brightness) * progress;

    // Map interpolated brightness to character set
    const steps = CHARACTER_SET;

    let char;
    if (interpolatedBrightness >= 1) {
      char = steps[steps.length - 1];
    } else {
      char = steps[Math.floor(interpolatedBrightness * steps.length)];
    }

    // Apply duotone color mapping to interpolated brightness
    const duotoneColor = getDuotoneColor(interpolatedBrightness);

    return {
      char: char,
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
      this.init();
    }, 300);
  }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Set initial random color pair
  setRandomColorPair();

  // Populate the hidden images from _thumbnails
  populateHiddenImages();

  // Set initial image name
  const imageNameDisplay = document.getElementById('imageName');
  if (THUMBNAIL_IMAGES.length > 0) {
    imageNameDisplay.textContent = THUMBNAIL_IMAGES[0];
  }

  // Initialize the morphing system after images are loaded
  window.addEventListener('load', () => {
    const morphing = new MorphingAscii();
    morphing.init();
  });
});
