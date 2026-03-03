# Type - Dotted Text Migration

## Overview
Scroll-based animation where dots migrate from "ANA" to "cycle". Dots physically travel between words, synchronized with scroll position.

## Files
- **index.html**: HTML structure with density configuration
- **style.css**: Styling for containers and placeholder grid
- **main.js**: Initializes migration manager and generates placeholders
- **dissolve-element.js**: Web component for dotted text rendering
- **migration-manager.js**: Controls dot migration and particle animation

## Configuration (in HTML)
```html
<dissolve-element
  text="ANA"
  density-start="0.5"   <!-- Initial density (0-1) -->
  density-end="0.05"    <!-- Final density (0-1) -->
  track="documentPosition">
```

## How It Works
1. **Pre-pairing**: Each dot from source is paired with target dot on load
2. **Scroll-driven**: Dot position = `currentScroll / dotCompletionPoint`
3. **Pure migration**: Dots only move, never appear/disappear independently
4. **Visibility control**:
   - Source shows: permanent dots + not-yet-migrated dots
   - Target shows: baseline dots + arrived dots
   - Migrating dots render on overlay canvas

## Key Parameters
- `density-start`: Percentage visible at scroll=0 (e.g., 0.5 = 50%)
- `density-end`: Percentage visible at scroll=100%
- Migration amount = `start - end` (auto-calculated)

## Customization
Edit HTML attributes to change densities. Migration manager reads them automatically.
