"""Original soundtrack for the promo video, synthesized from scratch.

No samples or existing recordings are used: every sound is generated here from
sine waves, saws and noise, so the track is free of third-party licensing.
Event times match the animation timeline in promo/index.html.

Usage: python3 promo/soundtrack.py out.wav
"""
import sys
import wave

import numpy as np
from scipy.signal import butter, sosfilt

SR = 44100
DUR = 22.5
BPM = 120
BEAT = 60 / BPM
BAR = BEAT * 4
N = int(SR * DUR)
rng = np.random.default_rng(7)

L = np.zeros(N)
R = np.zeros(N)


def add(sig, t, gain=1.0, pan=0.0):
    """Mix a mono signal in at time t (seconds). pan: -1 left .. 1 right."""
    i = int(t * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    L[i:i + len(sig)] += sig * np.sqrt((1 - pan) / 2) * np.sqrt(2)
    R[i:i + len(sig)] += sig * np.sqrt((1 + pan) / 2) * np.sqrt(2)


def tt(d):
    return np.arange(int(d * SR)) / SR


def lp(x, hz, order=2):
    return sosfilt(butter(order, hz, 'low', fs=SR, output='sos'), x)


def hp(x, hz, order=2):
    return sosfilt(butter(order, hz, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)


def note(name):
    names = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
    pitch, octave = name[:-1], int(name[-1])
    return 440 * 2 ** ((names[pitch] + 12 * (octave + 1) - 69) / 12)


def saw(f, t, voices=3, detune=0.008):
    out = np.zeros_like(t)
    for v in range(voices):
        fv = f * (1 + detune * (v - (voices - 1) / 2))
        ph = (fv * t + rng.random()) % 1.0
        out += 2 * ph - 1
    return out / voices


def env(t, a, d_total, release=0.05):
    e = np.minimum(1, t / max(a, 1e-4))
    tail = np.clip((d_total - t) / release, 0, 1)
    return e * tail


# --- Instruments --------------------------------------------------------------

def kick(gain=1.0):
    t = tt(0.45)
    f = 45 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 7) * gain


def clap():
    t = tt(0.25)
    n = bp(rng.standard_normal(len(t)), 900, 4000)
    e = np.exp(-t * 22)
    # three quick re-triggers make it sound like hands, not a click
    for off in (0.008, 0.016):
        k = int(off * SR)
        e[k:] += np.exp(-t[: len(t) - k] * 30) * 0.6
    return n * e * 0.5


def hat(open_=False):
    t = tt(0.18 if open_ else 0.05)
    n = hp(rng.standard_normal(len(t)), 7000)
    return n * np.exp(-t * (18 if open_ else 70)) * 0.35


def bass(f, d):
    t = tt(d)
    s = saw(f, t, voices=2, detune=0.004) + 0.6 * np.sin(2 * np.pi * f / 2 * t)
    return lp(s, 420) * env(t, 0.005, d, 0.03) * 0.55


def pad(freqs, d, cutoff=1800):
    t = tt(d)
    s = sum(saw(f, t, voices=3, detune=0.01) for f in freqs) / len(freqs)
    return lp(s, cutoff) * env(t, 0.35, d, 0.4) * 0.35


def pluck(f, d=0.35):
    t = tt(d)
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 3 * f * t)
    return s * np.exp(-t * 9) * env(t, 0.002, d, 0.02) * 0.28


def pop(f0=900, f1=320):
    t = tt(0.09)
    f = f1 + (f0 - f1) * np.exp(-t * 45)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 35) * 0.5


def whoosh(d=0.38):
    """Rising filtered noise that peaks at the end (a paint splat flying in)."""
    t = tt(d + 0.3)
    n = rng.standard_normal(len(t))
    out = np.zeros_like(n)
    # sweep a band-pass upward in chunks
    chunk = 512
    for i in range(0, len(n), chunk):
        k = min(1, i / SR / d)
        lo = 300 + 2500 * k ** 2
        seg = bp(n[max(0, i - 2048): i + chunk], lo, lo * 2.2)[-min(chunk, len(n) - i):]
        out[i: i + len(seg)] = seg
    e = np.where(t < d, (t / d) ** 2, np.exp(-(t - d) * 12))
    return out * e * 0.45


def splat():
    """Wet impact at the peak of a wipe."""
    t = tt(0.4)
    body = np.sin(2 * np.pi * (60 + 90 * np.exp(-t * 30)) * t) * np.exp(-t * 9)
    wet = lp(rng.standard_normal(len(t)), 1800) * np.exp(-t * 14)
    return body * 0.8 + wet * 0.5


def click():
    t = tt(0.018)
    return bp(rng.standard_normal(len(t)), 1500, 6000) * np.exp(-t * 300) * 0.35


def riser(d):
    t = tt(d)
    n = rng.standard_normal(len(t))
    return hp(n, 2000) * (t / d) ** 3 * 0.3


# --- Arrangement ----------------------------------------------------------------

CHORDS = [  # C - Am - F - G, one per bar
    (['C3'], ['C4', 'E4', 'G4'], ['C5', 'E5', 'G5', 'E5']),
    (['A2'], ['A3', 'C4', 'E4'], ['A4', 'C5', 'E5', 'C5']),
    (['F2'], ['F3', 'A3', 'C4'], ['F4', 'A4', 'C5', 'A4']),
    (['G2'], ['G3', 'B3', 'D4'], ['G4', 'B4', 'D5', 'B4']),
]

WIPES = [8.4, 10.4, 12.3, 16.2, 18.2]
GROW = 0.38
BREAK = (14.0, WIPES[3] + GROW)     # drums drop out under the typing
END_FADE = 21.0

bars = int(np.ceil(DUR / BAR))
for b in range(bars):
    t0 = b * BAR
    bass_n, pad_n, arp_n = CHORDS[b % 4]
    in_break = BREAK[0] <= t0 < BREAK[1]

    # Pad on every bar (filtered darker in the intro and the break).
    cutoff = 900 if t0 < 6 or in_break else 2200
    add(pad([note(n) for n in pad_n], BAR + 0.3, cutoff), t0, 0.9)

    # 16th-note pluck arpeggio from the start.
    for s in range(16):
        ts = t0 + s * BEAT / 4
        if ts >= DUR:
            break
        f = note(arp_n[s % 4]) * (2 if s % 8 == 7 else 1)
        add(pluck(f), ts, 0.8 if not in_break else 0.5, pan=0.35 if s % 2 else -0.35)

    # Drums and bass from 6s (when the UI appears), except during the break.
    for beat in range(4):
        tb = t0 + beat * BEAT
        if tb < 6.0 or BREAK[0] <= tb < BREAK[1] or tb >= DUR:
            continue
        add(kick(), tb, 0.9)
        if beat in (1, 3):
            add(clap(), tb, 0.8)
        add(hat(), tb + BEAT / 2, 0.8, pan=0.2)
        add(hat(), tb + BEAT / 4, 0.35, pan=-0.2)
        add(hat(), tb + 3 * BEAT / 4, 0.35, pan=-0.2)
        # pumping eighth-note bass
        for e8 in range(2):
            add(bass(note(bass_n[0]), BEAT / 2 - 0.02), tb + e8 * BEAT / 2, 0.85)

# --- Sound effects on the video's events ------------------------------------------

for i, ts in enumerate((0.15, 0.45, 0.75)):          # opening splats land
    add(splat(), ts + 0.1, 0.45, pan=(-0.4, 0.4, -0.1)[i])
add(pop(1000, 380), 1.1, 0.7)                         # "Your UI,"
add(pop(1200, 420), 1.7, 0.7)                         # "but painted."
add(kick(), 1.7, 0.6)
add(pop(1500, 600), 2.8, 0.5)                         # badge
for ts in (4.3, 4.7, 5.1, 5.5):                       # medium flicker
    add(click(), ts, 1.2)
    add(pop(700, 500), ts, 0.25)
add(riser(1.2), 4.8, 0.8)                             # build into the UI scene
add(splat(), 6.0, 0.6)

for w in WIPES:                                       # paint-splat wipes
    add(whoosh(GROW), w, 0.9)
    add(splat(), w + GROW, 0.75)

for i in range(28):                                   # typing <html data-medium="acrylic">
    add(click(), 14.9 + i * (1.0 / 28) + rng.uniform(-0.006, 0.006), 0.9, pan=rng.uniform(-0.2, 0.2))
add(riser(0.9), BREAK[1] - 0.9, 1.0)

for i in range(5):                                    # feature chips
    add(pop(900 + i * 120, 380 + i * 40), 16.75 + i * 0.18, 0.55, pan=(-0.4, -0.2, 0, 0.2, 0.4)[i])

peak = WIPES[4] + GROW                                # end card
add(kick(1.2), peak, 0.9)
add(pop(1100, 400), peak + 0.15, 0.6)
add(pop(1300, 500), peak + 0.95, 0.6)
add(pad([note(n) for n in ('C3', 'G3', 'C4', 'E4', 'G4')], DUR - END_FADE + 1.5, 2600), END_FADE, 0.9)

# --- Master ------------------------------------------------------------------------

mix = np.stack([L, R])
t = np.arange(N) / SR
mix *= np.clip((DUR - t) / (DUR - END_FADE), 0, 1)     # fade out
mix *= np.clip(t / 0.05, 0, 1)                          # no click at the start
mix = np.tanh(mix * 1.1)                                # gentle saturation / limiting
mix /= np.max(np.abs(mix)) / 0.89                       # peak at about -1 dBFS

out = sys.argv[1] if len(sys.argv) > 1 else 'soundtrack.wav'
with wave.open(out, 'wb') as f:
    f.setnchannels(2)
    f.setsampwidth(2)
    f.setframerate(SR)
    f.writeframes((mix.T * 32767).astype('<i2').tobytes())
print('wrote', out)
