// art-medium — SVG filter defs + helpers.
// The CSS references these filters by id (filter: url(#am-watercolor)), so they
// must exist in the document. Importing this module installs them once.

export const MEDIUMS = ['watercolor', 'acrylic', 'charcoal'];

const FILTERS = `
<svg id="am-filters" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"
     style="position:absolute;width:0;height:0;overflow:hidden">
  <defs>
    <!-- Watercolor: bleeding edges, pigment granulation, darker pooled rim -->
    <filter id="am-watercolor" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="4" seed="3" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="14" xChannelSelector="R" yChannelSelector="G" result="bled"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="7" result="grain"/>
      <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.9 0 0 0 0.3" result="grainAlpha"/>
      <feComposite in="bled" in2="grainAlpha" operator="in" result="granulated"/>
      <feMorphology in="bled" operator="erode" radius="3" result="inner"/>
      <feGaussianBlur in="inner" stdDeviation="3" result="innerSoft"/>
      <feComposite in="bled" in2="innerSoft" operator="out" result="rim"/>
      <feMerge><feMergeNode in="granulated"/><feMergeNode in="rim"/></feMerge>
    </filter>
    <filter id="am-watercolor-stroke" x="-10%" y="-200%" width="120%" height="500%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="4" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" result="bled"/>
      <feGaussianBlur in="bled" stdDeviation="0.4"/>
    </filter>

    <!-- Acrylic: opaque paint, ragged edge, lit brush-stroke ridges (impasto) -->
    <filter id="am-acrylic" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="5" result="edgeNoise"/>
      <feDisplacementMap in="SourceGraphic" in2="edgeNoise" scale="7" xChannelSelector="R" yChannelSelector="G" result="shape"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.22" numOctaves="3" seed="11" result="strokes"/>
      <feDiffuseLighting in="strokes" surfaceScale="1.8" lighting-color="#ffffff" result="light">
        <feDistantLight azimuth="225" elevation="50"/>
      </feDiffuseLighting>
      <feComposite in="shape" in2="light" operator="arithmetic" k1="0.45" k2="0.62" k3="0" k4="0" result="lit"/>
      <feComposite in="lit" in2="shape" operator="in"/>
    </filter>
    <filter id="am-acrylic-stroke" x="-10%" y="-200%" width="120%" height="500%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.03 0.3" numOctaves="2" seed="6" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G"/>
    </filter>

    <!-- Charcoal: wobbly hand-drawn line, gritty broken coverage -->
    <filter id="am-charcoal" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="2" result="wobble"/>
      <feDisplacementMap in="SourceGraphic" in2="wobble" scale="4" xChannelSelector="R" yChannelSelector="G" result="wobbly"/>
      <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="1" seed="9" result="grit"/>
      <feColorMatrix in="grit" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.5 0 0 0 -0.05" result="gritAlpha"/>
      <feComposite in="wobbly" in2="gritAlpha" operator="in"/>
    </filter>
  </defs>
</svg>`;

/** Inject the SVG filter definitions once. Safe to call repeatedly. */
export function installFilters(doc = globalThis.document) {
  if (!doc || doc.getElementById('am-filters')) return;
  const tpl = doc.createElement('template');
  tpl.innerHTML = FILTERS.trim();
  doc.body.prepend(tpl.content.firstElementChild);
}

/** Switch the medium for an element and everything inside it. */
export function setMedium(el, medium) {
  if (!MEDIUMS.includes(medium)) throw new Error(`Unknown medium "${medium}". Use one of: ${MEDIUMS.join(', ')}`);
  el.setAttribute('data-medium', medium);
}

if (typeof document !== 'undefined') {
  if (document.body) installFilters();
  else document.addEventListener('DOMContentLoaded', () => installFilters(), { once: true });
}
