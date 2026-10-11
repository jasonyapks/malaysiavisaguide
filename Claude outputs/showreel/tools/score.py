"""Synthesise the showreel soundtrack: 25 s, 120 BPM, D minor, every hit locked to picture.

    python3 score.py out.wav

Everything is generated from oscillators and noise — no samples, no licences.
"""
import sys
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

SR = 48000
DUR = 25.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
L = np.zeros(N)
Rr = np.zeros(N)
SEND = np.zeros((2, N))  # reverb send


def tt(d):
    return np.arange(int(d * SR)) / SR


def put(x, t0, gain=1.0, pan=0.0, rev=0.0):
    i = int(t0 * SR)
    if i >= N:
        return
    x = x[: N - i]
    l, r = gain * np.sqrt((1 - pan) / 2), gain * np.sqrt((1 + pan) / 2)
    L[i:i + len(x)] += x * l
    Rr[i:i + len(x)] += x * r
    if rev:
        SEND[0, i:i + len(x)] += x * l * rev
        SEND[1, i:i + len(x)] += x * r * rev


def filt(x, kind, f, order=2):
    f = np.clip(np.asarray(f, float) / (SR / 2), 1e-4, .999)
    wn = float(f) if f.ndim == 0 else list(f)
    return sosfilt(butter(order, wn, kind, output='sos'), x)


def env(n, a, d, s=0.0):
    """attack seconds, exponential decay time-constant, sustain floor"""
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * (s + (1 - s) * np.exp(-np.maximum(0, t - a) / d))
    return e


def midi(m):
    return 440 * 2 ** ((m - 69) / 12)


def saw(f, d, detune=0.0):
    t = tt(d)
    ph = (f * (1 + detune) * t) % 1
    return 2 * ph - 1


# ───────── drum voices ─────────
def kick(g=1.0, big=False):
    d = 0.9 if big else 0.45
    t = tt(d)
    f = 45 + 110 * np.exp(-t / 0.03) + (40 * np.exp(-t / 0.2) if big else 0)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t / (0.35 if big else 0.16))
    x += 0.4 * filt(rng.standard_normal(len(t)), 'high', 3000) * np.exp(-t / 0.004)
    return np.tanh(x * 1.6) * g


def clap():
    d = 0.35
    n = int(d * SR)
    x = rng.standard_normal(n)
    e = np.zeros(n)
    for o in (0, .011, .022):
        i = int(o * SR)
        e[i:] += np.exp(-np.arange(n - i) / SR / (0.012 if o < .02 else 0.09))
    return filt(x * e, 'band', [900, 4000]) * 0.9


def hat(open_=False):
    d = 0.3 if open_ else 0.06
    x = filt(rng.standard_normal(int(d * SR)), 'high', 7000)
    return x * env(len(x), .001, .09 if open_ else .018) * 0.5


def snare():
    t = tt(0.3)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.05)
    nz = filt(rng.standard_normal(len(t)), 'band', [1500, 8000]) * np.exp(-t / 0.08)
    return (tone * .6 + nz) * .7


def crash(d=2.5):
    x = filt(rng.standard_normal(int(d * SR)), 'high', 4000)
    return x * env(len(x), .002, d / 4) * .3


def whoosh(d=0.6, f0=300, f1=6000, g=1.0):
    n = int(d * SR)
    x = rng.standard_normal(n)
    out = np.zeros(n)
    seg = 512
    for s in range(0, n, seg):
        k = s / n
        fc = f0 * (f1 / f0) ** k
        out[s:s + seg] = filt(x[max(0, s - 2048):s + seg], 'band', [fc * .7, min(fc * 1.4, 20000)])[-len(out[s:s + seg]):]
    e = np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    return out * e * g


def riser(d=1.0, g=1.0):
    w = whoosh(d, 200, 9000, 1.0)
    t = tt(d)
    f = 200 * (12) ** (t / d)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * (t / d) ** 2 * 0.25
    e = (t / d) ** 2.5
    return (w * (np.linspace(.2, 1, len(w))) + tone) * g * (0.3 + 0.7 * e)


def impact(g=1.0):
    g *= 0.55
    t = tt(3.0)
    f = 30 + 70 * np.exp(-t / 0.15)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.9)
    nz = filt(rng.standard_normal(len(t)), 'low', 2500) * np.exp(-t / 0.25)
    return np.tanh((sub * 1.3 + nz * .6) * 1.4) * g


# ───────── tonal voices ─────────
def pluck(m, d=0.5, bright=4000):
    f = midi(m)
    x = saw(f, d) * .6 + saw(f, d, .006) * .4
    x = filt(x, 'low', bright)
    return x * env(len(x), .002, .12)


def stab(ms, d=0.45):
    x = sum(saw(midi(m), d, dt) for m in ms for dt in (-.004, .004)) / (len(ms) * 2)
    x = filt(x, 'low', 3500)
    return x * env(len(x), .003, .18)


def bass(m, d=0.22):
    f = midi(m)
    t = tt(d)
    x = saw(f, d) * .7 + np.sin(2 * np.pi * f / 2 * t) * .6
    x = filt(x, 'low', 900)
    return np.tanh(x * env(len(x), .004, .09, .2) * 1.5) * .8


def pad(ms, d, cutoff=1800):
    x = sum(saw(midi(m), d, dt) for m in ms for dt in (-.006, 0, .007)) / (len(ms) * 3)
    x = filt(x, 'low', cutoff)
    n = len(x)
    a = int(.25 * SR)
    e = np.ones(n)
    e[:a] = np.linspace(0, 1, a)
    e[-a:] = np.linspace(1, 0, a)
    return x * e


def chime(m, d=1.5):
    t = tt(d)
    f = midi(m)
    x = (np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 2.01 * t) + .25 * np.sin(2 * np.pi * f * 3.98 * t))
    return x * np.exp(-t / .35) * .4


def click(g=1.0, f=3000):
    t = tt(0.03)
    return np.sin(2 * np.pi * f * t) * np.exp(-t / .004) * g


# ───────── arrangement ─────────
B = 0.5  # one beat at 120 BPM
PROG = [  # D minor: Dm – Bb – F – C, one bar (2 s) each
    (50, [62, 65, 69]), (46, [58, 62, 65]), (41, [57, 60, 65]), (48, [60, 64, 67]),
]

# Intro 0–2: drone, shimmer on the gold line, clock ticks
put(pad([38, 45, 50], 2.3, 900), 0, .5, rev=.4)
t = tt(0.9)
put(np.sin(2 * np.pi * np.cumsum(2000 + 2500 * (t / .9)) / SR) * np.exp(-t / .3) * .12, .15, 1, .3, rev=.8)
for i in range(8):
    put(click(.25, 5000), i * .25, 1, .4 if i % 2 else -.4)
put(whoosh(.5, 500, 8000, .35), 1.42, 1, rev=.4)
put(riser(1.9, .25), 0.1, rev=.3)
put(kick(.8), 0)

# Promise 2–4: one hit per word, then the riser into the drop
WORDS = [(2.0, [62, 65, 69, 74]), (2.5, [58, 65, 70]), (3.0, [60, 64, 67, 72]), (3.25, [64, 67, 72]), (3.5, [62, 69, 74, 77])]
for w, ch in WORDS:
    put(stab(ch, .4), w, .8, rev=.5)
    put(kick(1.0), w)
    put(crash(.8), w, .5, rev=.3)
put(snare(), 3.25, .8, rev=.3)
for i in range(8):
    put(snare(), 3.5 + i * .0625, .2 + .6 * i / 8, rev=.2)
put(riser(.5, .9), 3.5)
put(whoosh(.3, 400, 10000, .8), 3.72)

# The drop at 4.0, groove until 21.0
put(impact(1.1), 4.0, rev=.6)
put(crash(3), 4.0, .9, rev=.5)
put(chime(86, 2), 4.0, .6, rev=.8)
GROOVE_END = 21.0
BREAKS = [(10.0, 10.4), (17.12, 17.46), (20.5, 21.0)]
in_break = lambda x: any(a <= x < b for a, b in BREAKS)
bar = 0
tb = 4.0
while tb < GROOVE_END - 1e-6:
    root, ch = PROG[bar % 4]
    put(pad([root + 12] + ch, 2.05, 1400 + 400 * (bar % 4)), tb, .32, rev=.4)
    for k in range(4):
        tk = tb + k * B
        if tk >= GROOVE_END or in_break(tk):
            continue
        put(kick(.95), tk)
        if k % 2 == 1:
            put(clap(), tk, .55, rev=.25)
        put(hat(), tk + B / 2, .7, .3)
        put(hat(), tk + B / 4, .25, -.3)
        put(hat(), tk + 3 * B / 4, .25, -.3)
        put(bass(root - 12), tk + B / 2, .7)
        put(bass(root), tk + 3 * B / 4, .35)
    # arp: 16ths across the chord, with a dotted-eighth echo
    seq = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 12]
    for j in range(16):
        tj = tb + j * B / 4
        if tj >= GROOVE_END or in_break(tj):
            continue
        m = seq[j % 4]
        bright = 1500 + 3500 * min(1, (tj - 4) / 12)
        p = pluck(m, .35, bright)
        put(p, tj, .22, .25 if j % 2 else -.25, rev=.25)
        put(p, tj + .375, .09, -.4 if j % 2 else .4, rev=.3)
    bar += 1
    tb += 2.0

# Transitions and sync points
for tw, d, g in [(6.55, .6, .9), (10.0, .45, .7), (13.62, .5, .8), (17.1, .38, .8), (17.42, .4, .7)]:
    put(whoosh(d, 250, 9000, g), tw, 1, rev=.4)
put(impact(.6), 5.45, rev=.5)          # compass lands
put(chime(93, 1.5), 5.45, .6, .3, rev=.9)
put(chime(81, 1.8), 6.05, .4, -.3, rev=.9)
put(kick(1), 7.0); put(crash(1.5), 7.0, .6, rev=.4)
put(riser(.4, .6), 10.0)
put(impact(.8), 10.4, rev=.5); put(crash(1.5), 10.4, .5)
for i in range(26):                    # slot-machine digits
    ti = 10.4 + 0.9 * (1 - (1 - i / 26) ** 2)
    put(click(.35, 2400 + 80 * (i % 5)), ti, 1, (i % 7 - 3) / 6)
put(chime(86, 1.2), 11.3, .5, rev=.8)
for i in range(3):                     # bars land
    put(pluck(62 + [0, 5, 12][i], .5, 5000), 12.25 + i * .16, .5, (i - 1) * .5, rev=.4)
put(impact(.9), 13.12, rev=.4)         # stamp
put(snare(), 13.12, .7, rev=.4)
for c in (15.05, 15.72, 16.33):        # UI clicks
    put(click(.8, 1800), c, 1, .2); put(click(.5, 900), c + .01, 1, .2)
for i in range(3):
    put(pluck(74 + i * 3, .3, 6000), 16.27 + i * .09, .35, .3, rev=.5)
for v in range(1, 4):                  # slider detents
    put(click(.6, 2600), 16.35 + .65 * (np.arccos(1 - 2 * v / 3) / np.pi), 1, -.2)
PENTA = [74, 76, 79, 81, 84, 86, 88, 91, 93, 96, 98]
for i in range(11):                    # arcs launch / land
    st = 17.75 + i * .16
    put(pluck(PENTA[i], .4, 6000), st, .28, (i % 3 - 1) * .6, rev=.6)
    put(chime(PENTA[i] - 12, .8), st + .75, .18, 0, rev=.8)
put(riser(.55, 1.0), 20.48)

# Resolve 21–25
put(impact(1.2), 21.0, rev=.7)
put(crash(3.5), 21.0, .9, rev=.6)
put(kick(1.2, big=True), 21.0)
put(pad([38, 50, 57, 62, 65, 69, 76], 4.0, 2200), 21.0, .55, rev=.6)
put(stab([62, 65, 69, 76], .8), 21.0, .6, rev=.7)
put(chime(93, 2.5), 21.62, .6, .3, rev=1)
for i in range(21):                    # typing the URL
    put(click(.35, 3200 + (i % 4) * 150), 22.2 + i * .55 / 21, 1, (i % 5 - 2) / 6)
put(whoosh(1.0, 2000, 14000, .25), 23.3, 1, rev=.6)
put(chime(86, 3), 24.0, .45, -.2, rev=1); put(chime(90, 3), 24.0, .3, .2, rev=1)
put(kick(.7), 24.0)

# ───────── mix ─────────
ir_t = np.arange(int(2.4 * SR)) / SR
ir = [rng.standard_normal(len(ir_t)) * np.exp(-ir_t / .55) for _ in range(2)]
ir = [filt(i, 'low', 6000) for i in ir]
wetL = fftconvolve(SEND[0], ir[0])[:N] * .05
wetR = fftconvolve(SEND[1], ir[1])[:N] * .05
mix = np.stack([L + wetL, Rr + wetR])
mix = filt(mix[0], 'high', 28), filt(mix[1], 'high', 28)
mix = np.stack(mix)
# glue: soft saturation + peak normalise, then fade the tail
# impacts dwarf the groove, so drive the bus against the groove's level, not the peak
ref = np.percentile(np.abs(mix[:, int(7.2 * SR):int(9.8 * SR)]), 99.5)
mix = np.tanh(mix / ref * 0.5)
fade = np.ones(N)
fn = int(.45 * SR)
fade[-fn:] = np.linspace(1, 0, fn) ** 2
mix *= fade * 0.93
wavfile.write(sys.argv[1], SR, (mix.T * 32767).astype(np.int16))
print('wrote', sys.argv[1])
