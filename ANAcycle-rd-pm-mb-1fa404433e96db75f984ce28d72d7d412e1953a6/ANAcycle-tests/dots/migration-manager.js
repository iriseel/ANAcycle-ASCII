class MigrationManager {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.sourceElement = null; // ANA
    this.targetElement = null; // cycle
    this.dotPairs = []; // Pre-assigned pairs of dots that will migrate
    this.sourceNonMigrating = []; // Dots that stay in source
    this.targetAlwaysVisible = []; // Dots always visible in target
    this.currentScrollProgress = 0;

    this.init();
  }

  init() {
    // Create full-screen canvas for migrating particles
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
      this.updateDotPairPositions();
    });

    window.addEventListener('scroll', () => this.onScroll());

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
      this.setupDotPairs();
      this.onScroll(); // Initialize scroll position
      console.log('Migration manager initialized with', sourceElement, targetElement);
      console.log('Created', this.dotPairs.length, 'dot pairs');
    }, 100);
  }

  setupDotPairs() {
    if (!this.sourceElement.dotPositions || !this.targetElement.dotPositions) return;
    if (this.sourceElement.dotPositions.length === 0 || this.targetElement.dotPositions.length === 0) return;

    this.dotPairs = [];

    // Read density configuration from HTML attributes
    const sourceStartDensity = parseFloat(this.sourceElement.getAttribute('density-start')) || 0.5;
    const sourceEndDensity = parseFloat(this.sourceElement.getAttribute('density-end')) || 0.05;
    const targetStartDensity = parseFloat(this.targetElement.getAttribute('density-start')) || 0.05;
    const targetEndDensity = parseFloat(this.targetElement.getAttribute('density-end')) || 0.5;

    // Calculate migration percentage
    const migrationPercent = sourceStartDensity - sourceEndDensity;

    // Get source dots sorted by threshold for even distribution
    const sourceDots = [...this.sourceElement.dotPositions].sort((a, b) => a.threshold - b.threshold);

    // Get target dots
    const targetDots = [...this.targetElement.dotPositions];

    // Determine which dots migrate
    const numDotsToMigrate = Math.floor(sourceDots.length * migrationPercent);

    // Dots that will migrate (middle range to keep some at start and end)
    const migratingDots = sourceDots.slice(
      Math.floor(sourceDots.length * sourceEndDensity),
      Math.floor(sourceDots.length * sourceStartDensity)
    );

    // Pair migrating source dots with random target dots
    migratingDots.forEach((sourceDot, index) => {
      const targetDot = targetDots[Math.floor(Math.random() * targetDots.length)];
      if (!targetDot) return;

      // Each dot completes at different times for smooth migration
      const completionPoint = index / migratingDots.length;

      this.dotPairs.push({
        sourceDot,
        targetDot,
        completionPoint,
        sourcePos: null,
        targetPos: null,
        currentPos: { x: 0, y: 0 },
        state: 'source'
      });
    });

    // Store non-migrating dots
    this.sourceNonMigrating = sourceDots.slice(0, Math.floor(sourceDots.length * sourceEndDensity));
    this.targetAlwaysVisible = targetDots.slice(0, Math.floor(targetDots.length * targetStartDensity));

    console.log('Migration setup:', {
      sourceStartDensity: sourceStartDensity,
      sourceEndDensity: sourceEndDensity,
      targetStartDensity: targetStartDensity,
      targetEndDensity: targetEndDensity,
      totalSourceDots: sourceDots.length,
      totalTargetDots: targetDots.length,
      migratingDots: migratingDots.length,
      sourceNonMigrating: this.sourceNonMigrating.length,
      targetAlwaysVisible: this.targetAlwaysVisible.length
    });

    this.updateDotPairPositions();
  }

  updateDotPairPositions() {
    // Update screen positions for all dot pairs
    this.dotPairs.forEach(pair => {
      if (this.sourceElement && pair.sourceDot) {
        pair.sourcePos = this.sourceElement.getGlobalPosition(
          pair.sourceDot.x,
          pair.sourceDot.y
        );
      }

      if (this.targetElement && pair.targetDot) {
        pair.targetPos = this.targetElement.getGlobalPosition(
          pair.targetDot.x,
          pair.targetDot.y
        );
      }
    });
  }

  getRandomTargetDot() {
    if (!this.targetElement || this.targetElement.dotPositions.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * this.targetElement.dotPositions.length);
    return this.targetElement.dotPositions[randomIndex];
  }

  onScroll() {
    if (!this.sourceElement || !this.targetElement) return;
    if (this.dotPairs.length === 0) return;

    // Calculate scroll progress (0 to 1) over the full page height
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = maxScroll > 0 ? Math.min(
      document.documentElement.scrollTop / maxScroll,
      1
    ) : 0;

    this.currentScrollProgress = scrollProgress;
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.dotPairs.length === 0) {
      requestAnimationFrame(() => this.animate());
      return;
    }

    // Trigger source and target elements to re-render with visible dots
    if (this.sourceElement && this.sourceElement.render) {
      const visibleIndices = this.getVisibleIndices(this.sourceElement);
      this.sourceElement.render(this.sourceElement.progress, null, visibleIndices);
    }
    if (this.targetElement && this.targetElement.render) {
      const visibleIndices = this.getVisibleIndices(this.targetElement);
      this.targetElement.render(this.targetElement.progress, null, visibleIndices);
    }

    this.ctx.fillStyle = '#000';

    // Update and render each dot based on scroll position
    this.dotPairs.forEach(pair => {
      if (!pair.sourcePos || !pair.targetPos) return;

      const scroll = this.currentScrollProgress;

      // Determine dot state and position based on scroll
      if (scroll >= pair.completionPoint) {
        // Dot has arrived at target
        pair.state = 'target';
      } else {
        // Dot is migrating - calculate position along path
        // Progress goes from 0 (at source) to completionPoint (at target)
        const migrationProgress = scroll / pair.completionPoint;

        if (migrationProgress <= 0) {
          pair.state = 'source';
        } else {
          pair.state = 'migrating';

          // Linear interpolation between source and target
          pair.currentPos.x = pair.sourcePos.x +
                             (pair.targetPos.x - pair.sourcePos.x) * migrationProgress;
          pair.currentPos.y = pair.sourcePos.y +
                             (pair.targetPos.y - pair.sourcePos.y) * migrationProgress;

          // Draw the migrating dot with organic floating motion
          // Use the source dot position for consistent seed (not current position)
          const x = pair.sourceDot.x;
          const y = pair.sourceDot.y;
          const seed = Math.sin(x * 0.1) * 1000 + Math.cos(y * 0.1) * 1000;
          const speedVariation = Math.sin(x * 0.05 + y * 0.05) * 0.5 + 1;

          const angle = globalTime * FLOAT_SPEED * speedVariation + seed;
          const phase = globalTime * 0.03 * speedVariation + seed * 2;

          const radiusVariation = Math.sin(x * 0.08) * 0.5 + 1;
          const offsetX = Math.cos(angle) * FLOAT_RADIUS * radiusVariation + Math.sin(phase) * WAVE_AMOUNT;
          const offsetY = Math.sin(angle) * FLOAT_RADIUS * radiusVariation + Math.cos(phase) * WAVE_AMOUNT;

          this.ctx.fillRect(
            Math.round(pair.currentPos.x) + offsetX,
            Math.round(pair.currentPos.y) + offsetY,
            DOT_SIZE,
            DOT_SIZE
          );
        }
      }
    });

    requestAnimationFrame(() => this.animate());
  }

  getVisibleIndices(element) {
    // Returns indices of dots that SHOULD BE SHOWN for this element
    const indices = [];

    if (element === this.sourceElement) {
      // Show permanent dots (always visible)
      const permanentCount = this.sourceNonMigrating ? this.sourceNonMigrating.length : 0;
      if (this.sourceNonMigrating) {
        this.sourceNonMigrating.forEach(dot => {
          indices.push(dot.pixelIndex);
        });
      }

      // Plus show migrating dots that haven't left yet
      let notLeftYet = 0;
      this.dotPairs.forEach(pair => {
        if (pair.state === 'source') {
          indices.push(pair.sourceDot.pixelIndex);
          notLeftYet++;
        }
      });

      // Debug: log first time only
      if (!this._loggedSource) {
        console.log(`Source visible dots: ${permanentCount} permanent + ${notLeftYet} not-left-yet = ${indices.length} total`);
        this._loggedSource = true;
      }
    } else if (element === this.targetElement) {
      // Show always-visible target dots (baseline)
      if (this.targetAlwaysVisible) {
        this.targetAlwaysVisible.forEach(dot => {
          indices.push(dot.pixelIndex);
        });
      }

      // Plus show arrived dots from migration
      this.dotPairs.forEach(pair => {
        if (pair.state === 'target') {
          indices.push(pair.targetDot.pixelIndex);
        }
      });
    }

    return indices;
  }
}

// Create singleton instance and make it globally accessible
window.migrationManager = new MigrationManager();
