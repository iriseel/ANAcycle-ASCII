// Handle click to trigger animation
let isAnimated = false;

document.addEventListener('click', () => {
  if (!isAnimated) {
    const container = document.querySelector('.anacycle-container');

    if (container) {
      container.classList.add('clicked');
      isAnimated = true;
      console.log('Animation triggered - ANACYCLE moving to top-left and shrinking');
    }
  }
});

// Optional: Allow reset on double-click
document.addEventListener('dblclick', () => {
  const container = document.querySelector('.anacycle-container');

  if (container) {
    container.classList.remove('clicked');
    isAnimated = false;
    console.log('Animation reset - ANACYCLE back to center');
  }
});
