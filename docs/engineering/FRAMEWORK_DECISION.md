# FRAMEWORK_DECISION

## Decision

Use Vite + React + TypeScript for the first playable prototype.

Render the MVP board with DOM/CSS grid, not canvas.

## Rationale

The game is a tap-based sorting puzzle with text labels, readable ingredients, stable mobile layout, and Toss SDK UI integration. DOM rendering keeps the first prototype accessible, easy to test, and fast to iterate.

React is acceptable because:

- The board is small: 5x6 visible cells plus tray and UI.
- State transitions are simple.
- Text and accessibility are important.
- Playwright/browser verification is straightforward.
- Toss SDK wrappers can be isolated cleanly.

TypeScript is required because:

- Deterministic board generation and scoring need strong types.
- Analytics schemas and platform adapters should be explicit.
- Future QA can test pure game-engine functions.

## Initial Architecture

```text
src/
  app/
    App.tsx
    routes.ts
  game/
    engine/
      board.ts
      scoring.ts
      moves.ts
      dailySeed.ts
    data/
      ingredients.ts
      recipes.ts
      boards.ts
    state/
      gameStore.ts
  platform/
    tossClient.ts
    tossMockClient.ts
    analytics.ts
  ui/
    components/
    screens/
    styles/
  qa/
    scenarios/
```

## Libraries

MVP:

- `vite`
- `react`
- `react-dom`
- `typescript`
- `lucide-react` for simple UI icons
- `zustand` only if state becomes noisy; otherwise React state is enough
- `vitest` for engine tests
- `@playwright/test` for browser verification

Avoid initially:

- Phaser/Pixi/Three.js.
- Heavy animation libraries.
- UI component libraries that create large bundle overhead.
- SSR frameworks.

## Rendering Rule

Use DOM grid for:

- Fridge tiles.
- Prep tray.
- Buttons and result screen.

Animation should use CSS transforms and opacity.

Move to canvas only if:

- DOM performance fails after measurement.
- Ingredient count becomes much larger.
- Advanced particle animation becomes core to the product.

## Build Targets

- CSR static build.
- Mobile-first layout.
- Fast first playable UI.
- Toss SDK behind adapter layer.
- Mock platform mode for local browser and CI.

## Testing Strategy

Unit tests:

- Board seed generation.
- Move application.
- Match clear behavior.
- Recipe clear behavior.
- Score determinism.

Browser tests:

- First playable render.
- Tutorial flow.
- Fixed board complete path.
- Mobile viewports.
- No console errors.

## Decision Status

Accepted for first prototype.

