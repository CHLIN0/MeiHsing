export const concert2026 = {
    title: '林美杏老師師生音樂會',
    theme: '大手牽小手',
    themeLine: '音為愛聚一堂',
    date: '2026-08-29',
    dateLabel: '2026.08.29',
    time: '14:30',
    dateTime: '2026-08-29T14:30:00+08:00',
    venue: '禾森音樂藝文空間',
    hosts: ['林承漢', '蕭成恩'],
    teacherQuote: '學琴最珍貴的收穫不是名次、也不僅是技巧，而是培養出面對人生困難時，願意『再試一次』的堅韌與勇氣。',
    thanks: '謝謝每一位家長，用一整年的耐心與陪伴，守護孩子在音樂路上的每一步；也謝謝每一位孩子，把一次次練習化成今天的旋律。願大手始終牽著小手，一起走向下一段更美的樂章。',
    sponsors: ['蕭國彬', '張美君', '顏均丞', '張馨云', '蔡志昌', '呂蕙茹'],
    photographyCredit: '李宥佳',
    designCredit: '林承漢',
    choirs: [
        {
            name: '興毅忠區合唱團',
            members: [
                '黃進興', '王柏達', '蘇麗靜', '梁佳芬', '呂美容', '吳家慧',
                '黃麗娥', '鄧麗文', '趙美華', '翁瑞榮', '謝王姵君', '葉秋桃',
                '楊明山', '林春涼', '邱美秀', '林阿只', '李玉綉󠄂',
                '劉淑芬', '陳惠香', '李素華', '吳月娥', '林坤昌',
            ],
        },
        {
            name: '興毅信三區合唱團',
            members: [
                '陳栢宏', '林麗琴', '洪碧玲', '王姿云', '劉安誠', '黃玉全',
                '王世明', '吳榮華', '王琴薈', '劉麗娟', '蔡佩縈', '陳淑娥',
            ],
        },
    ],
} as const;

const choirNames = concert2026.choirs.flatMap((choir) => choir.members);

if (
    !choirNames.includes('翁瑞榮')
    || !choirNames.includes('劉麗娟')
    || choirNames.some((name) => ['曾文惠', '曾文慧', '劉秀妹', '蕭紫安', '黃美琴'].includes(name))
) {
    throw new Error('2026 concert choir roster contains a stale member name.');
}

if (concert2026.choirs[0].members.length !== 22 || concert2026.choirs[1].members.length !== 12) {
    throw new Error('2026 concert choir roster counts must match the latest Canva programme.');
}
