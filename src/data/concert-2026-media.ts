export interface ConcertProgrammeMedia {
    number: 11 | 17 | 20 | 'guest';
    kicker: string;
    title: string;
    source: string;
    bytes: number;
    duration: number;
    repeat: number;
    kind: 'audio' | 'video';
    aspectRatio: 'landscape' | 'portrait' | 'audio';
    credit: string;
    note?: string;
}

export const concert2026ProgrammeMedia: ConcertProgrammeMedia[] = [
    {
        number: 11,
        kicker: 'Programme 11',
        title: '細雪',
        source: '/concert/2026/media/programme-11-sasameyuki-v1.mp4',
        bytes: 15_826_846,
        duration: 264,
        repeat: 1,
        kind: 'video',
        aspectRatio: 'landscape',
        credit: '詞｜吉岡治　曲｜市川昭介　演唱｜林麗琴　舞蹈｜王姿云、洪碧玲',
    },
    {
        number: 17,
        kicker: 'Programme 17',
        title: 'Opalite｜Taylor Swift TikTok Dance',
        source: '/concert/2026/media/programme-17-opalite-audio-v1.m4a',
        bytes: 325_284,
        duration: 20.062,
        repeat: 2,
        kind: 'audio',
        aspectRatio: 'audio',
        credit: '舞蹈音樂 · 連續播放兩次',
        note: '本節目將連續播放兩次，因曲目較短，敬請把握精彩的拍攝時機。',
    },
    {
        number: 20,
        kicker: 'Programme 20',
        title: '別人的',
        source: '/concert/2026/media/programme-20-yours-always-karaoke-v2.mp4',
        bytes: 24_093_880,
        duration: 298.841,
        repeat: 1,
        kind: 'video',
        aspectRatio: 'landscape',
        credit: '家長演唱｜李佩毓　KTV 伴奏版',
    },
    {
        number: 'guest',
        kicker: 'Guest performance · 客串節目',
        title: '失戀無罪',
        source: '/concert/2026/media/programme-guest-lovelorn-innocent-v1.mp4',
        bytes: 19_741_112,
        duration: 242.091,
        repeat: 1,
        kind: 'video',
        aspectRatio: 'landscape',
        credit: '客串演出｜荊泳瑜　原唱｜A-Lin　詞｜林夕　曲｜劉勇志',
    },
];

export const concert2026ProgrammeMediaByNumber = new Map(
    concert2026ProgrammeMedia.map((media) => [media.number, media]),
);
