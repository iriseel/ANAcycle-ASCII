// Constants
const MOBILE_BREAKPOINT = 600;
const DOT_SIZE = 1;
const FLOAT_RADIUS = 2; // Radius of circular orbit
const FLOAT_SPEED = 0.02; // Speed of orbit
const WAVE_AMOUNT = 1; // Secondary wave motion amplitude

// Utility function: Maps value from one range to another
const map = (value, x1, y1, x2, y2) => (value - x1) * (y2 - x2) / (y1 - x1) + x2;

// Global animation time for organic motion
let globalTime = 0;

// Calculate organic floating offset for a dot based on its position
function getOrganicOffset(x, y, time) {
  // Create unique seed for each dot position using sine/cosine
  const seed = Math.sin(x * 0.1) * 1000 + Math.cos(y * 0.1) * 1000;

  // Give each dot slightly different speed based on position
  const speedVariation = Math.sin(x * 0.05 + y * 0.05) * 0.5 + 1; // 0.5 to 1.5

  const angle = time * FLOAT_SPEED * speedVariation + seed;
  const phase = time * 0.03 * speedVariation + seed * 2;

  // Circular orbit with position-based radius variation
  const radiusVariation = Math.sin(x * 0.08) * 0.5 + 1; // 0.5 to 1.5
  const offsetX = Math.cos(angle) * FLOAT_RADIUS * radiusVariation;
  const offsetY = Math.sin(angle) * FLOAT_RADIUS * radiusVariation;

  // Add secondary wave motion for organic feel
  const waveX = Math.sin(phase) * WAVE_AMOUNT;
  const waveY = Math.cos(phase) * WAVE_AMOUNT;

  return {
    x: offsetX + waveX,
    y: offsetY + waveY
  };
}

class DissolveElement extends HTMLElement {
  // State properties
  isInitialized = false;
  canvas = null;
  ctx = null;
  dissolveMap = null;
  width = 0;
  height = 0;
  imageDataRef = null;
  type = null;
  progress = null;
  baselineOffset = 0.075;
  ticking = false;
  minRadius = DOT_SIZE * 0.75;
  dotPositions = []; // Store all dot positions for migration
  isAnimating = false; // Track if jitter animation is running

  constructor() {
    super();
  }

  connectedCallback() {
    if (!this.isInitialized) {
      this.isInitialized = true;
      this.init();
    }
  }

  init() {
    this.type = this.getAttribute("type");
    this.setProgress();
    this.build();
    this.addEventListeners();
  }

  addEventListeners() {
    window.addEventListener("resize", (e) => {
      this.draw();
    });

    window.addEventListener("scroll", (e) => {
      if (!this.ticking) {
        if (this.start !== this.limit) {
          if (this.isVisible) {
            this.setProgress();
            requestAnimationFrame(() => {
              // Get visible dots from migration manager if available
              const visibleIndices = window.migrationManager && window.migrationManager.getVisibleIndices
                ? window.migrationManager.getVisibleIndices(this)
                : [];
              this.render(this.progress, null, visibleIndices);
              this.ticking = false;
            });
            this.ticking = true;
          }
        }
      }
    });

    this.addEventListener("mouseenter", () => {
      this.fill();
    });

    this.addEventListener("mouseleave", () => {
      this.empty();
    });
  }

  setProgress() {
    const trackMode = this.getAttribute("track");

    if (trackMode == "documentPosition") {
      this.progress = Math.min(
        document.documentElement.scrollTop / window.innerHeight,
        1
      );
    } else if (trackMode == "elementPosition") {
      const top = this.getBoundingClientRect().top;
      this.progress = 1 - Math.min(top / (window.innerHeight / 2), 1);
    }
  }

  build() {
    this.canvas = document.createElement("canvas");
    this.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");
    this.draw();
  }

  draw() {
    const lineRuler = this.querySelector('[name="line-ruler"]');
    const paddingRuler = this.querySelector('[name="padding-ruler"]');

    if (!lineRuler || !paddingRuler) {
      console.error('Ruler elements not found');
      return;
    }

    const fontSize = lineRuler.offsetHeight * this.scale;
    const lineHeight = fontSize * 0.85;
    const padding = paddingRuler.offsetHeight * this.scale;

    if (this.type == "text") {
      const text = this.getAttribute("text");
      const lines = text.split("/");

      this.height = lines.length * lineHeight + padding * 2 * this.scale;
      this.width = this.offsetWidth * this.scale;

      this.dissolveMap = new Float32Array(this.width * this.height);
      for (let i = 0; i < this.width * this.height; i++) {
        this.dissolveMap[i] = Math.random();
      }

      this.canvas.width = this.width;
      this.canvas.height = this.height;

      const offset = this.baselineOffset * lineHeight;
      this.ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "top";

      lines.forEach((line, i) => {
        this.ctx.fillText(
          line,
          this.width / 2,
          lineHeight * i + padding + offset
        );
      });

      this.imageDataRef = this.ctx.getImageData(0, 0, this.width, this.height);

      // Extract dot positions from the rendered text
      this.extractDotPositions();

      console.log('Dissolve element initialized:', this.getAttribute('text'), 'Dots:', this.dotPositions.length);
    }

    // Initial render
    const progress = this.progress || 0;
    this.render(progress, null, []);

    // Start continuous jitter animation
    this.startJitterAnimation();
  }

  // Start continuous animation loop for organic floating effect
  startJitterAnimation() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const animate = () => {
      if (!this.isAnimating) return;

      // Increment global time for smooth animation
      globalTime += 1;

      // Only animate if not controlled by migration manager
      const migrationControlled = window.migrationManager &&
                                  (window.migrationManager.sourceElement === this ||
                                   window.migrationManager.targetElement === this);

      if (!migrationControlled) {
        const visibleIndices = [];
        this.render(this.progress, null, visibleIndices);
      }

      requestAnimationFrame(animate);
    };

    animate();
  }

  // Extract all dot positions from the rendered text
  extractDotPositions() {
    this.dotPositions = [];
    for (let i = 0; i < this.width * this.height; i++) {
      const index = i * 4;
      const alpha = this.imageDataRef.data[index + 3];

      if (alpha === 255) {
        const x = i % this.width;
        const y = Math.floor(i / this.width);
        this.dotPositions.push({
          x,
          y,
          threshold: this.dissolveMap[i],
          pixelIndex: i
        });
      }
    }

    // Sort by threshold so we can easily determine which dots to show
    this.dotPositions.sort((a, b) => b.threshold - a.threshold);
  }

  // Get global screen position for a local canvas position
  getGlobalPosition(x, y) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = rect.width / this.width;
    const scaleY = rect.height / this.height;

    return {
      x: rect.left + x * scaleX,
      y: rect.top + y * scaleY
    };
  }

  // Get dots that should be visible at current dissolveAmount
  getVisibleDots(dissolveAmount, excludeMigrating = []) {
    const migratingSet = new Set(excludeMigrating);
    return this.dotPositions.filter(dot =>
      dot.threshold > dissolveAmount && !migratingSet.has(dot.pixelIndex)
    );
  }

  render(progress, overwrite = null, visibleIndices = []) {
    // Check if migration manager is controlling this element
    const migrationControlled = window.migrationManager &&
                                (window.migrationManager.sourceElement === this ||
                                 window.migrationManager.targetElement === this);

    const indexSet = new Set(visibleIndices);

    if (migrationControlled) {
      // MIGRATION MODE: Show ONLY dots in the visibleIndices list
      this.ctx.clearRect(0, 0, this.width, this.height);

      for (let i = 0; i < this.width * this.height; i++) {
        const x = i % this.width;
        const y = Math.floor(i / this.width);
        const index = i * 4;
        const refAlpha = this.imageDataRef.data[index + 3] == 255;

        if (!refAlpha) continue;

        // Show only if in the visible indices set
        if (indexSet.has(i)) {
          const offset = getOrganicOffset(x, y, globalTime);
          this.ctx.fillRect(x + offset.x, y + offset.y, DOT_SIZE, DOT_SIZE);
        }
      }
    } else {
      // NORMAL DISSOLVE MODE
      const dissolveAmount = overwrite !== null
        ? overwrite
        : map(progress, 0, 1, this.start, this.limit);

      const imageData = new ImageData(
        new Uint8ClampedArray(this.imageDataRef.data),
        this.width,
        this.height
      );
      const data = imageData.data;

      const minRadius = this.minRadius;
      const radius = Math.abs(dissolveAmount - 0.5) / 5 + minRadius;

      if (radius > minRadius) {
        this.ctx.clearRect(0, 0, this.width, this.height);

        for (let i = 0; i < this.width * this.height; i++) {
          if (indexSet.has(i)) continue;

          const x = i % this.width;
          const y = Math.floor(i / this.width);
          const threshold = this.dissolveMap[i];
          const visible = threshold > dissolveAmount;
          const index = i * 4;
          const refAlpha = this.imageDataRef.data[index + 3] == 255;

          if (visible && refAlpha) {
            const radiusAdjusted = this.scale == 1 ? radius : radius * 1.5;
            const offset = getOrganicOffset(x, y, globalTime);
            this.ctx.fillRect(x + offset.x, y + offset.y, radiusAdjusted, radiusAdjusted);
          }
        }
      } else {
        for (let i = 0; i < this.width * this.height; i++) {
          if (indexSet.has(i)) {
            const index = i * 4;
            data[index + 3] = 0;
            continue;
          }

          const threshold = this.dissolveMap[i];
          const visible = threshold > dissolveAmount;
          const index = i * 4;
          const refAlpha = this.imageDataRef.data[index + 3];
          data[index + 3] = visible ? refAlpha : 0;
        }

        this.ctx.putImageData(imageData, 0, 0);
      }
    }
  }

  fill() {
    this.render(null, 0, []);
  }

  empty() {
    this.render(this.progress, null, []);
  }

  get isMobile() {
    return window.innerWidth < MOBILE_BREAKPOINT;
  }

  get start() {
    const attr = this.getAttribute("start");
    return attr ? Number(attr) : (this.isMobile ? 0.7 : 0.8);
  }

  get limit() {
    const attr = this.getAttribute("limit");
    return attr ? Number(attr) : (this.isMobile ? 0.7 : 0.8);
  }

  get scale() {
    return window.innerWidth < MOBILE_BREAKPOINT ? 2 : 1;
  }

  get isVisible() {
    const rect = this.getBoundingClientRect();
    return (rect.top > 0 && rect.top < window.innerHeight) ||
           (rect.bottom > 0 && rect.bottom < window.innerHeight);
  }
}

customElements.define('dissolve-element', DissolveElement);
