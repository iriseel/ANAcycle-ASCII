# Image + Logo Center - Mousemove Character Cycling

This project combines the click-to-morph functionality from `image+logo-center-2` with the mousemove character cycling from `mousemove`.

## Features

### From image+logo-center-2:
- **Click-to-morph**: Click anywhere to transition between images
- **ANACYCLE logo overlay**: Large centered text overlay that morphs with random character swapping
- **Duotone color effects**: Each transition uses a random color pair
- **Minimal mode toggle**: Button to toggle between colored and black/white mode
- **Screen recording**: Press SPACE to start/stop screen recording

### From mousemove (NEW):
- **Character cycling on mouse movement**: As you move your mouse, ASCII characters randomly cycle through 5 different character sets:
  - Set 0: Circles & symbols (`.`, `○`, `+`, `⁘`, `∗`, `◎`)
  - Set 1: Geometric blocks (`.`, `▫`, `▪`, `◆`, `◼`, `█`)
  - Set 2: Dots progression (`.`, `·`, `∘`, `∙`, `●`, `█`)
  - Set 3: Shade characters (`.`, `░`, `▒`, `▓`, `█`)
  - Set 4: Squares (`.`, `□`, `▣`, `■`, `█`)
- **Smart character selection**: Characters are selected from sets with corresponding visual weight/density
- **Continuous animation**: Mouse movement triggers ongoing character swaps (20% of characters swap per pixel moved)

## How It Works

1. **Initial state**: Display shows first image in ASCII with duotone colors
2. **Mouse movement**: Move your mouse to trigger character cycling - characters will randomly swap between different character sets while maintaining their brightness/weight
3. **Click transition**: Click to morph to the next image with smooth color and character interpolation
4. **Character persistence**: Character cycling continues during image transitions

## Technical Details

- **Character set tracking**: Each ASCII position tracks which character set it's currently using (0-4)
- **Mousemove threshold**: Character swap occurs every 1 pixel of mouse movement
- **Swap percentage**: 20% of all character positions randomly swap on each trigger
- **Set rotation**: Characters cycle through all 5 sets, wrapping back to set 0 after set 4

## Controls

- **Click**: Transition to next image
- **Mouse movement**: Trigger character cycling animation
- **SPACE**: Start/stop screen recording
- **Toggle button** (if enabled): Switch between colored and minimal modes
