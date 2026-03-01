// ============================================
// CONFIGURATION
// ============================================

// Different ASCII character sets to morph through
const CHARACTER_SETS = [
  {
    name: 'Minimal Dots',
    steps: [' ', '.', ':', '*', '█']
  },
  {
    name: 'Simple Lines',
    steps: [' ', '-', '=', '≡', '█']
  },
  {
    name: 'Geometric',
    steps: [' ', '.', '◦', '◆', '█']
  },
  {
    name: 'Dense Blocks',
    steps: [' ', '░', '▒', '▓', '█']
  },
  {
    name: 'Organic',
    steps: [' ', '~', '≈', '∞', '█']
  },
  {
    name: 'Tech',
    steps: [' ', '·', '+', '#', '█']
  }
];

// Transition duration in milliseconds
const TRANSITION_DURATION = 1200;

// Text to display
const TEXT = 'ANAcycle';

// ============================================
// ASCII TEXT CONVERSION
// ============================================

class AsciiText {
  constructor(text, characterSet) {
    this.text = text;
    this.characterSet = characterSet;
  }

  // Convert text to ASCII representation
  convert() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Set canvas size based on text
    const fontSize = 200;
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    const metrics = ctx.measureText(this.text);

    const width = Math.ceil(metrics.width);
    const height = Math.ceil(fontSize * 1.2);

    canvas.width = width;
    canvas.height = height;

    // Clear canvas (transparent background)
    ctx.clearRect(0, 0, width, height);

    // Draw text
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(this.text, 0, 0);

    console.log(`Canvas size: ${width}x${height}, Text: "${this.text}"`);

    // Get image data
    const imageData = ctx.getImageData(0, 0, width, height);

    // Fill text shape with random ASCII characters
    return this.buildAsciiData(imageData, width, height);
  }

  buildAsciiData(imageData, width, height) {
    const data = imageData.data;
    const asciiData = [];

    // Sample every few pixels for reasonable resolution
    // Higher value = less dense (fewer characters)
    const sampleRate = 8;

    for (let y = 0; y < height; y += sampleRate) {
      const row = [];
      for (let x = 0; x < width; x += sampleRate) {
        const i = (y * width + x) * 4;

        // Check if this pixel is part of the text (alpha > threshold)
        const alpha = data[i + 3];
        const isText = alpha > 128;

        // If it's text, fill with a random character from the set
        // Otherwise use empty space
        let char;
        let swapTiming = 0; // When this character will swap during transition

        if (isText) {
          // Pick a random character from the set (excluding the first empty space)
          const charIndex = Math.floor(Math.random() * (this.characterSet.length - 1)) + 1;
          char = this.characterSet[charIndex];
          // Assign random swap timing for this character
          swapTiming = Math.random();
        } else {
          // Empty space
          char = this.characterSet[0];
        }

        row.push({ char, isText, swapTiming });
      }
      asciiData.push(row);
    }

    return asciiData;
  }
}

// ============================================
// MORPHING SYSTEM
// ============================================

class MorphingText {
  constructor() {
    this.asciiText = document.getElementById('asciiText');
    this.charsetNameDisplay = document.getElementById('charsetName');
    this.unit = document.querySelector('.ascii-unit');

    this.asciiDataCache = [];
    this.isInitialized = false;
    this.currentCharsetIndex = 0;
    this.targetCharsetIndex = 0;

    // Transition animation state
    this.isTransitioning = false;
    this.transitionProgress = 0;
    this.transitionDuration = TRANSITION_DURATION;
    this.transitionStartTime = 0;

    // Scroll debounce
    this.scrollTimeout = null;

    // Bind handlers
    this.handleScroll = this.handleScroll.bind(this);
    this.animate = this.animate.bind(this);
  }

  init() {
    console.log('Initializing Morphing Text...');

    // Convert text using each character set
    CHARACTER_SETS.forEach((charset, index) => {
      const ascii = new AsciiText(TEXT, charset.steps);

      const asciiData = ascii.convert();
      this.asciiDataCache.push(asciiData);

      console.log(`Converted text with charset: ${charset.name}, Grid: ${asciiData[0].length}x${asciiData.length}`);
    });

    this.isInitialized = true;

    // Initial render - show first character set
    this.updateCharsetName(0);
    this.render();

    // Start scroll listener
    window.addEventListener('scroll', this.handleScroll, { passive: true });

    console.log('Morphing Text initialized successfully!');
  }

  handleScroll() {
    // Use a small delay to prevent rapid fire transitions
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    this.scrollTimeout = setTimeout(() => {
      if (this.isTransitioning) return; // Don't trigger new transitions during animation

      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;

      // Calculate which section we're closest to (scroll snap section)
      const sectionIndex = Math.round(scrollY / viewportHeight);
      const targetIndex = Math.max(0, Math.min(sectionIndex, CHARACTER_SETS.length - 1));

      // Only trigger transition if we're settled on a different section
      // AND we're not already there or transitioning to it
      if (targetIndex !== this.targetCharsetIndex && !this.isTransitioning) {
        console.log(`Scroll detected: section ${targetIndex}`);
        this.startTransition(targetIndex);
      }
    }, 100); // 100ms debounce
  }

  startTransition(newTargetIndex) {
    // Don't start a new transition if we're already transitioning
    if (this.isTransitioning) {
      console.log('Already transitioning, ignoring new request');
      return;
    }

    this.currentCharsetIndex = this.targetCharsetIndex;
    this.targetCharsetIndex = newTargetIndex;
    this.isTransitioning = true;
    this.transitionProgress = 0;
    this.transitionStartTime = performance.now();

    console.log(`Starting transition: ${this.currentCharsetIndex} → ${this.targetCharsetIndex} (${CHARACTER_SETS[this.currentCharsetIndex].name} → ${CHARACTER_SETS[this.targetCharsetIndex].name})`);

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

    // Update charset name during transition
    if (this.transitionProgress >= 0.5) {
      this.updateCharsetName(this.targetCharsetIndex);
    }

    // Check if transition is complete
    if (this.transitionProgress >= 1) {
      this.isTransitioning = false;
      this.currentCharsetIndex = this.targetCharsetIndex;
      console.log(`Transition complete. Current charset: ${this.currentCharsetIndex}`);
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
    const fromIndex = this.currentCharsetIndex;
    const toIndex = this.targetCharsetIndex;

    const fromData = this.asciiDataCache[fromIndex];
    const toData = this.asciiDataCache[toIndex];

    // Morph between the two character sets
    const morphedText = this.morphCharacters(fromData, toData, progress);

    // Update DOM
    this.asciiText.textContent = morphedText;
  }

  morphCharacters(fromData, toData, progress) {
    let result = '';

    // Ensure both arrays have the same dimensions
    const height = Math.min(fromData.length, toData.length);

    for (let y = 0; y < height; y++) {
      const fromRow = fromData[y];
      const toRow = toData[y];
      const width = Math.min(fromRow.length, toRow.length);

      for (let x = 0; x < width; x++) {
        const fromCell = fromRow[x];
        const toCell = toRow[x];

        let char;

        // If this is part of the text
        if (fromCell.isText || toCell.isText) {
          // Use the random swap timing assigned to this character
          const swapThreshold = fromCell.swapTiming;

          if (progress < swapThreshold) {
            // Still showing from character
            char = fromCell.char;
          } else {
            // Swapped to target character
            char = toCell.char;
          }
        } else {
          // Empty space
          char = ' ';
        }

        result += char;
      }
      result += '\n';
    }

    return result;
  }

  updateCharsetName(charsetIndex) {
    this.charsetNameDisplay.textContent = CHARACTER_SETS[charsetIndex].name;
  }
}

// ============================================
// INITIALIZATION
// ============================================

// Create scroll snap sections
function createScrollSections() {
  const scrollContainer = document.getElementById('scrollContainer');

  CHARACTER_SETS.forEach((charset, index) => {
    const section = document.createElement('div');
    section.className = 'snap-section';
    section.dataset.index = index;
    scrollContainer.appendChild(section);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Create scroll snap sections
  createScrollSections();

  // Set initial charset name
  const charsetNameDisplay = document.getElementById('charsetName');
  if (CHARACTER_SETS.length > 0) {
    charsetNameDisplay.textContent = CHARACTER_SETS[0].name;
  }

  // Initialize the morphing system
  const morphing = new MorphingText();
  morphing.init();
});
