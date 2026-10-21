// The promo soundtrack: every sound is an equation of time (rendered with
// the vendored engine in promo/vendor). Times match promo/index.html, at
// 120 bpm so a beat is 0.5s and a bar is 2s. Render with:
//   node promo/soundtrack.mjs out.wav
//
// 0-6s    the bland app: sterile beeps; the painter's flicks whoosh and
//         splat; the beeps tape-stop and a riser pulls into the canvas
// 6s      the drop, as "Splat your site." lands
// 8-20s   a splat wipe every three beats while the page repaints
// 20-22s  breakdown under the typing; 22s the beat drops back in
// 24s     end card

const FLICKS = [2.0, 2.5, 3.0, 3.5, 4.0];  // brush flicks
const LAND = 0.6;                           // paint hits the canvas this long after a flick
const PEAKS = [8, 9.5, 11, 12.5, 14, 15.5, 17, 18.5, 22, 24];  // a wipe covers the frame here
const GROW = 0.38;                          // and starts growing this long before

// The arrangement is math too.
const DRUMS = 't >= 6 && (t < 20 || t >= 22)';
const MUSIC = '(t >= 6 ? ((t >= 20 && t < 22) ? 0.5 : 1) : 0)';

// F minor: Fm7, Dbmaj7, Abmaj7, Eb7. Bar 3 (t = 6) lands on Fm7, so the
// four-bar loop starts on Db.
const CHORDS = ['Db3+F3+Ab3+C4', 'Ab3+C4+Eb4+G4', 'Eb3+G3+Bb3+Db4', 'F3+Ab3+C4+Eb4'];
const ROOTS = [['Db2', 'Db3'], ['Ab1', 'Ab2'], ['Eb2', 'Eb3'], ['F1', 'F2']];
const bassBar = ([lo, hi]) => [lo, '.', '.', lo, '.', '.', hi, '.', lo, '.', '.', lo, '.', hi, lo, '.'].join(' ');
const LEAD = [
  'F5 . Ab5 . C6 . . Ab5 . F5 . . Eb5 . F5 .',
  'Eb5 . . C5 . . Eb5 . F5 . Ab5 . . . . .',
  'G5 . . Bb5 . . G5 . Eb5 . . F5 . G5 . .',
  'Ab5 . . F5 . . C5 . . . F5 . . . . .',
].join(' ');

export default {
  title: 'Splatform promo',
  bpm: 120,
  duration: 29,
  fadeOut: 1.4,
  tracks: [
    // --- The bland app: a polite notification ding on every beat ---
    {
      name: 'Beep',
      equation: 'sin(TAU*f*tau) * exp(-16*tau) * 0.7',
      pattern: 'C6 G5 C6 G5', rate: 1, gate: 't < 4.5', gain: 0.3,
    },
    {
      name: 'Tape stop',
      // the last beep slows to a halt: pitch falls from 1047 Hz to nothing over 1.5s
      equation: 'sin(TAU*(1047*tau - 349*tau*tau)) * exp(-1.6*tau) * min(1, tau/0.01)',
      at: [4.5], len: 1.5, gain: 0.22,
    },

    // --- The groove, from the drop ---
    {
      name: 'Kick',
      equation: 'sin(TAU*(46*tau + 6*(1 - exp(-30*tau)))) * exp(-6*tau)',
      pattern: 'x...x...x...x...', gate: DRUMS, gain: 1.0,
    },
    {
      name: 'Clap',
      equation: 'noise() * (exp(-tau*16) + 0.8*exp(-abs(tau - 0.012)*400) + 0.6*exp(-abs(tau - 0.024)*400))',
      pattern: '....x.......x...', gate: DRUMS, hp: 900, gain: 0.5,
    },
    {
      name: 'Hat',
      equation: 'noise() * exp(-60*tau) * (fract(beat*2) < 0.25 ? 0.55 : 1)',
      pattern: 'x.xxx.xxx.xxx.xx', gate: DRUMS, hp: 7500, gain: 0.17, pan: 0.25,
    },
    {
      name: 'Open hat',
      equation: 'noise() * exp(-18*tau)',
      pattern: '..x...x...x...x.', gate: DRUMS, hp: 6500, gain: 0.26, pan: -0.15,
    },
    {
      name: 'Bass',
      equation: `(sin(TAU*f*tau) + 0.35*sqr(f*tau, 0.3)) * exp(-3.5*tau) * min(1, tau/0.004) * ${MUSIC}`,
      pattern: ROOTS.map(bassBar).join(' '),
      gate: DRUMS, lp: 640, gain: 0.7,
    },
    {
      name: 'Chords',
      equation: `(saw(f*tau*0.993) + saw(f*tau) + saw(f*tau*1.007)) / 3 * min(1, tau/0.25) * ${MUSIC}`,
      pattern: CHORDS.join(' '), rate: 0.25, lp: 1500, gain: 0.34,
    },
    {
      name: 'Lead',
      equation: `(sin(TAU*f*tau) + 0.3*sin(TAU*3*f*tau)*exp(-18*tau)) * exp(-6*tau) * ${MUSIC}`,
      pattern: LEAD, gain: 0.36, pan: -0.15, echo: 0.28,
    },

    // --- Sound effects, at the video's exact moments ---
    {
      name: 'Flick',
      equation: 'noise() * (tau < 0.08 ? tau/0.08 : exp(-(tau - 0.08)*22))',
      at: FLICKS, len: 0.35, hp: 1200, lp: 5000, gain: 0.35,
    },
    {
      name: 'Splat',
      equation: 'sin(TAU*(64*tau + 3*(1 - exp(-30*tau)))) * exp(-10*tau) * 0.8 + noise() * exp(-16*tau) * 0.5',
      at: [...FLICKS.map((f) => f + 0.08 + LAND), ...PEAKS], len: 0.45, lp: 1800, gain: 0.5,
    },
    {
      name: 'Whoosh',
      equation: `noise() * (tau < ${GROW} ? (tau/${GROW})^2 : exp(-(tau - ${GROW})*12))`,
      at: PEAKS.map((p) => p - GROW), len: 0.8, lp: 2600, gain: 0.45,
    },
    {
      name: 'Riser',
      equation: 'noise() * min(1, tau/1.5)^3',
      at: [4.5, 20.5], len: 1.5, hp: 2200, gain: 0.3,
    },
    {
      name: 'Pop',
      equation: 'sin(TAU*(380*tau + 16*(1 - exp(-45*tau)))) * exp(-35*tau)',
      at: [0.15, 6.6, 6.75, 20.0, ...[0, 1, 2, 3, 4].map((i) => 22.25 + i * 0.25), 24.15, 24.6, 25.0, 25.7],
      len: 0.15, gain: 0.38,
    },
    {
      name: 'Keys',
      equation: 'noise() * exp(-300*tau)',
      // typing <html data-medium="acrylic">
      at: Array.from({ length: 28 }, (_, i) => 20.9 + i / 28),
      len: 0.03, hp: 1500, gain: 0.3,
    },
  ],
};
