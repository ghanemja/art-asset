// The promo soundtrack, written with equalizer: every sound is an equation.
// https://github.com/ghanemja/equalizer
//
// Times match the animation in promo/index.html. Render with:
//   node promo/soundtrack.mjs out.wav

const WIPES = [7.4, 8.6, 9.8, 11.0, 12.3, 16.2, 18.2, 22.1];   // paint-splat wipes
const PEAK = 0.38;                                  // a wipe covers the frame this long after it starts
const DROP = WIPES[5] + PEAK;                       // the beat comes back here (16.58s)
const PLUG = WIPES[7] + PEAK;                       // the "100% math" scene (22.48s)

// The arrangement is math too: drums play from 6s, rest under the typing, return on the drop.
const DRUMS = `t >= 6 && (t < 14 || t >= ${DROP}) && t < ${PLUG}`;
const FULL = `((t >= 6 && (t < 14 || t >= ${DROP})) ? 1 : 0.55)`;

const bar = (notes) => notes.join(' ');
const arp = (a, b, c) => bar([a, b, c, b, a, b, c, a.replace(/\d/, (d) => +d + 1), a, b, c, b, a, b, c, b.replace(/\d/, (d) => +d + 1)]);
const offbeat = (root) => bar(['.', '.', root, '.'].concat(['.', '.', root, '.'], ['.', '.', root, '.'], ['.', '.', root, '.']));

export default {
  title: 'art-medium promo',
  bpm: 120,
  duration: 25.5,
  fadeOut: 1.4,
  tracks: [
    // --- Music: C, Am, F, G ---
    {
      name: 'Kick',
      equation: 'sin(TAU*(48*tau + 5.7*(1 - exp(-28*tau)))) * exp(-7*tau)',
      pattern: 'x...x...x...x...', gate: DRUMS, gain: 0.95,
    },
    {
      name: 'Clap',
      equation: 'noise() * (exp(-tau*18) + 0.8*exp(-abs(tau - 0.011)*400) + 0.6*exp(-abs(tau - 0.022)*400))',
      pattern: '....x.......x...', gate: DRUMS, hp: 900, gain: 0.5,
    },
    {
      name: 'Open hat',
      equation: 'noise() * exp(-22*tau)',
      pattern: '..x...x...x...x.', gate: DRUMS, hp: 6500, gain: 0.32,
    },
    {
      name: 'Hat',
      equation: 'noise() * exp(-55*tau)',
      pattern: 'x.x.x.x.x.x.x.x.', gate: DRUMS, hp: 7000, gain: 0.16, pan: 0.2,
    },
    {
      name: 'Bass',
      equation: '(saw(f*tau) + sin(TAU*f*tau/2)) * exp(-3*tau)',
      pattern: [offbeat('C2'), offbeat('A1'), offbeat('F1'), offbeat('G1')].join(' '),
      gate: DRUMS, lp: 520, gain: 0.65,
    },
    {
      name: 'Pluck',
      equation: `(sin(TAU*f*tau) + 0.3*sin(TAU*2*f*tau)) * exp(-9*tau) * ${FULL}`,
      pattern: [arp('C5', 'E5', 'G5'), arp('A4', 'C5', 'E5'), arp('F4', 'A4', 'C5'), arp('G4', 'B4', 'D5')].join(' '),
      gain: 0.42, pan: -0.2, echo: 0.22,
    },
    {
      name: 'Pad',
      equation: `(saw(f*tau*0.994) + saw(f*tau) + saw(f*tau*1.006)) / 3 * min(1, tau/0.4) * ${FULL}`,
      pattern: 'C4+E4+G4 A3+C4+E4 F3+A3+C4 G3+B3+D4', rate: 0.25, lp: 1700, gain: 0.4,
    },

    // --- Sound effects, at the video's exact moments ---
    {
      name: 'Splat',
      equation: 'sin(TAU*(60*tau + 3*(1 - exp(-30*tau)))) * exp(-9*tau) * 0.8 + noise() * exp(-14*tau) * 0.5',
      at: [0.25, 0.55, 0.85, 6.0, ...WIPES.map((w) => w + PEAK)], len: 0.45, lp: 1800, gain: 0.55,
    },
    {
      name: 'Whoosh',
      equation: `noise() * (tau < ${PEAK} ? (tau/${PEAK})^2 : exp(-(tau - ${PEAK})*12))`,
      at: WIPES, len: 0.8, lp: 2600, gain: 0.5,
    },
    {
      name: 'Pop',
      equation: 'sin(TAU*(380*tau + 16*(1 - exp(-45*tau)))) * exp(-35*tau)',
      at: [1.1, 1.7, 2.8, ...[0, 1, 2, 3, 4].map((i) => 16.75 + i * 0.18), WIPES[6] + PEAK + 0.15, WIPES[6] + PEAK + 0.95,
        PLUG + 0.3, PLUG + 1.95],
      len: 0.15, gain: 0.4,
    },
    {
      name: 'Keys',
      equation: 'noise() * exp(-300*tau)',
      // medium flicker, typing <html data-medium="acrylic">, and chalk writing the equations
      at: [4.3, 4.7, 5.1, 5.5, ...Array.from({ length: 28 }, (_, i) => 14.9 + i / 28),
        ...Array.from({ length: 36 }, (_, i) => PLUG + 0.65 + i * 0.035)],
      len: 0.03, hp: 1500, gain: 0.3,
    },
    {
      name: 'Riser',
      equation: 'noise() * min(1, tau/1)^3',
      at: [4.8, DROP - 1], len: 1, hp: 2000, gain: 0.3,
    },
  ],
};
