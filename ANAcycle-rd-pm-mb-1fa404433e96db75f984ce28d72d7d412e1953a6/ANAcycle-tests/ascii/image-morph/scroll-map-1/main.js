// ============================================
// DYNAMIC IMAGE LOADING FROM _THUMBNAILS
// ============================================

// List of images in _thumbnails folder
const THUMBNAIL_IMAGES = [
  'AlgaeSipsandJavaBrews.jpg',
  'ClimateHouse.jpg',
  'ClosedWorldsExhibition.jpg',
  'Edible.png',
  'LifeOnMars.jpg'
];

// Populate hidden images dynamically
function populateHiddenImages() {
  const hiddenImagesContainer = document.getElementById('hiddenImages');

  THUMBNAIL_IMAGES.forEach((filename, index) => {
    const img = document.createElement('img');
    img.src = `../_thumbnails/${filename}`;
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

    // Extremely distinct geometric shapes - dramatic morphing effect
    this.characterSet = ['.', '+', '◆', '█'];

    // Merge default options
    this.options = Object.assign({
      steps: this.characterSet,
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

      asciiData.push({
        char: char,
        brightness: pixel.brightness,
        r: pixel.r,
        g: pixel.g,
        b: pixel.b
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
    this.currentScroll = 0;
    this.ticking = false;
    this.currentImageIndex = 0;

    // Extract image names from src attributes
    this.imageNames = this.images.map(img => {
      const src = img.getAttribute('src');
      return src.split('/').pop(); // Get filename only
    });

    // Calculate dimensions
    this.calculateDimensions();

    // Bind scroll handler
    this.handleScroll = this.handleScroll.bind(this);
    this.update = this.update.bind(this);
  }

  calculateDimensions() {
    // Get character dimensions from the fixed CSS font size
    const unitRect = this.unit.getBoundingClientRect();
    this.charWidth = unitRect.width;
    this.charHeight = unitRect.height;

    // Calculate viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate grid resolution needed to fill viewport at this font size
    // No min/max limits - let it be whatever is needed for fullscreen
    this.gridWidth = Math.ceil(viewportWidth / this.charWidth);
    this.gridHeight = Math.ceil(viewportHeight / this.charHeight);

    console.log(`Character size: ${this.charWidth}x${this.charHeight}px`);
    console.log(`Viewport: ${viewportWidth}x${viewportHeight}px`);
    console.log(`Grid resolution: ${this.gridWidth}x${this.gridHeight} characters`);
  }

  async init() {
    console.log('Initializing Morphing ASCII...');
    console.log(`Grid dimensions: ${this.gridWidth}x${this.gridHeight}`);

    // Wait for all images to load
    await Promise.all(this.images.map(img => {
      if (img.complete && img.naturalHeight !== 0) {
        return Promise.resolve();
      }
      return new Promise(resolve => {
        img.addEventListener('load', resolve);
      });
    }));

    // Convert all images to ASCII data
    for (const img of this.images) {
      const ascii = new Ascii(img, {
        width: this.gridWidth,
        height: this.gridHeight,
        fit: 'cover',
        glyphRatio: window.innerWidth <= 700 ? 0.35 : 0.45
      });

      ascii.init();
      const asciiData = ascii.build();
      this.asciiDataCache.push(asciiData);

      console.log(`Converted image ${img.dataset.index} to ASCII`);
    }

    this.isInitialized = true;

    // Initial render
    this.currentScroll = window.scrollY;
    this.renderMorphedAscii(this.currentScroll);

    // Start scroll listener
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    window.addEventListener('resize', () => this.handleResize());

    console.log('Morphing ASCII initialized successfully!');
  }

  handleScroll() {
    this.currentScroll = window.scrollY;

    if (!this.ticking) {
      requestAnimationFrame(this.update);
      this.ticking = true;
    }
  }

  update() {
    if (this.isInitialized) {
      this.renderMorphedAscii(this.currentScroll);
    }
    this.ticking = false;
  }

  renderMorphedAscii(scrollY) {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = Math.max(0, Math.min(1, scrollY / maxScroll));

    // Dynamically map scroll to image transitions based on number of images
    const numImages = this.asciiDataCache.length;
    const numTransitions = numImages; // Each image transitions to the next (last loops to first)

    // Calculate which transition we're in
    const transitionSize = 1 / numTransitions;
    const currentTransition = Math.floor(scrollProgress / transitionSize);
    const transitionProgress = (scrollProgress % transitionSize) / transitionSize;

    // Calculate from and to indices
    const fromIndex = Math.min(currentTransition, numImages - 1);
    const toIndex = (fromIndex + 1) % numImages; // Loop back to first image

    const fromData = this.asciiDataCache[fromIndex];
    const toData = this.asciiDataCache[toIndex];

    // Display destination image name only when transition is nearly complete (95%+)
    const currentIndex = transitionProgress >= 0.95 ? toIndex : fromIndex;
    this.updateImageName(currentIndex);

    // Morph between the two images
    const morphedHTML = this.morphCharacters(fromData, toData, transitionProgress);

    // Update DOM with colored HTML (single operation for performance)
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

    // Map interpolated brightness to extremely distinct geometric shapes
    // Creates dramatic morphing: . → + → ◆ → █
    const steps = ['.', '+', '◆', '█'];

    let char;
    if (interpolatedBrightness >= 1) {
      char = steps[steps.length - 1];
    } else {
      char = steps[Math.floor(interpolatedBrightness * steps.length)];
    }

    // Interpolate RGB colors - allows pure white, pure black, or any solid color
    const r = Math.round(from.r + (to.r - from.r) * progress);
    const g = Math.round(from.g + (to.g - from.g) * progress);
    const b = Math.round(from.b + (to.b - from.b) * progress);

    return {
      char: char,
      r: r,
      g: g,
      b: b
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
  // First, populate the hidden images from _thumbnails
  populateHiddenImages();

  // Set body height based on number of images (100vh per image)
  document.body.style.height = `${THUMBNAIL_IMAGES.length * 100}vh`;

  // Set initial image name
  const imageNameDisplay = document.getElementById('imageName');
  if (THUMBNAIL_IMAGES.length > 0) {
    imageNameDisplay.textContent = THUMBNAIL_IMAGES[0];
  }

  // Then initialize the morphing system after images are loaded
  window.addEventListener('load', () => {
    const morphing = new MorphingAscii();
    morphing.init();
  });
});
