/**
 * Line start times for the 2026 concert rehearsal instrumental.
 *
 * The timing was aligned against the vocal source and its isolated vocal stem,
 * then mapped to the sample-aligned MDX23C instrumental. The lyric timeline
 * finishes at 2:19.5 while the concert player preserves the complete outro.
 */
export const concert2026LyricStartTimes = [
    6.00,
    8.68,
    12.10,
    14.46,
    18.94,
    22.34,
    24.60,
    28.58,
    32.92,
    36.18,
    39.20,
    42.08,
    43.32,
    46.56,
    50.12,
    52.20,
    55.64,
    60.98,
    62.84,
    64.48,
    67.54,
    73.94,
    75.94,
    80.64,
    86.56,
    90.14,
    93.36,
    95.38,
    97.10,
    99.12,
    103.58,
    106.04,
    109.70,
    114.50,
    116.40,
    118.06,
    121.06,
    127.48,
    129.42,
    133.30,
] as const;

export const concert2026Instrumental = {
    src: '/audio/concert-2026/mingtian-hui-geng-hao-instrumental.m4a',
    duration: 154.965,
    lyricsEnd: 139.5,
} as const;
