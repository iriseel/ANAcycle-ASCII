# ASCII Text Morph

Scroll-triggered morphing of the text "ANAcycle" through different ASCII character sets.

## Features

- **6 Character Sets**: Each with a unique ASCII style
  1. Minimal Dots
  2. Simple Lines
  3. Geometric
  4. Dense Blocks
  5. Organic
  6. Tech

- **Scroll-Snap Navigation**: Scroll to snap between different character set sections
- **Smooth Transitions**: Morphs between character sets with easing animation
- **Fixed Text Display**: Text stays centered on screen while character sets change

## How It Works

1. Text "ANAcycle" is rendered in bold Arial
2. The rendered text is converted to a pixel grid
3. Each pixel's brightness is mapped to a character from the current set
4. When you scroll, it triggers a smooth transition to the next character set
5. Transitions animate over 1.2 seconds with cubic ease-in-out

## Configuration

Edit `main.js` to customize:

```javascript
// Add or modify character sets
const CHARACTER_SETS = [
  {
    name: 'Your Set Name',
    steps: [' ', '.', ':', '*', '█']  // From empty to full
  }
];

// Change transition speed (ms)
const TRANSITION_DURATION = 1200;

// Change the text
const TEXT = 'ANAcycle';
```

## Character Set Design

Character sets should have 5 characters ordered from empty/light to full/dark:
- Index 0: Empty space or lightest character
- Index 4: Solid block or darkest character

Examples:
- Minimal: `[' ', '.', ':', '*', '█']`
- Lines: `[' ', '-', '=', '≡', '█']`
- Blocks: `[' ', '░', '▒', '▓', '█']`
