// ============================================
// EFFECT 1: LIQUID WAVE FILL
// ============================================

class WaveAnimation {
  constructor() {
    this.wavePath = document.querySelector('.wave-path');
    if (!this.wavePath) return;

    this.time = 0;
    this.animate();
  }

  generateWavePath() {
    const width = 800;
    const height = 200;
    const waveHeight = 30;
    const frequency = 3;

    let path = 'M 0 ';

    // Create organic wave with multiple sine waves
    const baseY = 100 + Math.sin(this.time * 0.5) * 20;
    path += baseY;

    for (let x = 0; x <= width; x += 10) {
      const wave1 = Math.sin((x / 100 + this.time) * frequency) * waveHeight;
      const wave2 = Math.sin((x / 150 + this.time * 0.7) * 2) * (waveHeight * 0.5);
      const wave3 = Math.sin((x / 80 + this.time * 1.3) * 4) * (waveHeight * 0.3);

      const y = baseY + wave1 + wave2 + wave3;
      path += ` L ${x} ${y}`;
    }

    path += ` L ${width} ${height} L 0 ${height} Z`;

    return path;
  }

  animate() {
    this.time += 0.02;
    const newPath = this.generateWavePath();
    this.wavePath.setAttribute('d', newPath);

    requestAnimationFrame(() => this.animate());
  }
}

// ============================================
// EFFECT 2: PARTICLE EXPLOSION
// ============================================

class ParticleEffect {
  constructor() {
    this.canvas = document.getElementById('particle-canvas');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.text = 'ANA cycle';

    this.resize();
    window.addEventListener('resize', () => this.resize());

    this.createParticles();
    this.animate();
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  createParticles() {
    // Create temporary canvas to get text pixels
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;
    const tempCtx = tempCanvas.getContext('2d');

    // Draw text
    tempCtx.fillStyle = '#fff';
    tempCtx.font = 'bold 120px Arial';
    tempCtx.textAlign = 'center';
    tempCtx.textBaseline = 'middle';
    tempCtx.fillText(this.text, tempCanvas.width / 2, tempCanvas.height / 2);

    // Get image data
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const pixels = imageData.data;

    // Sample pixels and create particles
    const gap = 4; // Sample every 4 pixels
    for (let y = 0; y < tempCanvas.height; y += gap) {
      for (let x = 0; x < tempCanvas.width; x += gap) {
        const index = (y * tempCanvas.width + x) * 4;
        const alpha = pixels[index + 3];

        if (alpha > 128) {
          this.particles.push(new Particle(x, y));
        }
      }
    }
  }

  animate() {
    this.ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach(particle => {
      particle.update();
      particle.draw(this.ctx);
    });

    requestAnimationFrame(() => this.animate());
  }
}

class Particle {
  constructor(x, y) {
    this.homeX = x;
    this.homeY = y;
    this.x = x;
    this.y = y;

    // Organic movement parameters (reduced for legibility)
    this.angle = Math.random() * Math.PI * 2;
    this.radius = Math.random() * 8 + 3; // Reduced from 50+20 to 8+3
    this.speed = Math.random() * 0.03 + 0.015;
    this.phase = Math.random() * Math.PI * 2;

    // Color
    const colors = [
      { r: 255, g: 0, b: 110 },   // Pink
      { r: 131, g: 56, b: 236 },  // Purple
      { r: 58, g: 134, b: 255 },  // Blue
      { r: 6, g: 255, b: 165 }    // Cyan
    ];
    this.color = colors[Math.floor(Math.random() * colors.length)];

    // Size variation
    this.size = Math.random() * 2 + 1;
  }

  update() {
    // Create subtle organic circular motion around home position
    this.angle += this.speed;
    this.phase += 0.02;

    const offsetX = Math.cos(this.angle) * this.radius;
    const offsetY = Math.sin(this.angle) * this.radius;

    // Add subtle secondary wave motion
    const wave = Math.sin(this.phase) * 3; // Reduced from 10 to 3

    this.x = this.homeX + offsetX + wave;
    this.y = this.homeY + offsetY + Math.cos(this.phase) * 3; // Reduced from 10 to 3
  }

  draw(ctx) {
    ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.8)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    // Add glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.5)`;
  }
}

// ============================================
// EFFECT 4: FLOWING GRADIENT (Additional Animation)
// ============================================

class GradientFlow {
  constructor() {
    this.gradient = document.getElementById('flowing-gradient');
    if (!this.gradient) return;

    this.time = 0;
    this.animate();
  }

  animate() {
    this.time += 0.5;

    // Animate gradient position
    const x1 = 50 + Math.sin(this.time * 0.02) * 50;
    const y1 = 50 + Math.cos(this.time * 0.03) * 50;
    const x2 = 50 + Math.cos(this.time * 0.025) * 50;
    const y2 = 50 + Math.sin(this.time * 0.035) * 50;

    this.gradient.setAttribute('x1', `${x1}%`);
    this.gradient.setAttribute('y1', `${y1}%`);
    this.gradient.setAttribute('x2', `${x2}%`);
    this.gradient.setAttribute('y2', `${y2}%`);

    requestAnimationFrame(() => this.animate());
  }
}

// ============================================
// EFFECT 5: SCROLL-BASED TURBULENT DISPLACEMENT
// ============================================

class ScrollTurbulence {
  constructor() {
    this.textTurbulence = document.getElementById('text-turbulence');
    this.textDisplacement = document.getElementById('text-displacement');
    this.imgTurbulence = document.querySelectorAll('.img-turbulence');
    this.imgDisplacement = document.querySelectorAll('.img-displacement');

    if (!this.textTurbulence || !this.textDisplacement) return;

    this.lastScrollY = window.scrollY;
    this.scrollVelocity = 0;

    window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
  }

  handleScroll() {
    const currentScrollY = window.scrollY;
    const delta = Math.abs(currentScrollY - this.lastScrollY);

    // Calculate scroll velocity (how fast user is scrolling)
    this.scrollVelocity = Math.min(delta / 10, 1); // Normalize to 0-1

    // Map velocity to frequency and scale
    const baseFrequency = 0.01 + (this.scrollVelocity * 0.02); // 0.01 to 0.03
    const scale = 5 + (this.scrollVelocity * 20); // 5 to 25

    // Update text turbulence
    this.textTurbulence.setAttribute('baseFrequency', baseFrequency);
    this.textDisplacement.setAttribute('scale', scale);

    // Update image turbulence
    this.imgTurbulence.forEach(turbulence => {
      turbulence.setAttribute('baseFrequency', baseFrequency);
    });

    this.imgDisplacement.forEach(displacement => {
      displacement.setAttribute('scale', scale);
    });

    this.lastScrollY = currentScrollY;
  }
}

// ============================================
// INITIALIZE ALL EFFECTS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  new WaveAnimation();
  new ParticleEffect();
  new GradientFlow();
  new ScrollTurbulence();
});
