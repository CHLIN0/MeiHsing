export type RehearsalMode = 'excerpt' | 'full' | 'technical';

export interface RehearsalProgrammeCall {
    number: number;
    mode?: RehearsalMode;
    note?: string;
}

export interface RehearsalBlock {
    time: string;
    label: string;
    programmes: RehearsalProgrammeCall[];
    note?: string;
    emphasis?: 'first-call' | 'ensemble';
}

export const rehearsalBlocks: RehearsalBlock[] = [
    {
        time: '12:30',
        label: '第一批到場・彩排開始',
        emphasis: 'first-call',
        programmes: [
            { number: 1, mode: 'technical', note: '空靈鼓收音；確認四件樂器平衡' },
            { number: 6 },
            { number: 29 },
        ],
    },
    {
        time: '13:00',
        label: '第一階段',
        programmes: [
            { number: 5, mode: 'full' },
            { number: 12, mode: 'full' },
            { number: 13, mode: 'full' },
            { number: 9 },
            { number: 21 },
            { number: 23 },
            { number: 24 },
            { number: 25 },
        ],
    },
    {
        time: '13:20',
        label: '第一階段',
        programmes: [
            { number: 4, mode: 'full' },
            { number: 18 },
        ],
    },
    {
        time: '13:25',
        label: '第二階段開始',
        programmes: [
            { number: 27, mode: 'full' },
            { number: 3 },
            { number: 10 },
        ],
    },
    {
        time: '13:30',
        label: '第二階段',
        programmes: [
            { number: 28, mode: 'full' },
            { number: 26 },
        ],
    },
    {
        time: '13:35',
        label: '第二階段',
        programmes: [
            { number: 2 },
            { number: 14 },
        ],
    },
    {
        time: '13:40',
        label: '歌唱與影像',
        programmes: [
            { number: 20, mode: 'technical', note: '投影影片＋演唱；確認片頭、片尾與音量' },
            { number: 19 },
        ],
    },
    {
        time: '13:45',
        label: '第二階段',
        programmes: [
            { number: 22, mode: 'full', note: '搭檔為蕭承恩，勿與 #7 混淆' },
            { number: 7, note: '蕭成恩' },
            { number: 8 },
        ],
    },
    {
        time: '13:50',
        label: '歌舞與獨奏',
        programmes: [
            { number: 11, mode: 'technical', note: '投影影片＋演唱＋舞蹈；走定位與影音 Cue' },
            { number: 15, note: '顏均丞' },
        ],
    },
    {
        time: '14:00',
        label: '全體與團體節目',
        emphasis: 'ensemble',
        note: '距開演 30 分鐘：以進退場、站位、影音 Cue 與結尾為主，保留舞台復位時間。',
        programmes: [
            { number: 16, mode: 'technical', note: '合唱站位、指揮與鋼琴伴奏' },
            { number: 17, mode: 'technical', note: '舞蹈站位與進退場' },
            { number: 30, mode: 'technical', note: '全體進退場、音響與謝幕結尾' },
        ],
    },
];

export const staffCalls = [
    { time: '12:50', name: '蕭成恩', role: '主持人', note: '到場後先與控場確認主持動線與 #7 彩排' },
    { time: '13:00', name: '蔡宜澄', role: '設備', note: '同時為 #14 演出者及 #16 鋼琴伴奏' },
] as const;

export const technicalCues = [
    { number: 1, department: '音響', cue: '麥克風接空靈鼓', check: '收音位置、回授、四件樂器平衡' },
    { number: 11, department: '投影・音響', cue: '播放〈細雪〉影片', check: '影片全螢幕、聲音輸出、演唱與舞蹈起點' },
    { number: 20, department: '投影・音響', cue: '播放〈別人的〉影片', check: '影片片頭定位、演唱麥克風、片尾銜接' },
    { number: 30, department: '音響・舞台', cue: '〈明天會更好〉大合唱', check: '伴奏、全體站位、進退場與最後謝幕' },
] as const;

export const productionChecklist = [
    {
        title: '影音與設備',
        items: [
            '所有影片與音檔已下載到本機，並備份一份離線檔案',
            '投影比例、全螢幕播放與電腦通知已確認',
            '#1 空靈鼓麥克風已定位，完成回授與音量測試',
            '#11、#20、#30 已依演出順序排好，片頭停在正確畫面',
        ],
    },
    {
        title: '舞台與後台',
        items: [
            '鋼琴椅高度、踏板與四手聯彈座位已確認',
            '四手聯彈七組皆完成全曲彩排',
            '14:00 團體節目的站位、進退場與謝幕路線已確認',
            '開演前完成舞台復位，清除線材與非演出物品',
        ],
    },
    {
        title: '控場與主持',
        items: [
            '主持人持有最新主持稿，並確認每一段報幕與演出順序',
            '工作人員可清楚區分蕭成恩與蕭承恩',
            '所有演出者已完成點名，臨時缺席或延遲已回報',
            '14:20 前完成最後 Cue 確認，準備 14:30 開演',
        ],
    },
] as const;

const scheduledNumbers = rehearsalBlocks.flatMap((block) => block.programmes.map((item) => item.number));
const fourHandNumbers = [4, 5, 12, 13, 22, 27, 28];

if (
    scheduledNumbers.length !== 30
    || new Set(scheduledNumbers).size !== 30
    || scheduledNumbers.some((number) => number < 1 || number > 30)
) {
    throw new Error('2026 concert rehearsal schedule must include each programme exactly once.');
}

if (!rehearsalBlocks.find((block) => block.time === '13:50')?.programmes.some((item) => item.number === 15)) {
    throw new Error('Programme 15 顏均丞 must be scheduled at 13:50.');
}

if (!fourHandNumbers.every((number) => rehearsalBlocks.some((block) => block.programmes.some((item) => item.number === number && item.mode === 'full')))) {
    throw new Error('Every four-hand programme must be marked for a full rehearsal.');
}

if (!rehearsalBlocks.every((block) => {
    const priorities = block.programmes.map((item) => item.mode === 'full' || item.mode === 'technical' ? 0 : 1);
    return priorities.every((priority, index) => index === 0 || priority >= priorities[index - 1]);
})) {
    throw new Error('Ensemble, four-hand, and technical calls must precede solo excerpts within each rehearsal block.');
}
