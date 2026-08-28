export interface ConcertProgrammeMedia {
    number: 11 | 17 | 20;
    title: string;
    source: string;
    bytes: number;
    duration: number;
    repeat: number;
    kind: 'audio' | 'video';
    aspectRatio: 'landscape' | 'portrait' | 'audio';
    credit: string;
}

export const concert2026ProgrammeMedia: ConcertProgrammeMedia[] = [
    {
        number: 11,
        title: '細雪',
        source: '/concert/2026/media/programme-11-sasameyuki-v1.mp4',
        bytes: 15_826_846,
        duration: 264,
        repeat: 1,
        kind: 'video',
        aspectRatio: 'landscape',
        credit: '現場播放音檔',
    },
    {
        number: 17,
        title: 'Opalite｜Taylor Swift TikTok Dance',
        source: '/concert/2026/media/programme-17-opalite-audio-v1.m4a',
        bytes: 325_284,
        duration: 20.062,
        repeat: 2,
        kind: 'audio',
        aspectRatio: 'audio',
        credit: '舞蹈音樂 · 連續播放兩次',
    },
    {
        number: 20,
        title: '別人的',
        source: '/concert/2026/media/programme-20-yours-always-v1.mp4',
        bytes: 15_642_315,
        duration: 300.397,
        repeat: 1,
        kind: 'video',
        aspectRatio: 'landscape',
        credit: 'Vivian Hsu 徐若瑄〈別人的 Yours Always〉正式婚紗版 MV',
    },
];

export const concert2026ProgrammeMediaByNumber = new Map(
    concert2026ProgrammeMedia.map((media) => [media.number, media]),
);
