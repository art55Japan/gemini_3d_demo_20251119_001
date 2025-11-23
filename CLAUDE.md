# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start dev server at http://localhost:5173

# Build
npm run build        # Build for production to dist/

# Testing
npx vitest           # Run all tests
npx vitest run       # Run tests once (CI mode)
npx vitest <file>    # Run specific test file (e.g., npx vitest Entity.test.js)
```

## Architecture

This is a Three.js WebXR game with a 4-layer architecture:

```
Presentation   → THREE.WebGLRenderer, DOM UI
Application    → Game (main controller, game loop)
Domain         → Entity system (Player, Slime, Block, Tree, Rock)
Infrastructure → Input, SaveManager, AudioManager, CameraManager
```

### Core Patterns

**Entity System**: All game objects inherit from `Entity` base class. Key interface:
- `update(delta, input, time, collidables, entities)` - per-frame logic
- `shouldRemove` flag - set true for EntityManager to remove next frame
- `isSaveable()` / `toSaveData()` / `fromSaveData()` - polymorphic serialization

**Player Components**: Player uses composition pattern:
- `PlayerMesh` - 3D model (felt rabbit paladin)
- `PlayerPhysics` - gravity, collision, knockback
- `PlayerCombat` - attack state machine (IdleState/AttackingState)
- `PlayerCollision` - enemy collision handling

**State Pattern**: Both `PlayerCombat` and `Slime` use state pattern for behavior:
- States have `enter()`, `update()`, `exit()` methods
- State transitions via `setState(new XState(this))`

### Game Loop (Game.render)

```
1. getDelta/getElapsedTime from THREE.Clock
2. input.getState() → inputState object
3. Handle save/load/menu with cooldown timers
4. If UI visible → render only, skip updates
5. buildSystem.update() → entityManager.update() → cameraManager.update()
6. renderer.render()
```

### Save System

- `SaveManager` handles localStorage persistence
- Quick save/load: K/L keys with 1s cooldown
- Entities with `isSaveable()=true` are serialized (Block, Slime when alive)
- Player position saved separately

### Key Constants (PlayerPhysics)

- gravity: -30 m/s²
- jumpStrength: 15 m/s
- speed: 10 m/s
- playerRadius: 0.3m

## Testing

Tests use Vitest with jsdom. Setup file (`src/__tests__/setup.js`) mocks:
- localStorage
- Canvas getContext (for Three.js textures)
- Audio API

Test files are in `src/__tests__/*.test.js`.

## Documentation

Detailed design docs in `gemini_3d_demo_20251119_001_Obisidian/設計書_ClaudeCodeによるリバース/`:
- MOC and 10 documents covering architecture, entities, player systems, save system, graphics, UI, and data definitions
- Documents are in Japanese, designed for rebuilding the app from scratch
