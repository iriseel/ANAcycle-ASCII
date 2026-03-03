// Available images in _img folder
const IMAGES = [
  '1.JPG', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.JPG', '7.JPG', '8.JPG',
  '9.jpg', '10.jpg', '11.jpg', '12.jpg', '13.jpg', '14.jpg', '15.jpg', '16.jpg'
];

class FloatingItem {
  constructor(index) {
    this.element = document.createElement('div');
    this.element.className = 'floating-item';
    this.index = index;

    // Random size (between 80px and 400px)
    this.width = Math.random() * 320 + 80;
    this.height = Math.random() * 320 + 80;

    // Randomly select an image
    this.imagePath = `../_img/${IMAGES[Math.floor(Math.random() * IMAGES.length)]}`;

    // Random initial position (respecting 40% minimum visibility)
    // Max 60% can be offscreen on each edge
    const maxOffscreenX = this.width * 0.6;
    const maxOffscreenY = this.height * 0.6;

    this.x = Math.random() * (window.innerWidth + maxOffscreenX * 2) - maxOffscreenX;
    this.y = Math.random() * (window.innerHeight + maxOffscreenY * 2) - maxOffscreenY;

    // Random velocity
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;

    // Apply styles
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
    this.element.style.left = '0';
    this.element.style.top = '0';
    this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;

    // Generate and insert random SVG shape
    this.element.innerHTML = this.generateRandomShape();

    // Add hover event listeners
    this.element.addEventListener('mouseenter', () => this.showHoverText());
    this.element.addEventListener('mouseleave', () => this.hideHoverText());

    // Add to DOM
    document.getElementById('container').appendChild(this.element);
  }

  showHoverText() {
    const hoverText = document.getElementById('hover-text');
    if (hoverText) {
      hoverText.classList.remove('hidden');
    }
  }

  hideHoverText() {
    const hoverText = document.getElementById('hover-text');
    if (hoverText) {
      hoverText.classList.add('hidden');
    }
  }

  generateRandomShape() {
    // Generate a random organic SVG shape
    const numPoints = Math.floor(Math.random() * 5) + 4; // 4-8 points
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const radiusX = this.width * 0.4;
    const radiusY = this.height * 0.4;

    // Generate points around an ellipse with randomness
    const points = [];
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const radiusVariation = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
      const x = centerX + Math.cos(angle) * radiusX * radiusVariation;
      const y = centerY + Math.sin(angle) * radiusY * radiusVariation;
      points.push({ x, y });
    }

    // Choose curve type: smooth curves or more angular
    const curveIntensity = Math.random(); // 0 = angular, 1 = very curved

    // Build SVG path with curves
    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < numPoints; i++) {
      const current = points[i];
      const next = points[(i + 1) % numPoints];

      if (curveIntensity > 0.3) {
        // Use quadratic curves for smoother shapes
        const controlX = (current.x + next.x) / 2 + (Math.random() - 0.5) * 30;
        const controlY = (current.y + next.y) / 2 + (Math.random() - 0.5) * 30;
        path += ` Q ${controlX} ${controlY}, ${next.x} ${next.y}`;
      } else {
        // Straight lines for more angular shapes
        path += ` L ${next.x} ${next.y}`;
      }
    }

    path += ' Z'; // Close path

    // Create unique IDs for pattern and clip path
    const patternId = `pattern-${this.index}-${Date.now()}`;
    const clipId = `clip-${this.index}-${Date.now()}`;

    // Random scale and position for image within pattern
    const scale = 1 + Math.random() * 0.5; // 1x to 1.5x scale
    const offsetX = (Math.random() - 0.5) * this.width * 0.3;
    const offsetY = (Math.random() - 0.5) * this.height * 0.3;

    return `<svg width="${this.width}" height="${this.height}" viewBox="0 0 ${this.width} ${this.height}">
      <defs>
        <!-- Define clip path for the shape -->
        <clipPath id="${clipId}">
          <path d="${path}" />
        </clipPath>

        <!-- Define pattern with image -->
        <pattern id="${patternId}" x="0" y="0" width="1" height="1" patternContentUnits="objectBoundingBox">
          <image href="${this.imagePath}"
                 x="${offsetX / this.width}"
                 y="${offsetY / this.height}"
                 width="${scale}"
                 height="${scale}"
                 preserveAspectRatio="xMidYMid slice" />
        </pattern>
      </defs>

      <!-- Rectangle filled with image pattern, clipped to shape -->
      <rect x="0" y="0" width="${this.width}" height="${this.height}"
            fill="url(#${patternId})"
            clip-path="url(#${clipId})" />
    </svg>`;
  }

  update() {
    // Update position
    this.x += this.vx;
    this.y += this.vy;

    // Ensure at least 40% of item is visible (max 60% can be offscreen)
    const minVisibleWidth = this.width * 0.4;
    const minVisibleHeight = this.height * 0.4;

    // Horizontal bounds
    // Left edge: can go negative up to 60% of width
    if (this.x < -(this.width * 0.6)) {
      this.x = -(this.width * 0.6);
      this.vx *= -1;
    }
    // Right edge: must keep 40% visible
    if (this.x > window.innerWidth - minVisibleWidth) {
      this.x = window.innerWidth - minVisibleWidth;
      this.vx *= -1;
    }

    // Vertical bounds
    // Top edge: can go negative up to 60% of height
    if (this.y < -(this.height * 0.6)) {
      this.y = -(this.height * 0.6);
      this.vy *= -1;
    }
    // Bottom edge: must keep 40% visible
    if (this.y > window.innerHeight - minVisibleHeight) {
      this.y = window.innerHeight - minVisibleHeight;
      this.vy *= -1;
    }

    // Apply position
    this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
  }
}

class FloatingGallery {
  constructor() {
    this.items = [];
    this.numItems = 50; // Number of floating items

    this.init();
    this.animate();

    // Handle window resize
    window.addEventListener('resize', () => this.handleResize());
  }

  init() {
    // Create floating items
    for (let i = 0; i < this.numItems; i++) {
      this.items.push(new FloatingItem(i));
    }
  }

  animate() {
    // Update all items
    this.items.forEach(item => item.update());

    // Continue animation
    requestAnimationFrame(() => this.animate());
  }

  handleResize() {
    // Constrain items to new window bounds (40% minimum visibility)
    this.items.forEach(item => {
      const minVisibleWidth = item.width * 0.4;
      const minVisibleHeight = item.height * 0.4;

      // Ensure items respect new boundaries
      if (item.x < -(item.width * 0.6)) {
        item.x = -(item.width * 0.6);
      }
      if (item.x > window.innerWidth - minVisibleWidth) {
        item.x = window.innerWidth - minVisibleWidth;
      }
      if (item.y < -(item.height * 0.6)) {
        item.y = -(item.height * 0.6);
      }
      if (item.y > window.innerHeight - minVisibleHeight) {
        item.y = window.innerHeight - minVisibleHeight;
      }
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new FloatingGallery();
});
