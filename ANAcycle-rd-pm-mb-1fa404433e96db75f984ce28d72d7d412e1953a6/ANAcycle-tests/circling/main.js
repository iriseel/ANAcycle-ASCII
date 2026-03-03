// Available images in _img folder
const IMAGES = [
  '1.JPG', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.JPG', '7.JPG', '8.JPG',
  '9.jpg', '10.jpg', '11.jpg', '12.jpg', '13.jpg', '14.jpg', '15.jpg', '16.jpg'
];

// Shuffle array helper
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

class CirclingItem {
  constructor(index, imagePath, ovalConfig) {
    this.element = document.createElement('div');
    this.element.className = 'floating-item';
    this.index = index;
    this.ovalConfig = ovalConfig; // Contains centerX, centerY, radiusX, radiusY, speed

    // Random size (between 80px and 400px)
    this.width = Math.random() * 320 + 80;
    this.height = Math.random() * 320 + 80;

    // Use provided image path
    this.imagePath = `../_img/${imagePath}`;

    // Random starting angle on the oval
    this.angle = Math.random() * Math.PI * 2;

    // Calculate initial position on oval
    this.updatePosition();

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

  updatePosition() {
    // Calculate position on oval
    const rawX = this.ovalConfig.centerX + Math.cos(this.angle) * this.ovalConfig.radiusX;
    const rawY = this.ovalConfig.centerY + Math.sin(this.angle) * this.ovalConfig.radiusY;

    // Apply 40% minimum visibility constraint
    const minVisibleWidth = this.width * 0.4;
    const minVisibleHeight = this.height * 0.4;

    // Constrain X position
    this.x = Math.max(
      -(this.width * 0.6),
      Math.min(rawX, window.innerWidth - minVisibleWidth)
    );

    // Constrain Y position
    this.y = Math.max(
      -(this.height * 0.6),
      Math.min(rawY, window.innerHeight - minVisibleHeight)
    );
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
    // Increment angle based on oval's speed
    this.angle += this.ovalConfig.speed;

    // Update position on oval
    this.updatePosition();

    // Apply position
    this.element.style.transform = `translate(${this.x}px, ${this.y}px)`;
  }
}

class CirclingGallery {
  constructor() {
    this.items = [];
    this.ovalConfigs = this.generateOvalConfigs();

    this.init();
    this.animate();

    // Handle window resize
    window.addEventListener('resize', () => this.handleResize());
  }

  generateOvalConfigs() {
    // Create 4 different oval configurations with varying parameters
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;

    return [
      {
        // Oval 1: Large oval in center
        centerX: screenCenterX,
        centerY: screenCenterY,
        radiusX: Math.min(window.innerWidth, window.innerHeight) * 0.35,
        radiusY: Math.min(window.innerWidth, window.innerHeight) * 0.25,
        speed: 0.003 // Slow
      },
      {
        // Oval 2: Medium oval, offset top-right
        centerX: screenCenterX + window.innerWidth * 0.15,
        centerY: screenCenterY - window.innerHeight * 0.1,
        radiusX: Math.min(window.innerWidth, window.innerHeight) * 0.28,
        radiusY: Math.min(window.innerWidth, window.innerHeight) * 0.2,
        speed: 0.005 // Medium-slow
      },
      {
        // Oval 3: Small oval, offset bottom-left
        centerX: screenCenterX - window.innerWidth * 0.2,
        centerY: screenCenterY + window.innerHeight * 0.15,
        radiusX: Math.min(window.innerWidth, window.innerHeight) * 0.22,
        radiusY: Math.min(window.innerWidth, window.innerHeight) * 0.15,
        speed: 0.007 // Medium-fast
      },
      {
        // Oval 4: Very large oval, slightly off-center
        centerX: screenCenterX - window.innerWidth * 0.05,
        centerY: screenCenterY + window.innerHeight * 0.05,
        radiusX: Math.min(window.innerWidth, window.innerHeight) * 0.42,
        radiusY: Math.min(window.innerWidth, window.innerHeight) * 0.32,
        speed: 0.002 // Very slow
      }
    ];
  }

  init() {
    // Shuffle images and split into 4 groups
    const shuffledImages = shuffleArray(IMAGES);
    const groups = [
      shuffledImages.slice(0, 4),   // Group 0: images 0-3
      shuffledImages.slice(4, 8),   // Group 1: images 4-7
      shuffledImages.slice(8, 12),  // Group 2: images 8-11
      shuffledImages.slice(12, 16)  // Group 3: images 12-15
    ];

    // Create items for each group
    let itemIndex = 0;
    groups.forEach((group, groupIndex) => {
      group.forEach(imagePath => {
        this.items.push(
          new CirclingItem(itemIndex, imagePath, this.ovalConfigs[groupIndex])
        );
        itemIndex++;
      });
    });
  }

  animate() {
    // Update all items
    this.items.forEach(item => item.update());

    // Continue animation
    requestAnimationFrame(() => this.animate());
  }

  handleResize() {
    // Regenerate oval configs for new window size
    this.ovalConfigs = this.generateOvalConfigs();

    // Update each item's oval config reference
    let itemIndex = 0;
    for (let groupIndex = 0; groupIndex < 4; groupIndex++) {
      for (let i = 0; i < 4; i++) {
        this.items[itemIndex].ovalConfig = this.ovalConfigs[groupIndex];
        itemIndex++;
      }
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new CirclingGallery();
});
