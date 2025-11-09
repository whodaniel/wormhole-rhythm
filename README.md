# Wormhole Rhythm Game

A dynamic, immersive rhythm game where players travel through wormholes by shooting portals to the beat. Built with React, TypeScript, and Canvas 2D.

## 🎮 Game Features

- **Dynamic Frogger-Style Gameplay**: Portals move horizontally from left to right across the screen
- **Frequency-Based Spatial Layout**:
  - Bass drums = large portals (left side)
  - Snare drums = medium portals (middle)
  - Hi-hats = small portals (right side)
- **Movement-Controlled Whip Speed**: The faster you move your cursor/touch, the faster the whip action
- **Real Sound Effects**: Spatial audio positioning with Web Audio API
- **Wormhole Travel Experience**: Successfully timed hits transport you through the portal to the next level
- **Touch Screen Support**: Fully optimized for mobile devices with gesture controls
- **Multi-level Progression**: Multiple music tracks and increasing difficulty

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/whodaniel/wormhole-rhythm.git
cd wormhole-rhythm
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Start development server:
```bash
npm run dev
# or
pnpm dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
# or
pnpm build
```

The built files will be in the `dist` directory.

## 🎯 How to Play

1. **Movement**: Move your mouse (or finger on touch devices) to control the whip speed
2. **Timing**: Click (or tap) when the moving whip intersects with portals
3. **Scoring**: Hit portals that match the beat pattern to progress through the wormhole
4. **Progression**: Successfully timed hits transport you to the next level

## 🎵 Music & Audio

- Spatial audio positioning for immersive experience
- Multiple soundtrack themes with beat patterns
- Real sound effects for hits, misses, and portal travel
- Touch-friendly audio controls

## 📱 Mobile Support

- Full touch screen compatibility
- Gesture-based controls
- Optimized UI for mobile devices
- Touch speed tracking for whip mechanics

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Audio**: Web Audio API
- **Graphics**: Canvas 2D
- **Game Engine**: Custom-built with TypeScript

## 📁 Project Structure

```
src/
├── components/         # React components
│   ├── Game.tsx       # Main game component
│   └── GameUI.tsx     # UI elements
├── engine/            # Game engine modules
│   ├── GameEngine.ts  # Core game logic
│   ├── AudioManager.ts # Audio handling
│   ├── InputManager.ts # Input processing
│   └── VisualRenderer.ts # Graphics rendering
├── types/             # TypeScript definitions
└── hooks/             # Custom React hooks
```

## 🎨 Game Mechanics

- **Portals**: Different sizes represent different frequency ranges
- **Whip Physics**: Movement speed directly affects whip action speed
- **Collision Detection**: Precise timing-based hit detection
- **Level Progression**: Portal travel sequences between levels
- **Score System**: Combo bonuses for perfect timing

## 🔧 Development

### Key Files

- `src/components/Game.tsx`: Main game loop and React integration
- `src/engine/GameEngine.ts`: Core game logic and state management
- `src/engine/AudioManager.ts`: Web Audio API integration
- `src/engine/InputManager.ts`: Mouse and touch input handling

### Customization

- **Music**: Add new tracks to `public/assets/audio/`
- **Portals**: Modify portal types in `src/types/game.ts`
- **Visual Style**: Update Tailwind classes in components
- **Sound Effects**: Replace audio files in `public/assets/audio/`

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Note**: This game requires a modern web browser with Web Audio API support for the best experience.
