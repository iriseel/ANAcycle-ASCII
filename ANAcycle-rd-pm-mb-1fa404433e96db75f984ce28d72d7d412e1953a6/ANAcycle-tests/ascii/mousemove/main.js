// ============================================
// ASCII IMAGE CONVERSION
// ============================================

class Ascii {
  constructor(el, ref, options = {}) {
    this.el = el;           // Target div.Ascii element
    this.ref = ref;         // Source img element

    // Define multiple character sets with similar visual densities
    this.characterSets = [
      [" ", '„', '▂', '▄', '●', '█'].reverse(),     // Set 0: Original blocks
      [" ", '.', '▁', '▀', '◆', '■'].reverse(),     // Set 1: Squares & triangles
      [" ", '·', '‗', '◢', '◉', '▓'].reverse(),     // Set 2: Dots & diagonals
      [" ", ',', '_', '▃', '◐', '▉'].reverse(),     // Set 3: Half circles
      [" ", '\'', '¯', '▅', '◕', '▊'].reverse()     // Set 4: Lines & eyes
    ];

    this.currentSetIndex = 0;
    this.swapInterval = null;
    this.positionSets = [];  // Track which character set each position uses

    // Merge default options with provided options
    this.options = Object.assign({
      steps: this.characterSets[0],  // Start with first character set
      contrast: 100,         // Contrast adjustment (0-200)
      invert: false,         // Invert brightness mapping
      width: null,           // Grid width in characters (calculated if null)
      height: null,          // Grid height in characters (calculated if null)
      fit: null,             // 'contain' or 'cover'
      frameHeight: 1,        // Internal frame height multiplier
      paddingHeight: 0,      // Vertical padding in pixels
      paddingWidth: 0,       // Horizontal padding in pixels
      glyphRatio: 1          // Character aspect ratio (width/height)
    }, options);
  }

  init() {
    // Reverse character set if invert is true
    if (this.options.invert &&
        (this.options.invert == 'true' || this.options.invert == true)) {
      this.options.steps = this.options.steps.reverse();
    }

    // Create off-screen canvas
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    // Start conversion
    this.build();
  }

  build() {
    this.buildImage();
    this.buildPixelData();
    this.buildAscii();
  }

  buildImage() {
    // Calculate image aspect ratio with glyph compensation
    this.imageRatio = this.ref.naturalWidth /
                      (this.ref.naturalHeight * this.options.glyphRatio);

    // Calculate grid dimensions
    this.options.width = this.options.width ?
                         this.options.width :
                         Math.floor(this.options.height * this.imageRatio);

    this.options.height = this.options.height ?
                          this.options.height :
                          Math.ceil(this.options.width / this.imageRatio);

    this.containerRatio = this.options.width / this.options.height;

    // Set canvas size to match ASCII grid
    this.ctx.canvas.width = this.options.width;
    this.ctx.canvas.height = this.options.height;

    // Calculate image positioning based on fit mode
    if (this.options.fit == 'contain') {
      // Letterbox: fit entire image with padding
      if (this.containerRatio >= this.imageRatio) {
        // Wide container
        this.imageHeight = this.canvas.height - this.options.paddingHeight * 2;
        this.imageWidth = this.imageHeight * this.imageRatio;
        this.x = (this.canvas.width - this.imageWidth) / 2;
        this.y = 0 + this.options.paddingHeight;
      } else {
        // Tall container
        this.imageWidth = this.canvas.width - this.options.paddingWidth * 2;
        this.imageHeight = this.imageWidth / this.imageRatio;
        this.x = 0 + this.options.paddingWidth;
        this.y = (this.canvas.height - this.imageHeight) / 2;
      }
    }

    if (this.options.fit == 'cover') {
      // Crop: fill container completely
      if (this.containerRatio >= this.imageRatio) {
        // Wide container
        this.imageWidth = this.canvas.width;
        this.imageHeight = this.imageWidth / this.imageRatio;
        this.x = 0;
        this.y = (this.canvas.height - this.imageHeight) / 2;
      } else {
        // Tall container
        this.imageHeight = this.canvas.height;
        this.imageWidth = this.imageHeight * this.imageRatio;
        this.x = (this.canvas.width - this.imageWidth) / 2;
        this.y = 0;
      }
    }

    // Optional background fill
    if (this.options.bg) {
      this.ctx.fillStyle = this.options.bg;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
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

    // Extract pixel data (RGBA array)
    this.imgData = this.ctx.getImageData(
      0, 0,
      this.options.width,
      this.options.height
    ).data;

    // Apply optional adjustments
    if (this.options.gamma) {
      this.adjustGamma();
    }

    if (this.options.contrast) {
      this.adjustContrast();
    }
  }

  adjustContrast() {
    // Formula: output = input * contrast + intercept
    const contrast = this.options.contrast / 100 + 1;
    const intercept = 128 * (1 - contrast);

    for (let i = 0; i < this.imgData.length; i += 4) {
      // Apply to R, G, B channels (skip alpha at i+3)
      this.imgData[i] = this.imgData[i] * contrast + intercept;
      this.imgData[i + 1] = this.imgData[i + 1] * contrast + intercept;
      this.imgData[i + 2] = this.imgData[i + 2] * contrast + intercept;
    }
  }

  adjustGamma() {
    // Formula: output = 255 * (input/255)^(1/gamma)
    const gammaCorrection = 1 / this.options.gamma;

    for (let i = 0; i < this.imgData.length; i += 4) {
      this.imgData[i] = Math.pow(255 * (this.imgData[i] / 255), gammaCorrection);
      this.imgData[i + 1] = Math.pow(255 * (this.imgData[i + 1] / 255), gammaCorrection);
      this.imgData[i + 2] = Math.pow(255 * (this.imgData[i + 2] / 255), gammaCorrection);
    }
  }

  buildPixelData() {
    this.pixelData = [];
    this.positionSets = [];  // Initialize position sets array

    // Convert each pixel to brightness value (0-1)
    for (let i = 0; i < this.options.width * this.options.height; i++) {
      const colorData = [];

      // Extract R, G, B values (skip alpha)
      for (let j = i * 4; j < (i + 1) * 4 - 1; j++) {
        colorData.push(this.imgData[j]);
      }

      // Calculate average brightness
      const avg = colorData.reduce((a, b) => a + b, 0) / colorData.length;

      // Normalize to 0-1 with 2 decimal precision
      const pctg = Math.ceil(avg / 255 * 100) / 100;

      this.pixelData.push(pctg);
      this.positionSets.push(0);  // Initialize each position to character set 0
    }
  }

  buildAscii() {
    let containerText = '';

    for (let i = 0; i < this.pixelData.length; i++) {
      // Add newline at end of each row
      if (i > 0 && i % this.options.width == 0) {
        containerText += '\n';
      }

      // Get character set for this position
      const setIndex = this.positionSets[i] || 0;
      const steps = this.characterSets[setIndex];

      // Map brightness to character
      if (this.pixelData[i] == 1) {
        // Handle perfectly white pixels
        containerText += steps[steps.length - 1];
      } else {
        // Map 0-1 brightness to character index
        containerText += steps[
          Math.floor(this.pixelData[i] * steps.length / 1)
        ];
      }
    }

    // Set text content of target element
    this.el.innerText = containerText;
  }

  update(options) {
    // Update dimensions and rebuild
    this.options.width = options.width ?
                         options.width :
                         Math.floor(this.options.height * this.imageRatio);

    this.options.height = options.height ?
                          options.height :
                          Math.ceil(this.options.width / this.imageRatio);

    this.options.paddingWidth = options.paddingWidth ?
                                options.paddingWidth :
                                this.options.paddingWidth;

    this.options.paddingHeight = options.paddingHeight ?
                                 options.paddingHeight :
                                 this.options.paddingHeight;

    this.options.glyphRatio = options.glyphRatio ?
                              options.glyphRatio :
                              this.options.glyphRatio;

    this.build();
  }

  // Swap to next character set and rebuild ASCII
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

    // Rebuild ASCII with new characters (reuses existing pixel data)
    this.buildAscii();
  }

  // Start automatic character swapping
  startSwapping(interval = 500) {
    // Stop any existing interval
    this.stopSwapping();

    // Start new interval
    this.swapInterval = setInterval(() => {
      this.swapCharacterSet();
    }, interval);
  }

  // Stop automatic character swapping
  stopSwapping() {
    if (this.swapInterval) {
      clearInterval(this.swapInterval);
      this.swapInterval = null;
    }
  }
}


// Image wrapper class for managing ASCII conversion
class AsciiImage {
  constructor(imgEl, unit) {
    this.imgEl = imgEl;                     // Source image element
    this.unit = unit;                       // Character measurement element
    // Get the actual container with layout width (.marching-img), not just the <picture> parent
    this.container = imgEl.closest('.marching-img') || imgEl.parentElement.parentElement || imgEl.parentElement;

    // Create ASCII output element
    this.asciiEl = document.createElement('div');
    this.asciiEl.className = 'ascii-art';

    // Wrap the image with ASCII container
    const wrapper = document.createElement('div');
    wrapper.className = 'ascii-wrapper';

    // Get the picture element (direct parent of img)
    const pictureEl = this.imgEl.parentElement;

    // Insert wrapper before picture element in the container
    this.container.insertBefore(wrapper, pictureEl);

    // Move ASCII element and picture into wrapper
    wrapper.appendChild(this.asciiEl);
    wrapper.appendChild(pictureEl);

    // Configuration
    this.options = {
      steps: [" ", '„', '▂', '▄', '●', '█'].reverse(), // Block characters
      width: this.width,
      height: this.height,
      fit: 'cover',
      invert: this.imgEl.dataset.invert == 'true',
      glyphRatio: this.glyphRatio
    };

    // Create Ascii instance
    this.ascii = new Ascii(this.asciiEl, this.imgEl, this.options);
  }

  init() {
    // Ensure we have valid dimensions before initializing
    if (this.ascii && this.imgEl.complete && this.imgEl.naturalHeight !== 0 && this.width > 0 && this.height > 0) {
      this.ascii.init();
    } else {
      console.warn('Cannot initialize ASCII conversion: invalid dimensions', {
        width: this.width,
        height: this.height,
        containerWidth: this.containerWidth
      });
    }
  }

  update() {
    if (this.ascii) {
      this.ascii.update({
        width: this.width,
        height: this.height,
        glyphRatio: this.glyphRatio
      });
    }
  }

  // Start character swapping animation
  startSwapping(interval = 500) {
    if (this.ascii) {
      this.ascii.startSwapping(interval);
    }
  }

  // Stop character swapping animation
  stopSwapping() {
    if (this.ascii) {
      this.ascii.stopSwapping();
    }
  }

  // Measure character width in pixels
  get unitWidth() {
    return this.unit.getBoundingClientRect().right -
           this.unit.getBoundingClientRect().left;
  }

  // Get container width
  get containerWidth() {
    return this.container.clientWidth;
  }

  // Calculate ASCII grid width in characters
  get width() {
    return Math.round(this.containerWidth / this.unitWidth);
  }

  // Calculate ASCII grid height in characters
  get height() {
    const aspectRatio = window.innerWidth <= 700 ? 2.75 : 3.5;
    return Math.round(this.width / aspectRatio);
  }

  // Glyph compensation ratio (varies by device)
  get glyphRatio() {
    return window.innerWidth <= 700 ? 0.35 : 0.45;
  }
}

// ============================================
// INITIALIZATION
// ============================================

let asciiImages = [];

document.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("load", () => {
    initAsciiImages();
  });
});

function initAsciiImages() {
  // Get the measurement unit element
  const unit = document.querySelector('.ascii-unit');
  if (!unit) {
    console.warn('ASCII unit element not found. Skipping ASCII conversion.');
    return;
  }

  // Find all images with the .target-img class
  const images = document.querySelectorAll('.target-img');

  if (images.length === 0) {
    console.log('No images found for ASCII conversion.');
    return;
  }

  // Helper function to create ASCII image after layout is ready
  const createAsciiImage = (img) => {
    // Use requestAnimationFrame to ensure layout calculations are complete
    requestAnimationFrame(() => {
      try {
        const asciiImg = new AsciiImage(img, unit);
        asciiImages.push(asciiImg);
        asciiImg.init();
        // Character swapping now controlled by mouse movement (see below)
      } catch (error) {
        console.error('Error converting image to ASCII:', error);
      }
    });
  };

  // Create ASCII instances for each image
  images.forEach(img => {
    // Only convert if image has loaded successfully
    if (img.complete && img.naturalHeight !== 0) {
      createAsciiImage(img);
    } else {
      // If image hasn't loaded yet, wait for it
      img.addEventListener('load', () => {
        createAsciiImage(img);
      });
    }
  });

  console.log(`ASCII conversion initialized for ${images.length} images.`);

  // Mouse movement tracking for ASCII character swapping
  let lastMouseX = 0;
  let lastMouseY = 0;
  let totalDistance = 0;

  document.addEventListener('mousemove', (e) => {
    // Calculate distance moved since last position
    const deltaX = e.clientX - lastMouseX;
    const deltaY = e.clientY - lastMouseY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Accumulate distance
    totalDistance += distance;

    // Update last position
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

    // Trigger swap when total distance exceeds 1px
    if (totalDistance >= 1) {
      totalDistance = 0; // Reset counter

      // Swap characters on all ASCII images
      asciiImages.forEach(asciiImg => {
        if (asciiImg.ascii) {
          asciiImg.ascii.swapCharacterSet();
        }
      });
    }
  });
}
