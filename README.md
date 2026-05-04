# Procedural Flower Animation

A faithful React + p5.js port of an interactive 3D peony bloom, with 14 flower presets, live render-mode cycling (ASCII / dots / pixels / clean), glitch FX, and a glass-morphism control panel.

Live demo: https://<your-username>.github.io/<your-repo>/

## Features

- **True 3D bloom**: layered ruffled petals, sepals, stamens, leafy stem, mouse-driven rotation
- **Lifecycle**: bloom → interactive → wilt → respawn, with adjustable speeds and duration
- **14 flower presets**: Peony, Pink Peony, Magenta Peony, Red Rose, Yellow Rose, Dahlia, Camellia, Chrysanthemum, Daisy, Sunflower, Cherry Blossom, Lotus, Iris, Marigold
- **Render modes**: Auto Cycle, Clean (no FX), ASCII, Dots, Pixels — with selectable ASCII charsets (letters / binary / symbols / blocks)
- **Glitch FX**: toggleable horizontal slice displacement with frequency / intensity sliders
- **Custom palette**: 4 color pickers (highlight / base / center / stem) plus background color
- **Snapshot**: save the current frame as a PNG
- **Keyboard shortcuts**: Space (pause), H (hide UI), G (glitch), R (restart), F (fullscreen), S (snapshot), ←/→ (prev/next flower)

## Tech stack

- React 18 + Vite 7 + TypeScript
- p5.js (instance mode) for the procedural sketch
- Tailwind CSS + shadcn/ui + Radix primitives for the control panel
- Framer Motion for UI transitions
- pnpm workspaces (monorepo)

## Project structure

```
artifacts/
  flower-animation/        # The deployable web app
    src/
      sketch/              # p5.js sketch, flower presets, types
      components/          # Sketch wrapper + ControlPanel
      App.tsx              # Orchestrates state + sketch
.github/workflows/
  deploy.yaml              # Builds and publishes to GitHub Pages
```

## Local development

This is a pnpm monorepo managed by Replit's workflow system.

```bash
pnpm install
pnpm --filter @workspace/flower-animation run dev
```

The dev server reads `PORT` and `BASE_PATH` from the environment (provided by the workflow runner).

## License

MIT
