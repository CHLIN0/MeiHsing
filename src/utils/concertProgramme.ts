export interface ConcertProgrammeEntry {
    number: number;
    half: '上半場' | '下半場';
    work: string;
    format: string;
    performer: string;
    details: string;
    isMasked: boolean;
}

function parseCsvRows(input: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = '';
    let quoted = false;
    const source = input.replace(/^\uFEFF/, '');

    for (let index = 0; index < source.length; index += 1) {
        const character = source[index];
        const next = source[index + 1];

        if (character === '"') {
            if (quoted && next === '"') {
                cell += '"';
                index += 1;
            } else {
                quoted = !quoted;
            }
            continue;
        }

        if (!quoted && character === ',') {
            row.push(cell);
            cell = '';
            continue;
        }

        if (!quoted && (character === '\n' || character === '\r')) {
            if (character === '\r' && next === '\n') index += 1;
            row.push(cell);
            if (row.some((value) => value.length > 0)) rows.push(row);
            row = [];
            cell = '';
            continue;
        }

        cell += character;
    }

    if (quoted) throw new Error('2026 concert programme CSV contains an unterminated quoted field.');

    if (cell.length > 0 || row.length > 0) {
        row.push(cell);
        if (row.some((value) => value.length > 0)) rows.push(row);
    }

    return rows;
}

function assert(condition: boolean, message: string): asserts condition {
    if (!condition) throw new Error(`2026 concert programme validation failed: ${message}`);
}

export function parseConcertProgramme(csv: string): ConcertProgrammeEntry[] {
    const rows = parseCsvRows(csv);
    const headers = rows.shift();
    assert(Boolean(headers), 'missing header row');

    const requiredHeaders = ['number', 'half', 'work', 'format', 'performer', 'details', 'is_masked'];
    assert(requiredHeaders.every((header) => headers?.includes(header)), 'unexpected CSV headers');

    const entries = rows.map((values) => {
        const record = Object.fromEntries(headers!.map((header, index) => [header, values[index] ?? '']));
        const half = record.half.trim();
        assert(half === '上半場' || half === '下半場', `invalid half for item ${record.number}`);

        return {
            number: Number(record.number),
            half,
            work: record.work.trim(),
            format: record.format.trim(),
            performer: record.performer.trim(),
            details: record.details.trim(),
            isMasked: record.is_masked.trim().toLowerCase() === 'true',
        } satisfies ConcertProgrammeEntry;
    });

    assert(entries.length === 30, `expected 30 entries, found ${entries.length}`);
    assert(entries.every((entry, index) => entry.number === index + 1), 'numbers must be continuous from 1 to 30');
    assert(entries.filter((entry) => entry.half === '上半場').length === 15, 'first half must contain 15 entries');
    assert(entries.filter((entry) => entry.half === '下半場').length === 15, 'second half must contain 15 entries');

    const item = (number: number) => entries.find((entry) => entry.number === number)!;
    assert(item(6).performer === '荊永謙', 'item 6 performer must be 荊永謙');
    assert(item(12).work === '崖上的波妞' && item(12).performer === '陳綩妤、林美杏老師', 'item 12 must match the latest master');
    assert(item(14).work === '降E大調夜曲［Op.9 No.2］' && item(14).performer === '蔡宜澄', 'item 14 must be the verified Chopin nocturne');
    assert(item(15).work === 'Crying for Rain' && item(15).performer === '顏均丞' && !item(15).isMasked, 'item 15 must be Crying for Rain');
    assert(item(16).work === '相思河畔・城裡的月光' && !item(16).details.includes('王宏恩'), 'item 16 contains stale data');
    assert(item(26).performer === '荊永蘅', 'item 26 performer must be 荊永蘅');
    assert(item(22).work === '世界的約定' && item(22).format === '四手聯彈', 'item 22 title or format is incorrect');
    assert(!item(22).work.includes('霍爾的移動城堡'), 'item 22 must not show the film annotation');
    assert(item(27).work === '殘酷天使的行動綱領' && item(27).format === '四手聯彈', 'item 27 must be the Evangelion theme');
    assert(item(28).performer === '荊永蘅、荊永謙', 'item 28 performers must be 荊永蘅、荊永謙');
    assert(item(29).isMasked && item(29).work === '' && item(29).performer === '林承漢', 'item 29 must remain masked for 林承漢');

    const serialized = entries.map((entry) => `${entry.work}\n${entry.performer}\n${entry.details}`).join('\n');
    assert(!/荊泳[蘅謙]|蔡怡成|曾文惠|曾文慧|鍵盤｜王宏恩/.test(serialized), 'stale spelling or accompaniment data detected');

    return entries;
}
