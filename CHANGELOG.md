# Changelog

## Unreleased

- New medium: `paper`, cut and torn construction-paper collage with fibrous torn edges, paper grain, layered shadows and washi tape on cards and modals. Dark mode is bright scraps on black card stock.
- New medium: `marker`, felt-tip scribbles with diagonal back-and-forth strokes, rounded overshooting stroke ends and translucent ink that darkens where strokes cross. Dark mode is paint markers on black paper.
- Acrylic repainted as thick broken-color impasto: short directional dabs of several related tints, lit ridges and gloss, and edges made of staggered stroke ends instead of a flat fill with a streak texture.
- New tokens: `--am-filter-panel` and `--am-filter-splash` (per-medium filters for panels and splashes), `--am-panel-stroke` (outline for cards, inputs, nav and modals), `--am-label-shadow`.
- Inputs inside a modal keep their own surface instead of taking the modal's paper color.

## 0.1.0

First release.

- Mediums: watercolor, acrylic, charcoal, chosen with `data-medium` on any element.
- Light and dark themes for every medium with `data-theme="light | dark | auto"`.
- Components: button, badge, card, input, divider, nav, modal, splash, canvas.
- `am--secondary` and `am--accent` pigment variants.
- `setMedium()` and `setTheme()` helpers, and optional React wrappers (`art-medium/react`).
