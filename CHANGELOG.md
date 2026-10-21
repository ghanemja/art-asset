# Changelog

## 0.2.0 (2026-10-17)

- Renamed to **Splatform** (npm package `@ghanemja/splatform`). Files, `am-` class names and `--am-*` tokens are unchanged, so existing markup keeps working.
- New medium: `paper`, cut and torn construction-paper collage with fibrous torn edges, paper grain, layered shadows and washi tape on cards and modals. Dark mode is bright scraps on black card stock.
- New medium: `marker`, felt-tip scribbles: a few fat strokes in one back-and-forth zig-zag with rounded hairpin turns, translucent ink that darkens where it overlaps, and a wobbly marker outline with a highlighter swipe on panels. Dark mode is paint markers on black paper with white labels.
- Acrylic repainted as thick broken-color impasto: short directional dabs of several related tints, lit ridges and gloss, and edges made of staggered stroke ends instead of a flat fill with a streak texture.
- Acrylic styles with `data-style="impasto | impressionist | realism"` (impasto stays the default): impressionist is flat matte planes in broad strokes over a warm terracotta ground; realism is smooth, softly lit, blended paint in a muted earthy palette with a varnish sheen. `STYLES` and `setStyle()` in the JS module, and an `artStyle` prop on the React wrappers.
- Paper styles for charcoal (`newsprint` default, `sketchbook`, `kraft`) and marker (`plain` default, `notebook`, `parchment`) with the same `data-style` attribute. `MEDIUM_STYLES` lists each medium's styles.
- Marker's `parchment` style now has an embossed paper tooth (lit like the paper medium's grain) instead of blurry blotches, scorched side edges instead of a whole-page vignette, and its own manuscript inks (lapis, cinnabar, gold ochre, iron-gall outline, ochre highlighter), via new `--am-mkp-ink`, `--am-mkp-pigment-*`, `--am-mkp-surface` and `--am-mkp-outline` values.
- The marker splash is now a chisel-tip nib swept through the zig-zag: angled stroke ends, thick-to-thin tight turns instead of perfect round hairpins, and no paint-splatter dots (markers don't drip). Splashes cycle through three scribbles with different tilts, row counts and turns, so neighbours never match. Each one's felt-tip streaks run along its own stroke tilt.
- New tokens: `--am-filter-panel` and `--am-filter-splash` (per-medium filters for panels and splashes), `--am-panel-stroke` (outline for cards, inputs, nav and modals), `--am-label-shadow`.
- Inputs inside a modal keep their own surface instead of taking the modal's paper color.

## 0.1.0

First release.

- Mediums: watercolor, acrylic, charcoal, chosen with `data-medium` on any element.
- Light and dark themes for every medium with `data-theme="light | dark | auto"`.
- Components: button, badge, card, input, divider, nav, modal, splash, canvas.
- `am--secondary` and `am--accent` pigment variants.
- `setMedium()` and `setTheme()` helpers, and optional React wrappers (`art-medium/react`).
