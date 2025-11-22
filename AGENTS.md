# Repository Guidelines

## Project Structure & Module Organization
- Source lives in `src/`; the entry point `src/main.js` bootstraps `Game`.
- Core systems: `Game` orchestrates `Player`, `Input`, `EntityManager`, `WorldManager`, `CameraManager`, `AudioManager`, `BuildSystem`, `SaveManager`, `SaveLoadUI`, plus entities such as `Block`, `Tree`, `Rock`, and `Slime`.
- Tests sit in `src/__tests__` using Vitest with jsdom; shared hooks are in `src/__tests__/setup.js`.
- Static assets belong in `public/`; Vite serves them at the project root. Builds emit to `dist/` (gitignored).

## Build, Test, and Development Commands
- `npm install` once to fetch dependencies.
- `npm run dev` launches the Vite dev server at `http://localhost:5173` with hot reload.
- `npm run build` creates a production bundle in `dist/`.
- `npm run preview` serves the built bundle locally to validate production output.
- `npx vitest` runs tests in watch mode; `npx vitest run` for CI-friendly runs; add `--coverage` when collecting metrics.

## Coding Style & Naming Conventions
- ES modules with one class per file; classes use PascalCase (e.g., `PlayerPhysics`), instances use camelCase (`playerPhysics`), constants use SCREAMING_SNAKE_CASE.
- 4-space indentation, semicolons, and single quotes; group imports by library first, then local modules.
- Prefer small, composable classes over large conditional blocks (follow the `Entity` extension pattern), and reuse managers instead of inlining logic.
- Keep DOM/UI tweaks in `SaveLoadUI` minimal and VR-safe; canvas/Three.js configuration belongs in `Game`.

## Testing Guidelines
- Vitest with jsdom is configured in `vitest.config.js`; tests live in `src/__tests__` and end with `.test.js`.
- Mirror file names for clarity (`PlayerCombat.test.js` matches `PlayerCombat.js`); stub DOM and audio in setup when needed.
- Cover physics/combat edge cases (gravity, cooldowns, save/load) before merging; keep tests deterministic (avoid real timers or randomness without seeding).

## Commit & Pull Request Guidelines
- Commit messages: imperative and focused, optionally scoped (`Refactor: simplify PlayerCombat`); keep them short; Japanese is fine if clear.
- PRs should state motivation and behavior changes, list test commands run (`npx vitest run`, `npm run build`), include VR/desktop screenshots or clips for UX changes, and link issues/tasks when available.
- Keep diffs cohesive; update docs when controls, save formats, or build steps change.

## Security & Configuration Tips
- Do not commit credentials; store runtime config in `.env.local` and load through Vite env variables.
- WebXR needs HTTPS in production; use localhost during development and provide fallbacks when a headset is absent.
- Audio and file APIs are permissioned; keep prompts behind user actions (follow the click-to-start overlay pattern in `Game`).
