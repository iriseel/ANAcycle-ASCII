class PositionManager {
  constructor() {
    this.anaContainer = null;
    this.cycleContainer = null;

    // Distance constraints for repositioning
    this.minMoveDistance = 400; // Minimum pixels to move from current position
    this.maxMoveDistance = 800; // Maximum pixels to move from current position

    // Track current positions (center of container)
    this.anaCurrentPos = null;
    this.cycleCurrentPos = null;

    this.init();
  }

  init() {
    // Trigger repositioning on click anywhere on the page
    document.addEventListener('click', () => this.onClick());

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupContainers());
    } else {
      this.setupContainers();
    }
  }

  setupContainers() {
    this.anaContainer = document.querySelector('.ana-container');
    this.cycleContainer = document.querySelector('.cycle-container');

    if (this.anaContainer && this.cycleContainer) {
      console.log('Position manager initialized');
      // Set initial random positions
      this.repositionElements();
    }
  }

  onClick() {
    // Reposition elements on each click
    this.repositionElements();
    console.log('Click detected - repositioning elements');
  }

  repositionElements() {
    if (!this.anaContainer || !this.cycleContainer) return;

    // Always position completely randomly - no distance constraints
    const cyclePosition = this.getRandomEdgePosition();
    const anaPosition = this.getRandomEdgePosition();

    this.applyPosition(this.anaContainer, anaPosition);
    this.applyPosition(this.cycleContainer, cyclePosition);

    // Update tracked positions (kept for potential future use)
    this.anaCurrentPos = this.getPixelPositionFromEdge(anaPosition);
    this.cycleCurrentPos = this.getPixelPositionFromEdge(cyclePosition);

    console.log('Repositioned - ANA:', anaPosition.edge, 'at', Math.round(anaPosition.offset * 100) + '%',
                '| cycle:', cyclePosition.edge, 'at', Math.round(cyclePosition.offset * 100) + '%');
  }

  getRandomEdgePosition() {
    const edges = ['top', 'right', 'bottom', 'left'];
    const edge = edges[Math.floor(Math.random() * edges.length)];

    // For each edge, generate a random position that avoids the center
    // Bias toward corners: 0-30% or 70-100%
    let offset;
    if (Math.random() < 0.5) {
      // Left/top third: 0-30%
      offset = Math.random() * 0.3;
    } else {
      // Right/bottom third: 70-100%
      offset = 0.7 + Math.random() * 0.3;
    }

    let position = {
      edge: edge,
      offset: offset // 0 to 1, will be converted to percentage
    };

    return position;
  }

  applyPosition(container, position) {
    // Always use top/left with transforms for smooth transitions
    // Calculate the pixel position for the given edge and offset
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top, left, transform;

    switch(position.edge) {
      case 'top':
        // Top edge: y=0, x varies along width
        top = 0;
        left = vw * position.offset;
        transform = 'translate(-50%, 0)';
        break;

      case 'bottom':
        // Bottom edge: y=100%, x varies along width
        top = vh;
        left = vw * position.offset;
        transform = 'translate(-50%, -100%)';
        break;

      case 'left':
        // Left edge: x=0, y varies along height
        top = vh * position.offset;
        left = 0;
        transform = 'translate(0, -50%)';
        break;

      case 'right':
        // Right edge: x=100%, y varies along height
        top = vh * position.offset;
        left = vw;
        transform = 'translate(-100%, -50%)';
        break;
    }

    // Apply position using only top/left (no bottom/right)
    // This ensures smooth CSS transitions
    container.style.top = top + 'px';
    container.style.left = left + 'px';
    container.style.transform = transform;
    container.style.bottom = 'auto';
    container.style.right = 'auto';
  }

  // Get current pixel position of container center
  getCurrentPixelPosition(container) {
    const rect = container.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  // Convert edge/offset to pixel position
  getPixelPositionFromEdge(position) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    switch(position.edge) {
      case 'top':
        return { x: vw * position.offset, y: 0 };
      case 'bottom':
        return { x: vw * position.offset, y: vh };
      case 'left':
        return { x: 0, y: vh * position.offset };
      case 'right':
        return { x: vw, y: vh * position.offset };
      default:
        return { x: 0, y: 0 };
    }
  }

  // Calculate Euclidean distance between two points
  getDistance(pos1, pos2) {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Get random edge position near current position (between minMoveDistance and maxMoveDistance)
  getRandomEdgePositionNear(currentPos) {
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      const position = this.getRandomEdgePosition();
      const newPos = this.getPixelPositionFromEdge(position);
      const distance = this.getDistance(currentPos, newPos);

      // Must be at least minMoveDistance and at most maxMoveDistance
      if (distance >= this.minMoveDistance && distance <= this.maxMoveDistance) {
        return position;
      }

      attempts++;
    }

    // If we can't find a position within distance range, move exactly minMoveDistance in random direction
    return this.getPositionAtDistance(currentPos, this.minMoveDistance);
  }

  // Get the closest edge position to current position
  getClosestEdgePosition(currentPos) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Calculate which edge is closest
    const distToTop = currentPos.y;
    const distToBottom = vh - currentPos.y;
    const distToLeft = currentPos.x;
    const distToRight = vw - currentPos.x;

    const minDist = Math.min(distToTop, distToBottom, distToLeft, distToRight);

    let edge, offset;

    if (minDist === distToTop) {
      edge = 'top';
      offset = currentPos.x / vw;
    } else if (minDist === distToBottom) {
      edge = 'bottom';
      offset = currentPos.x / vw;
    } else if (minDist === distToLeft) {
      edge = 'left';
      offset = currentPos.y / vh;
    } else {
      edge = 'right';
      offset = currentPos.y / vh;
    }

    return { edge, offset };
  }

  // Get position at exact distance from current position
  getPositionAtDistance(currentPos, distance) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Try to find an edge position at approximately the target distance
    const edges = ['top', 'right', 'bottom', 'left'];

    for (let edge of edges) {
      // Try multiple offsets along this edge
      for (let i = 0; i < 10; i++) {
        const offset = Math.random();
        const testPos = this.getPixelPositionFromEdge({ edge, offset });
        const testDistance = this.getDistance(currentPos, testPos);

        // If close enough to target distance (within 20%), use it
        if (Math.abs(testDistance - distance) < distance * 0.2) {
          return { edge, offset };
        }
      }
    }

    // Fallback: return closest edge position
    return this.getClosestEdgePosition(currentPos);
  }

  // Get a position that's top-left relative to the reference position (cycle)
  // ANA must have: x < cycle.x AND y < cycle.y
  getTopLeftRelativePosition(cyclePos) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      // Try random edge positions
      const edge = ['top', 'left', 'right', 'bottom'][Math.floor(Math.random() * 4)];
      let offset;

      // Bias toward edges that are more likely to be top-left
      if (edge === 'top') {
        // On top edge: bias toward left side
        offset = Math.random() * 0.5; // 0-50%
      } else if (edge === 'left') {
        // On left edge: bias toward top
        offset = Math.random() * 0.5; // 0-50%
      } else if (edge === 'bottom') {
        // On bottom edge: only use left portion
        offset = Math.random() * 0.3; // 0-30%
      } else if (edge === 'right') {
        // On right edge: only use top portion
        offset = Math.random() * 0.3; // 0-30%
      }

      const testPos = this.getPixelPositionFromEdge({ edge, offset });

      // Check if this position is top-left relative to cycle
      if (testPos.x < cyclePos.x && testPos.y < cyclePos.y) {
        return { edge, offset };
      }

      attempts++;
    }

    // Fallback: force position on top-left corner
    console.warn('Could not find top-left position relative to cycle, using fallback');
    return { edge: 'top', offset: 0.1 };
  }
}

// Create singleton instance
window.positionManager = new PositionManager();
