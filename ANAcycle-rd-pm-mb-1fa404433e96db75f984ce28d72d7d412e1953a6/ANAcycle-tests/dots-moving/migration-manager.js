class MigrationManager {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.sourceElement = null; // ANA
    this.targetElement = null; // cycle
    this.circulatingDots = []; // Dots that continuously circulate
    this.sourceStaticDots = []; // Dots that stay in source
    this.targetStaticDots = []; // Dots that stay in target

    // Speed control for circulating dots
    // Lower values = slower circulation between text blocks
    // Default: 0.005 (faster), 0.002 (slower), 0.001 (very slow)
    this.circulationSpeed = 0.002;

    this.init();
  }

  init() {
    // Create full-screen canvas for circulating particles
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '99';
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    this.resize();

    window.addEventListener('resize', () => {
      this.resize();
      this.updateDotPositions();
    });

    // Start animation loop
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setElements(sourceElement, targetElement) {
    this.sourceElement = sourceElement;
    this.targetElement = targetElement;

    // Wait a bit for elements to be fully initialized
    setTimeout(() => {
      this.setupCirculation();
      console.log('Migration manager initialized with continuous circulation');
      console.log('Circulating dots:', this.circulatingDots.length);
    }, 100);
  }

  setupCirculation() {
    if (!this.sourceElement.dotPositions || !this.targetElement.dotPositions) return;
    if (this.sourceElement.dotPositions.length === 0 || this.targetElement.dotPositions.length === 0) return;

    this.circulatingDots = [];

    // Read density configuration from HTML attributes
    const sourceStartDensity = parseFloat(this.sourceElement.getAttribute('density-start')) || 0.5;
    const sourceEndDensity = parseFloat(this.sourceElement.getAttribute('density-end')) || 0.05;
    const targetStartDensity = parseFloat(this.targetElement.getAttribute('density-start')) || 0.05;
    const targetEndDensity = parseFloat(this.targetElement.getAttribute('density-end')) || 0.5;

    // Calculate how many dots circulate
    const circulationPercent = sourceStartDensity - sourceEndDensity;

    // Get source and target dots
    const sourceDots = [...this.sourceElement.dotPositions].sort((a, b) => a.threshold - b.threshold);
    const targetDots = [...this.targetElement.dotPositions];

    // Determine which dots circulate (middle range)
    const circulatingSourceDots = sourceDots.slice(
      Math.floor(sourceDots.length * sourceEndDensity),
      Math.floor(sourceDots.length * sourceStartDensity)
    );

    // Create circulating dots with random phases for staggered animation
    circulatingSourceDots.forEach((sourceDot, index) => {
      const targetDot = targetDots[Math.floor(Math.random() * targetDots.length)];
      if (!targetDot) return;

      // Random phase (0 to 1) determines where in the cycle this dot starts
      const phase = Math.random();

      // Random speed variation (0.8 to 1.2)
      const speedVariation = 0.8 + Math.random() * 0.4;

      // Random ellipse characteristics for organic motion
      const ellipsePhase = Math.random() * Math.PI * 2;
      const ellipseWidth = 50 + Math.random() * 100; // Random ellipse width
      const ellipseHeight = 30 + Math.random() * 70; // Random ellipse height

      this.circulatingDots.push({
        sourceDot,
        targetDot,
        sourcePos: null,
        targetPos: null,
        currentPos: { x: 0, y: 0 },
        phase, // Current phase in the cycle (0 to 1)
        speedVariation,
        ellipsePhase,
        ellipseWidth,
        ellipseHeight,
        state: 'at_source' // at_source, traveling_to_target, at_target, traveling_to_source
      });
    });

    // Store static dots that don't circulate
    this.sourceStaticDots = sourceDots.slice(0, Math.floor(sourceDots.length * sourceEndDensity));
    this.targetStaticDots = targetDots.slice(0, Math.floor(targetDots.length * targetStartDensity));

    console.log('Circulation setup:', {
      totalSourceDots: sourceDots.length,
      totalTargetDots: targetDots.length,
      circulatingDots: this.circulatingDots.length,
      sourceStaticDots: this.sourceStaticDots.length,
      targetStaticDots: this.targetStaticDots.length
    });

    this.updateDotPositions();
  }

  updateDotPositions() {
    // Update screen positions for all circulating dots
    this.circulatingDots.forEach(dot => {
      if (this.sourceElement && dot.sourceDot) {
        dot.sourcePos = this.sourceElement.getGlobalPosition(
          dot.sourceDot.x,
          dot.sourceDot.y
        );
      }

      if (this.targetElement && dot.targetDot) {
        dot.targetPos = this.targetElement.getGlobalPosition(
          dot.targetDot.x,
          dot.targetDot.y
        );
      }
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.circulatingDots.length === 0) {
      requestAnimationFrame(() => this.animate());
      return;
    }

    // Update dot positions every frame to follow moving text blocks
    this.updateDotPositions();

    // Update visible dots in source and target elements
    if (this.sourceElement && this.sourceElement.render) {
      const visibleIndices = this.getVisibleIndices(this.sourceElement);
      this.sourceElement.render(this.sourceElement.progress, null, visibleIndices);
    }
    if (this.targetElement && this.targetElement.render) {
      const visibleIndices = this.getVisibleIndices(this.targetElement);
      this.targetElement.render(this.targetElement.progress, null, visibleIndices);
    }

    this.ctx.fillStyle = '#000';

    // Update and render each circulating dot
    this.circulatingDots.forEach(dot => {
      if (!dot.sourcePos || !dot.targetPos) return;

      // Update phase based on speed variation
      // This controls how fast dots move through their circulation cycle
      dot.phase = (dot.phase + this.circulationSpeed * dot.speedVariation) % 1;

      // Determine state based on phase
      // 0.0 - 0.2: at source
      // 0.2 - 0.5: traveling to target
      // 0.5 - 0.7: at target
      // 0.7 - 1.0: traveling to source

      if (dot.phase < 0.2) {
        dot.state = 'at_source';
      } else if (dot.phase < 0.5) {
        dot.state = 'traveling_to_target';

        // Calculate position along elliptical path from source to target
        const travelProgress = (dot.phase - 0.2) / 0.3; // 0 to 1
        this.calculateEllipticalPosition(dot, dot.sourcePos, dot.targetPos, travelProgress, false);

        // Draw the traveling dot
        this.drawDot(dot);
      } else if (dot.phase < 0.7) {
        dot.state = 'at_target';
      } else {
        dot.state = 'traveling_to_source';

        // Calculate position along elliptical path from target to source
        const travelProgress = (dot.phase - 0.7) / 0.3; // 0 to 1
        this.calculateEllipticalPosition(dot, dot.targetPos, dot.sourcePos, travelProgress, true);

        // Draw the traveling dot
        this.drawDot(dot);
      }
    });

    requestAnimationFrame(() => this.animate());
  }

  calculateEllipticalPosition(dot, fromPos, toPos, progress, reverse) {
    // Linear interpolation for base path
    const baseX = fromPos.x + (toPos.x - fromPos.x) * progress;
    const baseY = fromPos.y + (toPos.y - fromPos.y) * progress;

    // Calculate perpendicular offset for elliptical motion
    const angle = progress * Math.PI; // 0 to PI creates arc
    const ellipseOffset = Math.sin(angle + dot.ellipsePhase);

    // Calculate perpendicular direction
    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length > 0) {
      // Perpendicular vector
      const perpX = -dy / length;
      const perpY = dx / length;

      // Add elliptical offset
      dot.currentPos.x = baseX + perpX * ellipseOffset * dot.ellipseWidth;
      dot.currentPos.y = baseY + perpY * ellipseOffset * dot.ellipseHeight;
    } else {
      dot.currentPos.x = baseX;
      dot.currentPos.y = baseY;
    }
  }

  drawDot(dot) {
    // Add organic floating motion to the traveling dot
    const x = dot.sourceDot.x;
    const y = dot.sourceDot.y;
    const seed = Math.sin(x * 0.1) * 1000 + Math.cos(y * 0.1) * 1000;
    const speedVariation = Math.sin(x * 0.05 + y * 0.05) * 0.5 + 1;

    const angle = globalTime * FLOAT_SPEED * speedVariation + seed;
    const phase = globalTime * 0.03 * speedVariation + seed * 2;

    const radiusVariation = Math.sin(x * 0.08) * 0.5 + 1;
    const offsetX = Math.cos(angle) * FLOAT_RADIUS * radiusVariation + Math.sin(phase) * WAVE_AMOUNT;
    const offsetY = Math.sin(angle) * FLOAT_RADIUS * radiusVariation + Math.cos(phase) * WAVE_AMOUNT;

    this.ctx.fillRect(
      Math.round(dot.currentPos.x) + offsetX,
      Math.round(dot.currentPos.y) + offsetY,
      DOT_SIZE,
      DOT_SIZE
    );
  }

  getVisibleIndices(element) {
    // Returns indices of dots that SHOULD BE SHOWN for this element
    const indices = [];

    if (element === this.sourceElement) {
      // Show static dots
      if (this.sourceStaticDots) {
        this.sourceStaticDots.forEach(dot => {
          indices.push(dot.pixelIndex);
        });
      }

      // Show circulating dots that are currently at source
      this.circulatingDots.forEach(dot => {
        if (dot.state === 'at_source') {
          indices.push(dot.sourceDot.pixelIndex);
        }
      });
    } else if (element === this.targetElement) {
      // Show static target dots
      if (this.targetStaticDots) {
        this.targetStaticDots.forEach(dot => {
          indices.push(dot.pixelIndex);
        });
      }

      // Show circulating dots that are currently at target
      this.circulatingDots.forEach(dot => {
        if (dot.state === 'at_target') {
          indices.push(dot.targetDot.pixelIndex);
        }
      });
    }

    return indices;
  }
}

// Create singleton instance and make it globally accessible
window.migrationManager = new MigrationManager();
