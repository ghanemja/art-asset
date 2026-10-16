// art-medium — SVG filter defs + helpers.
// The CSS references these filters by id (filter: url(#am-watercolor)), so they
// must exist in the document. Importing this module installs them once.

export const MEDIUMS = ['watercolor', 'acrylic', 'charcoal', 'paper', 'marker'];
export const THEMES = ['light', 'dark', 'auto'];

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

    <!-- Acrylic: thick broken-color impasto. Horizontal band noise drags the
         paint into short directional strokes and staggers their ends along
         the edge. A posterized noise field splits the paint into hard-edged
         dabs: some hue-shifted cooler or warmer, some lighter or darker, so
         no area is one flat color. The dabs' values (plus bristle grooves)
         become a height map, lit for ridges and a little gloss. -->
    <filter id="am-acrylic" x="-8%" y="-20%" width="116%" height="145%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.016 0.13" numOctaves="2" seed="5" result="bands"/>
      <feDisplacementMap in="SourceGraphic" in2="bands" scale="13" xChannelSelector="R" yChannelSelector="G" result="shape"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.032 0.16" numOctaves="2" seed="21" result="dabNoise"/>
      <feColorMatrix in="dabNoise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 1 0 0 0" result="hueField"/>
      <feColorMatrix in="dabNoise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="valueField"/>
      <feComponentTransfer in="hueField" result="coolMask"><feFuncA type="discrete" tableValues="0 0 0 0 0 1 1 1 1 1"/></feComponentTransfer>
      <feComponentTransfer in="hueField" result="warmMask"><feFuncA type="discrete" tableValues="1 1 1 1 0 0 0 0 0 0"/></feComponentTransfer>
      <feComponentTransfer in="valueField" result="lightMask"><feFuncA type="discrete" tableValues="0 0 0 0 0 0 1 1 1 1"/></feComponentTransfer>
      <feComponentTransfer in="valueField" result="darkMask"><feFuncA type="discrete" tableValues="1 1 1 1 0 0 0 0 0 0"/></feComponentTransfer>
      <feColorMatrix in="shape" type="hueRotate" values="-13" result="coolHue"/>
      <feComposite in="coolHue" in2="coolMask" operator="in" result="cool"/>
      <feColorMatrix in="shape" type="hueRotate" values="10" result="warmHue"/>
      <feComposite in="warmHue" in2="warmMask" operator="in" result="warm"/>
      <feFlood flood-color="#ffffff" flood-opacity="0.3"/>
      <feComposite in2="lightMask" operator="in" result="lighter"/>
      <feFlood flood-color="#0c0f24" flood-opacity="0.26"/>
      <feComposite in2="darkMask" operator="in" result="darker"/>
      <feMerge result="mixed">
        <feMergeNode in="shape"/><feMergeNode in="cool"/><feMergeNode in="warm"/><feMergeNode in="lighter"/><feMergeNode in="darker"/>
      </feMerge>
      <feComposite in="mixed" in2="shape" operator="in" result="painted"/>
      <!-- Relief: every dab is its own plateau of paint, with bristle grooves
           along the stroke and a thick rim where the paint ends. -->
      <feTurbulence type="fractalNoise" baseFrequency="0.04 0.5" numOctaves="2" seed="11" result="bristle"/>
      <feComposite in="coolMask" in2="lightMask" operator="arithmetic" k2="0.35" k3="0.4" result="h1"/>
      <feComposite in="h1" in2="warmMask" operator="arithmetic" k2="1" k3="0.2" result="h2"/>
      <feComposite in="h2" in2="darkMask" operator="arithmetic" k2="1" k3="-0.15" result="h3"/>
      <feComposite in="h3" in2="bristle" operator="arithmetic" k2="1" k3="0.24" k4="-0.08" result="h4"/>
      <feComposite in="h4" in2="shape" operator="arithmetic" k1="0.6" k3="0.4" result="heightRaw"/>
      <feGaussianBlur in="heightRaw" stdDeviation="0.5" result="height"/>
      <feDiffuseLighting in="height" surfaceScale="3" diffuseConstant="1" lighting-color="#ffffff" result="diffuse">
        <feDistantLight azimuth="235" elevation="52"/>
      </feDiffuseLighting>
      <feSpecularLighting in="height" surfaceScale="3" specularConstant="0.38" specularExponent="26" lighting-color="#ffffff" result="spec">
        <feDistantLight azimuth="235" elevation="52"/>
      </feSpecularLighting>
      <feComposite in="painted" in2="diffuse" operator="arithmetic" k1="0.95" k2="0.24" result="lit"/>
      <feComposite in="spec" in2="shape" operator="in" result="gloss"/>
      <feComposite in="lit" in2="gloss" operator="arithmetic" k2="1" k3="0.5" result="paint"/>
      <feComposite in="paint" in2="shape" operator="in" result="clipped"/>
      <feDropShadow in="clipped" dx="0.6" dy="1.4" stdDeviation="0.9" flood-color="#000" flood-opacity="0.32"/>
    </filter>
    <!-- The same, gentler, for large panels (cards, inputs, nav, modal) -->
    <filter id="am-acrylic-panel" x="-8%" y="-20%" width="116%" height="145%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.016 0.13" numOctaves="2" seed="5" result="bands"/>
      <feDisplacementMap in="SourceGraphic" in2="bands" scale="9" xChannelSelector="R" yChannelSelector="G" result="shape"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.032 0.16" numOctaves="2" seed="21" result="dabNoise"/>
      <feColorMatrix in="dabNoise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 1 0 0 0" result="hueField"/>
      <feColorMatrix in="dabNoise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="valueField"/>
      <feComponentTransfer in="hueField" result="coolMask"><feFuncA type="discrete" tableValues="0 0 0 0 0 1 1 1 1 1"/></feComponentTransfer>
      <feComponentTransfer in="hueField" result="warmMask"><feFuncA type="discrete" tableValues="1 1 1 1 0 0 0 0 0 0"/></feComponentTransfer>
      <feComponentTransfer in="valueField" result="lightMask"><feFuncA type="discrete" tableValues="0 0 0 0 0 0 1 1 1 1"/></feComponentTransfer>
      <feComponentTransfer in="valueField" result="darkMask"><feFuncA type="discrete" tableValues="1 1 1 1 0 0 0 0 0 0"/></feComponentTransfer>
      <feColorMatrix in="shape" type="hueRotate" values="-13" result="coolHue"/>
      <feComposite in="coolHue" in2="coolMask" operator="in" result="cool"/>
      <feColorMatrix in="shape" type="hueRotate" values="10" result="warmHue"/>
      <feComposite in="warmHue" in2="warmMask" operator="in" result="warm"/>
      <feFlood flood-color="#ffffff" flood-opacity="0.07"/>
      <feComposite in2="lightMask" operator="in" result="lighter"/>
      <feFlood flood-color="#0c0f24" flood-opacity="0.07"/>
      <feComposite in2="darkMask" operator="in" result="darker"/>
      <feMerge result="mixed">
        <feMergeNode in="shape"/><feMergeNode in="cool"/><feMergeNode in="warm"/><feMergeNode in="lighter"/><feMergeNode in="darker"/>
      </feMerge>
      <feComposite in="mixed" in2="shape" operator="in" result="painted"/>
      <!-- Relief: every dab is its own plateau of paint, with bristle grooves
           along the stroke and a thick rim where the paint ends. -->
      <feTurbulence type="fractalNoise" baseFrequency="0.04 0.5" numOctaves="2" seed="11" result="bristle"/>
      <feComposite in="coolMask" in2="lightMask" operator="arithmetic" k2="0.35" k3="0.4" result="h1"/>
      <feComposite in="h1" in2="warmMask" operator="arithmetic" k2="1" k3="0.2" result="h2"/>
      <feComposite in="h2" in2="darkMask" operator="arithmetic" k2="1" k3="-0.15" result="h3"/>
      <feComposite in="h3" in2="bristle" operator="arithmetic" k2="1" k3="0.24" k4="-0.08" result="h4"/>
      <feComposite in="h4" in2="shape" operator="arithmetic" k1="0.6" k3="0.4" result="heightRaw"/>
      <feGaussianBlur in="heightRaw" stdDeviation="0.5" result="height"/>
      <feDiffuseLighting in="height" surfaceScale="0.8" diffuseConstant="1" lighting-color="#ffffff" result="diffuse">
        <feDistantLight azimuth="235" elevation="52"/>
      </feDiffuseLighting>
      <feSpecularLighting in="height" surfaceScale="0.8" specularConstant="0.3" specularExponent="26" lighting-color="#ffffff" result="spec">
        <feDistantLight azimuth="235" elevation="52"/>
      </feSpecularLighting>
      <feComposite in="painted" in2="diffuse" operator="arithmetic" k1="0.95" k2="0.24" result="lit"/>
      <feComposite in="spec" in2="shape" operator="in" result="gloss"/>
      <feComposite in="lit" in2="gloss" operator="arithmetic" k2="1" k3="0.5" result="paint"/>
      <feComposite in="paint" in2="shape" operator="in" result="clipped"/>
      <feDropShadow in="clipped" dx="0.6" dy="1.4" stdDeviation="0.9" flood-color="#000" flood-opacity="0.22"/>
    </filter>
    <!-- ...and with bigger dabs for splashes -->
    <filter id="am-acrylic-splash" x="-8%" y="-20%" width="116%" height="145%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.01 0.07" numOctaves="2" seed="5" result="bands"/>
      <feDisplacementMap in="SourceGraphic" in2="bands" scale="20" xChannelSelector="R" yChannelSelector="G" result="shape"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.016 0.075" numOctaves="2" seed="21" result="dabNoise"/>
      <feColorMatrix in="dabNoise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 1 0 0 0" result="hueField"/>
      <feColorMatrix in="dabNoise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="valueField"/>
      <feComponentTransfer in="hueField" result="coolMask"><feFuncA type="discrete" tableValues="0 0 0 0 0 1 1 1 1 1"/></feComponentTransfer>
      <feComponentTransfer in="hueField" result="warmMask"><feFuncA type="discrete" tableValues="1 1 1 1 0 0 0 0 0 0"/></feComponentTransfer>
      <feComponentTransfer in="valueField" result="lightMask"><feFuncA type="discrete" tableValues="0 0 0 0 0 0 1 1 1 1"/></feComponentTransfer>
      <feComponentTransfer in="valueField" result="darkMask"><feFuncA type="discrete" tableValues="1 1 1 1 0 0 0 0 0 0"/></feComponentTransfer>
      <feColorMatrix in="shape" type="hueRotate" values="-13" result="coolHue"/>
      <feComposite in="coolHue" in2="coolMask" operator="in" result="cool"/>
      <feColorMatrix in="shape" type="hueRotate" values="10" result="warmHue"/>
      <feComposite in="warmHue" in2="warmMask" operator="in" result="warm"/>
      <feFlood flood-color="#ffffff" flood-opacity="0.3"/>
      <feComposite in2="lightMask" operator="in" result="lighter"/>
      <feFlood flood-color="#0c0f24" flood-opacity="0.26"/>
      <feComposite in2="darkMask" operator="in" result="darker"/>
      <feMerge result="mixed">
        <feMergeNode in="shape"/><feMergeNode in="cool"/><feMergeNode in="warm"/><feMergeNode in="lighter"/><feMergeNode in="darker"/>
      </feMerge>
      <feComposite in="mixed" in2="shape" operator="in" result="painted"/>
      <!-- Relief: every dab is its own plateau of paint, with bristle grooves
           along the stroke and a thick rim where the paint ends. -->
      <feTurbulence type="fractalNoise" baseFrequency="0.025 0.3" numOctaves="2" seed="11" result="bristle"/>
      <feComposite in="coolMask" in2="lightMask" operator="arithmetic" k2="0.35" k3="0.4" result="h1"/>
      <feComposite in="h1" in2="warmMask" operator="arithmetic" k2="1" k3="0.2" result="h2"/>
      <feComposite in="h2" in2="darkMask" operator="arithmetic" k2="1" k3="-0.15" result="h3"/>
      <feComposite in="h3" in2="bristle" operator="arithmetic" k2="1" k3="0.24" k4="-0.08" result="h4"/>
      <feComposite in="h4" in2="shape" operator="arithmetic" k1="0.6" k3="0.4" result="heightRaw"/>
      <feGaussianBlur in="heightRaw" stdDeviation="0.5" result="height"/>
      <feDiffuseLighting in="height" surfaceScale="3" diffuseConstant="1" lighting-color="#ffffff" result="diffuse">
        <feDistantLight azimuth="235" elevation="52"/>
      </feDiffuseLighting>
      <feSpecularLighting in="height" surfaceScale="3" specularConstant="0.38" specularExponent="26" lighting-color="#ffffff" result="spec">
        <feDistantLight azimuth="235" elevation="52"/>
      </feSpecularLighting>
      <feComposite in="painted" in2="diffuse" operator="arithmetic" k1="0.95" k2="0.24" result="lit"/>
      <feComposite in="spec" in2="shape" operator="in" result="gloss"/>
      <feComposite in="lit" in2="gloss" operator="arithmetic" k2="1" k3="0.5" result="paint"/>
      <feComposite in="paint" in2="shape" operator="in" result="clipped"/>
      <feDropShadow in="clipped" dx="0.6" dy="1.4" stdDeviation="0.9" flood-color="#000" flood-opacity="0.32"/>
    </filter>
    <filter id="am-acrylic-stroke" x="-6%" y="-200%" width="112%" height="500%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.03 0.3" numOctaves="2" seed="6" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" result="shape"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.01 0.6" numOctaves="2" seed="12" result="bristle"/>
      <feComposite in="bristle" in2="shape" operator="in" result="height"/>
      <feDiffuseLighting in="height" surfaceScale="2.5" lighting-color="#ffffff" result="diffuse">
        <feDistantLight azimuth="235" elevation="55"/>
      </feDiffuseLighting>
      <feComposite in="shape" in2="diffuse" operator="arithmetic" k1="0.85" k2="0.32" result="lit"/>
      <feComposite in="lit" in2="shape" operator="in"/>
    </filter>

    <!-- Charcoal: wobbly hand-drawn line, gritty broken coverage -->
    <filter id="am-charcoal" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="2" result="wobble"/>
      <feDisplacementMap in="SourceGraphic" in2="wobble" scale="4" xChannelSelector="R" yChannelSelector="G" result="wobbly"/>
      <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="1" seed="9" result="grit"/>
      <feColorMatrix in="grit" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.5 0 0 0 -0.05" result="gritAlpha"/>
      <feComposite in="wobbly" in2="gritAlpha" operator="in"/>
    </filter>


    <!-- Paper: torn construction paper. The colored layer tears a little
         inside a lighter, fibrous core (derived from the paper's own color,
         so it works on light and dark stock), with grain and a soft shadow
         where the piece sits on the sheet below. -->
    <filter id="am-paper" x="-8%" y="-15%" width="116%" height="140%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" seed="8" result="tear"/>
      <feMorphology in="SourceGraphic" operator="dilate" radius="1.6" result="grown"/>
      <feDisplacementMap in="grown" in2="tear" scale="9" xChannelSelector="R" yChannelSelector="G" result="coreTorn"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="1" seed="12" result="fiber"/>
      <feDisplacementMap in="coreTorn" in2="fiber" scale="3.5" xChannelSelector="R" yChannelSelector="G" result="coreFuzzy"/>
      <feColorMatrix in="coreFuzzy" type="matrix" values="0.28 0 0 0 0.69  0 0.28 0 0 0.68  0 0 0.28 0 0.65  0 0 0 1 0" result="core"/>
      <feDisplacementMap in="SourceGraphic" in2="tear" scale="7" xChannelSelector="R" yChannelSelector="G" result="color"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="3" result="grain"/>
      <feDiffuseLighting in="grain" surfaceScale="0.9" lighting-color="#ffffff" result="grainLight">
        <feDistantLight azimuth="225" elevation="60"/>
      </feDiffuseLighting>
      <feComposite in="color" in2="grainLight" operator="arithmetic" k1="0.32" k2="0.73" result="grained"/>
      <feComposite in="grained" in2="color" operator="in" result="piece"/>
      <feGaussianBlur in="coreFuzzy" stdDeviation="2.2" result="blur"/>
      <feOffset in="blur" dx="1" dy="2.5" result="offset"/>
      <feColorMatrix in="offset" type="matrix" values="0 0 0 0 0.08  0 0 0 0 0.06  0 0 0 0 0.04  0 0 0 0.38 0" result="shadow"/>
      <feMerge><feMergeNode in="shadow"/><feMergeNode in="core"/><feMergeNode in="piece"/></feMerge>
    </filter>
    <filter id="am-paper-stroke" x="-5%" y="-150%" width="110%" height="400%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" seed="9" result="tear"/>
      <feMorphology in="SourceGraphic" operator="dilate" radius="1" result="grown"/>
      <feDisplacementMap in="grown" in2="tear" scale="4" xChannelSelector="R" yChannelSelector="G" result="coreTorn"/>
      <feColorMatrix in="coreTorn" type="matrix" values="0.28 0 0 0 0.69  0 0.28 0 0 0.68  0 0 0.28 0 0.65  0 0 0 1 0" result="core"/>
      <feDisplacementMap in="SourceGraphic" in2="tear" scale="3" xChannelSelector="R" yChannelSelector="G" result="piece"/>
      <feGaussianBlur in="coreTorn" stdDeviation="1" result="blur"/>
      <feOffset in="blur" dx="0.5" dy="1.2" result="offset"/>
      <feColorMatrix in="offset" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.3 0" result="shadow"/>
      <feMerge><feMergeNode in="shadow"/><feMergeNode in="core"/><feMergeNode in="piece"/></feMerge>
    </filter>

    <!-- Marker: the hatching is shifted along its own stroke direction by
         noise, which leaves the inside untouched (stripes don't change along
         their length) but makes each stroke overshoot or stop short of the
         edge. Then hand wobble, and a blurred-and-thresholded mask that
         rounds every stroke end like a felt tip, keeping the ink's own
         translucency. Panels skip the end shift so their outline stays a line. -->
    <filter id="am-marker" x="-8%" y="-20%" width="116%" height="140%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.11" numOctaves="1" seed="31" result="endNoise"/>
      <feColorMatrix in="endNoise" type="matrix" values="1 0 0 0 0  -0.67 0 0 0 0.835  0 0 0 0 0  0 0 0 0 1" result="along"/>
      <feDisplacementMap in="SourceGraphic" in2="along" scale="16" xChannelSelector="R" yChannelSelector="G" result="ends"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="2" seed="14" result="wobble"/>
      <feDisplacementMap in="ends" in2="wobble" scale="5" xChannelSelector="R" yChannelSelector="G" result="drawn"/>
      <feColorMatrix in="drawn" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 5 0" result="solid"/>
      <feGaussianBlur in="solid" stdDeviation="1.5" result="solidBlur"/>
      <feComponentTransfer in="solidBlur" result="mask"><feFuncA type="linear" slope="4" intercept="-1.6"/></feComponentTransfer>
      <feGaussianBlur in="drawn" stdDeviation="0.45" result="soft"/>
      <feComposite in="soft" in2="mask" operator="in"/>
    </filter>
    <filter id="am-marker-panel" x="-8%" y="-20%" width="116%" height="140%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="2" seed="14" result="wobble"/>
      <feDisplacementMap in="SourceGraphic" in2="wobble" scale="5" xChannelSelector="R" yChannelSelector="G" result="drawn"/>
      <feColorMatrix in="drawn" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 5 0" result="solid"/>
      <feGaussianBlur in="solid" stdDeviation="1.5" result="solidBlur"/>
      <feComponentTransfer in="solidBlur" result="mask"><feFuncA type="linear" slope="4" intercept="-1.6"/></feComponentTransfer>
      <feGaussianBlur in="drawn" stdDeviation="0.45" result="soft"/>
      <feComposite in="soft" in2="mask" operator="in"/>
    </filter>
    <filter id="am-marker-stroke" x="-5%" y="-150%" width="110%" height="400%" color-interpolation-filters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency="0.02 0.05" numOctaves="2" seed="15" result="wobble"/>
      <feDisplacementMap in="SourceGraphic" in2="wobble" scale="4" xChannelSelector="R" yChannelSelector="G" result="drawn"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.004 0.7" numOctaves="1" seed="16" result="streak"/>
      <feColorMatrix in="streak" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.7 0.5" result="streakA"/>
      <feComposite in="drawn" in2="streakA" operator="in" result="streaky"/>
      <feMorphology in="drawn" operator="erode" radius="1.2" result="inner"/>
      <feComposite in="drawn" in2="inner" operator="out" result="rim"/>
      <feColorMatrix in="rim" type="matrix" values="0.7 0 0 0 0  0 0.7 0 0 0  0 0 0.7 0 0  0 0 0 0.6 0" result="rimDark"/>
      <feMerge><feMergeNode in="streaky"/><feMergeNode in="rimDark"/></feMerge>
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

/** Switch light/dark for an element and everything inside it. "auto" follows the OS. */
export function setTheme(el, theme) {
  if (!THEMES.includes(theme)) throw new Error(`Unknown theme "${theme}". Use one of: ${THEMES.join(', ')}`);
  el.setAttribute('data-theme', theme);
}

if (typeof document !== 'undefined') {
  if (document.body) installFilters();
  else document.addEventListener('DOMContentLoaded', () => installFilters(), { once: true });
}
