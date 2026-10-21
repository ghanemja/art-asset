# Splatform

**Splat your site.** A UI component library where the components are made of art. Buttons, cards, inputs and nav bars are painted in a real medium instead of being flat rectangles.

| Medium | Looks like |
| --- | --- |
| `watercolor` | Translucent washes, bleeding edges, pigment granulation, darker pooled rims, cold-press paper |
| `acrylic` | Thick impasto in short directional dabs of broken color (several tints side by side), lit ridges and gloss, stroke ends for edges, primed canvas weave. Also `impressionist` and `realism` styles (see [Acrylic styles](#acrylic-styles)) |
| `charcoal` | Wobbly hand-drawn outlines, gritty broken lines, cross-hatching, newsprint (chalk on slate in dark mode) |
| `paper` | Cut and torn construction-paper collage: fibrous torn edges, paper grain, soft layered shadows, washi tape on cards |
| `marker` | Felt-tip scribbles: a few fat strokes in one back-and-forth zig-zag with rounded hairpin turns, translucent ink that darkens where it overlaps, streaky nibs; panels get a wobbly marker outline and a highlighter swipe |

![Splatform demo](docs/screenshot.png)

Components: **button, badge, card, input, divider, nav, modal, splash**, plus **canvas** (the page background). Every medium has a light and a dark theme.

Splatform was called art-medium before v0.2.0. Only the name changed: the files (`src/art-medium.css`, `src/art-medium.js`), the `am-` class names and the `--am-*` tokens are the same, so existing markup keeps working.

## Try the demo

**Live:** https://ghanemja.github.io/art-asset/

Or run it locally:

```sh
npm run demo   # then open http://localhost:8080/
```

## Install

From the CDN (pinned to a release):

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/ghanemja/art-asset@v0.2.0/src/art-medium.css">
<script type="module" src="https://cdn.jsdelivr.net/gh/ghanemja/art-asset@v0.2.0/src/art-medium.js"></script>
```

Or with npm:

```sh
npm i @ghanemja/splatform
```

(or straight from GitHub: `npm i github:ghanemja/art-asset#v0.2.0`)

```js
import '@ghanemja/splatform/css';
import { setMedium, setTheme } from '@ghanemja/splatform';
```

## Use it

Plain HTML, no framework or build step:

```html
<body class="am-canvas" data-medium="watercolor" data-theme="auto">
  <button class="am-button">Primary</button>
  <button class="am-button am--secondary">Secondary</button>
  <span class="am-badge am--accent">New</span>

  <article class="am-card">
    <h3 class="am-card__title">Still life</h3>
    <p>Painted behind, crisp text in front.</p>
  </article>

  <label class="am-field">
    <span class="am-field__label">Name</span>
    <span class="am-input"><input placeholder="…"></span>
  </label>

  <hr class="am-divider">
</body>
```

The JS module is required. It injects the SVG filters that the CSS refers to (`filter: url(#am-watercolor)`).

### Picking a medium

`data-medium` applies to the element it's on and everything inside it. Set it on `<html>` to theme the page, or on one component to override it:

```html
<html data-medium="charcoal">
  …
  <button class="am-button" data-medium="marker">This one is marker</button>
```

To switch at runtime:

```js
import { setMedium } from '@ghanemja/splatform';
setMedium(document.documentElement, 'acrylic');
```

### Acrylic styles

Acrylic comes in three styles, picked with `data-style` on the acrylic element or any ancestor (like `<html>`):

| Style | Looks like |
| --- | --- |
| `impasto` (default) | Thick broken-color dabs with lit ridges and a little gloss |
| `impressionist` | Flat, matte planes of light, mid and shadow tones laid in broad strokes, a warm terracotta ground glowing at the edges, dry-brush breakup and a chalky, warm palette |
| `realism` | Smooth, blended paint softly lit from the top left, muted earthy colors (olive, brick, ochre), a faint varnish sheen, very fine canvas and soft shadows |

```html
<html data-medium="acrylic" data-style="impressionist">
  …
  <button class="am-button" data-medium="acrylic" data-style="realism">Just this one</button>
```

```js
import { setStyle, STYLES } from '@ghanemja/splatform';
setStyle(document.documentElement, 'realism');
```

A style only changes its own medium: an acrylic style inside a watercolor, charcoal, paper or marker subtree does nothing. In React, pass `artStyle` (named so it doesn't clash with React's `style`): `<MediumProvider medium="acrylic" artStyle="realism">`.

### Paper styles for charcoal and marker

Charcoal and marker take `data-style` too, to pick the paper they're drawn on:

| Medium | Style | Paper |
| --- | --- | --- |
| `charcoal` | `newsprint` (default) | Gray newsprint (chalk on slate in dark mode) |
| | `sketchbook` | Warm cream drawing paper with a fine tooth |
| | `kraft` | Brown kraft paper with short fibers |
| `marker` | `plain` (default) | Clean white paper |
| | `notebook` | Ruled notebook paper with a red margin line |
| | `parchment` | Embossed aged parchment with faintly scorched edges, inked in lapis, cinnabar and gold ochre with an iron-gall outline |

```html
<body class="am-canvas" data-medium="marker" data-style="notebook">
```

`MEDIUM_STYLES` lists the styles for each medium (the first is the default), and `STYLES` is all of them. The paper textures are CSS gradients and small PNGs, so they look the same in every browser.

### Light and dark

`data-theme="light" | "dark" | "auto"` works the same way: put it on `<html>` or on any section. `auto` follows the visitor's system setting. With no `data-theme`, everything is light, so adding the library never darkens a site that wasn't designed for it.

```js
import { setTheme } from '@ghanemja/splatform';
setTheme(document.documentElement, 'dark');
```

In dark mode watercolor sits on indigo paper, acrylic on black gesso, charcoal becomes chalk on a slate board, paper becomes bright scraps on black card stock, and marker becomes paint markers on black paper.

### Splash

`.am-splash` is a decorative paint splat for hero sections, logos and empty states. It is sized by its width and works at any size:

```html
<span class="am-splash am--secondary" style="width: 20rem" aria-hidden="true"></span>
```

### Variants

`am--secondary` and `am--accent` switch to the medium's second and third pigments. They work on buttons, badges, dividers and splashes.

### React

```jsx
import '@ghanemja/splatform/css';
import { MediumProvider, Button, Card, Input, Badge, Divider, Nav, Modal, Splash } from '@ghanemja/splatform/react';

<MediumProvider medium="watercolor" theme="auto">
  <Nav brand="Studio" links={[{ href: '/', label: 'Work', current: true }]} />
  <Card title="Still life">
    <Input label="Email" type="email" />
    <Button variant="secondary" medium="acrylic">Subscribe</Button>
  </Card>
</MediumProvider>
```

## How it works

- **Painted layer.** Each component draws its paint on a `::before` pseudo-element behind its content. That layer goes through an SVG filter, so the paint distorts but the text stays sharp.
- **Filters** (`src/art-medium.js`):
  - Watercolor uses `feTurbulence` and `feDisplacementMap` for the bleed, a noise alpha mask for granulation, and an erode-and-subtract rim for pooled edges.
  - Acrylic drags the paint into short horizontal strokes with band-shaped displacement noise, then splits it into hard-edged dabs using posterized noise masks: some hue-rotated cooler or warmer, some lighter or darker. The dab map becomes a height map for `feDiffuseLighting` and `feSpecularLighting`, so each dab is a lit ridge of paint.
  - Charcoal combines a light wobble with a high-frequency grit mask.
  - Paper tears the shape with displacement noise, puts it on a slightly larger, fibrous, lighter core (the paper's own color, lightened, so it works on any stock), adds lit grain and a soft drop shadow. Cards and modals get a strip of washi tape.
  - Marker masks the paint with inline SVG scribbles: fat round-capped strokes in one zig-zag with hairpin turns that poke past the edge (a few variants, so neighbouring buttons differ). Each stroke is drawn at partial opacity, so overlaps and hairpins get denser ink. The hand wobble is baked into the stroke geometry, and felt-tip streaks and grain come from a small PNG texture intersected with the scribble (`mask-composite`). There are no filters inside the mask images, since WebKit ignores those. Panels draw a wobbly outline at a fixed pixel inset instead of a fill.
- **Tokens.** Each medium is just CSS custom properties: pigments, fill strength, shapes, stroke, texture, filter and fonts. Components only read tokens, which is why one `data-medium` attribute can restyle anything.
- **Dark mode.** Color tokens are `light-dark(light, dark)` pairs, and `data-theme` sets `color-scheme`, so one attribute flips every color in a subtree.

### Adding a medium

Define a new `[data-medium="gouache"] { --am-… }` token block (use `light-dark()` for colors; copy an existing block so every token is set, which keeps nested mediums from inheriting each other's settings), add a matching `<filter id="am-gouache">` in `art-medium.js`, and add the name to `MEDIUMS`. `--am-filter-panel` and `--am-filter-splash` let a medium use a gentler or larger-scale filter for panels and splashes.

## Browser support

Current Chrome, Edge, Safari and Firefox (2024 or later). The library relies on `color-mix()`, `light-dark()` and SVG filters on HTML elements. It has been tested most in Chromium.

## Fonts

Each medium suggests display and body fonts (`--am-font-display` and `--am-font-body`), with system fallbacks. The demo loads them from Google Fonts: Cormorant Garamond and Nunito for watercolor, Archivo Black and Work Sans for acrylic, Caveat and Kalam for charcoal, Fredoka and Figtree for paper, Permanent Marker and Varela Round for marker.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

MIT. See [LICENSE](LICENSE).
