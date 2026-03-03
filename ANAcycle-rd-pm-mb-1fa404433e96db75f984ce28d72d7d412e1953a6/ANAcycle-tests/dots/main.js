// Generate placeholder items
const content = document.querySelector('.content');
for (let i = 0; i < 48; i++) {
  const item = document.createElement('div');
  item.className = 'placeholder-item';
  content.appendChild(item);
}

// Wire up migration manager once elements are loaded
window.addEventListener('load', () => {
  const dissolveElements = document.querySelectorAll('dissolve-element');
  if (dissolveElements.length >= 2) {
    const anaElement = dissolveElements[0]; // Top element (ANA)
    const cycleElement = dissolveElements[1]; // Bottom element (cycle)

    // Set up the migration manager
    window.migrationManager.setElements(anaElement, cycleElement);
  }
});
