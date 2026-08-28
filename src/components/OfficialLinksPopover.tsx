import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPianoQrModel, getDisplayUrl, getRuntimePageUrl, renderPianoQrContent } from '../utils/pianoQr';
import '../styles/official-links-popover.css';

interface LyricsContent {
    title: string;
    text: string;
}

interface OfficialLinksPopoverProps {
    fallbackUrl: string;
    pageName: string;
    lyrics?: LyricsContent;
    triggerClassName?: string;
}

type OfficialDestinationKey = 'home' | 'concert' | 'links';

const officialDestinations: Array<{ key: OfficialDestinationKey; label: string; path: string }> = [
    { key: 'home', label: '首頁', path: '/' },
    { key: 'concert', label: '2026 音樂會', path: '/concert/2026/' },
    { key: 'links', label: '所有連結', path: '/links/' },
];

const destinationKeyForPath = (pathname: string): OfficialDestinationKey => {
    if (pathname.startsWith('/concert/2026')) return 'concert';
    if (pathname.startsWith('/links')) return 'links';
    return 'home';
};

const copyText = async (value: string) => {
    if (navigator.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(value);
            return;
        } catch {
            // Fall through for browsers that block clipboard permission.
        }
    }

    const input = document.createElement('textarea');
    input.value = value;
    input.readOnly = true;
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.append(input);
    input.select();
    const copied = document.execCommand('copy');
    input.remove();
    if (!copied) throw new Error('Clipboard copy was blocked.');
};

export default function OfficialLinksPopover({
    fallbackUrl,
    pageName,
    lyrics,
    triggerClassName = '',
}: OfficialLinksPopoverProps) {
    const triggerRef = useRef<HTMLButtonElement>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const suppressNextFocusOpen = useRef(false);
    const titleId = useId();
    const fallback = useMemo(() => new URL(fallbackUrl), [fallbackUrl]);
    const [runtimeOrigin, setRuntimeOrigin] = useState(fallback.origin);
    const [destination, setDestination] = useState<OfficialDestinationKey>(() => destinationKeyForPath(fallback.pathname));
    const [hovered, setHovered] = useState(false);
    const [focusWithin, setFocusWithin] = useState(false);
    const [pinned, setPinned] = useState(false);
    const [view, setView] = useState<'qr' | 'lyrics'>('qr');
    const [copyStatus, setCopyStatus] = useState('複製網址');
    const open = hovered || focusWithin || pinned;

    useEffect(() => {
        const runtimeUrl = getRuntimePageUrl(window.location.href);
        if (!runtimeUrl) return;
        const url = new URL(runtimeUrl);
        setRuntimeOrigin(url.origin);
        setDestination(destinationKeyForPath(url.pathname));
    }, []);

    useEffect(() => {
        if (!open) {
            setView('qr');
            setCopyStatus('複製網址');
        }
    }, [open]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape' || !open) return;
            setPinned(false);
            setHovered(false);
            setFocusWithin(false);
            suppressNextFocusOpen.current = true;
            triggerRef.current?.focus();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open]);

    const currentUrl = useMemo(() => {
        const selected = officialDestinations.find((item) => item.key === destination) ?? officialDestinations[0];
        return new URL(selected.path, runtimeOrigin).href;
    }, [destination, runtimeOrigin]);
    const model = useMemo(() => createPianoQrModel(currentUrl), [currentUrl]);
    const qrMarkup = useMemo(
        () => renderPianoQrContent(model, `${pageName}官方連結 QR Code`, currentUrl),
        [currentUrl, model, pageName],
    );
    const displayUrl = useMemo(() => getDisplayUrl(currentUrl), [currentUrl]);
    const lyricStanzas = useMemo(
        () => lyrics?.text.trim().split(/\n\s*\n/).filter(Boolean) ?? [],
        [lyrics],
    );

    const handleCopy = async () => {
        try {
            await copyText(currentUrl);
            setCopyStatus('網址已複製');
        } catch {
            setCopyStatus('無法複製');
        }
        window.setTimeout(() => setCopyStatus('複製網址'), 1800);
    };

    return (
        <div
            ref={rootRef}
            className="official-links-popover"
            data-open={open ? 'true' : 'false'}
            data-pinned={pinned ? 'true' : 'false'}
            onPointerEnter={(event) => {
                if (event.pointerType !== 'touch') setHovered(true);
            }}
            onPointerLeave={(event) => {
                if (event.pointerType !== 'touch') setHovered(false);
            }}
            onFocusCapture={() => {
                if (suppressNextFocusOpen.current) {
                    suppressNextFocusOpen.current = false;
                    return;
                }
                setFocusWithin(true);
            }}
            onBlurCapture={(event) => {
                if (!rootRef.current?.contains(event.relatedTarget as Node | null)) setFocusWithin(false);
            }}
        >
            <button
                ref={triggerRef}
                className={`official-links-popover__trigger ${triggerClassName}`}
                type="button"
                aria-expanded={open}
                aria-haspopup="dialog"
                onClick={() => setPinned((value) => !value)}
            >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM15 14h2v2h-2zM18 14h2v5h-2zM14 18h3v2h-3z" />
                </svg>
                <span className="official-links-popover__trigger-label">官方連結</span>
            </button>

            {open && (
                <div className="official-links-popover__positioner">
                    <section
                        className="official-links-popover__panel"
                        role="dialog"
                        aria-labelledby={titleId}
                        data-view={view}
                    >
                        <header className="official-links-popover__header">
                            <div>
                                <p>OFFICIAL LINK</p>
                                <h2 id={titleId}>{pageName}</h2>
                            </div>
                            <button
                                className="official-links-popover__pin"
                                type="button"
                                title={pinned ? '取消固定' : '固定視窗'}
                                aria-label={pinned ? '取消固定官方連結視窗' : '固定官方連結視窗'}
                                aria-pressed={pinned}
                                onClick={() => setPinned((value) => !value)}
                            >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="m9 4 6 0-.8 5 2.8 2.8v1.2H7v-1.2L9.8 9 9 4ZM12 13v7" />
                                </svg>
                            </button>
                        </header>

                        <nav className="official-links-popover__destinations" aria-label="選擇 QR Code 目的地">
                            {officialDestinations.map((item) => (
                                <button
                                    key={item.key}
                                    type="button"
                                    aria-pressed={destination === item.key}
                                    onClick={() => {
                                        setDestination(item.key);
                                        setView('qr');
                                        setCopyStatus('複製網址');
                                    }}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </nav>

                        {lyrics && (
                            <div className="official-links-popover__tabs" role="tablist" aria-label="選擇官方連結內容">
                                <button type="button" role="tab" aria-selected={view === 'qr'} onClick={() => setView('qr')}>QR Code</button>
                                <button type="button" role="tab" aria-selected={view === 'lyrics'} onClick={() => setView('lyrics')}>大合唱歌詞</button>
                            </div>
                        )}

                        {view === 'qr' ? (
                            <div className="official-links-popover__qr-view">
                                <div className="official-links-popover__qr-frame">
                                    <svg
                                        className="official-links-popover__qr"
                                        viewBox={`0 0 ${model.viewBoxSize} ${model.viewBoxSize}`}
                                        role="img"
                                        aria-label={`${pageName}官方連結 QR Code`}
                                        data-qr-value={currentUrl}
                                        xmlns="http://www.w3.org/2000/svg"
                                        dangerouslySetInnerHTML={{ __html: qrMarkup }}
                                    />
                                </div>
                                <div className="official-links-popover__destination">
                                    <span>掃描開啟這一頁</span>
                                    <strong>{displayUrl}</strong>
                                </div>
                                <button className="official-links-popover__copy" type="button" onClick={handleCopy}>
                                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 8h10v11H9zM5 15V5h10" /></svg>
                                    <span aria-live="polite">{copyStatus}</span>
                                </button>
                            </div>
                        ) : (
                            <div className="official-links-popover__lyrics" role="tabpanel">
                                <div className="official-links-popover__lyrics-heading">
                                    <span>FINALE · CHOIR</span>
                                    <h3>{lyrics?.title}</h3>
                                </div>
                                <div className="official-links-popover__lyrics-scroll">
                                    {lyricStanzas.map((stanza, stanzaIndex) => (
                                        <p key={`${stanzaIndex}-${stanza.slice(0, 8)}`}>
                                            {stanza.split('\n').map((line, lineIndex) => (
                                                <span key={`${lineIndex}-${line}`}>{line}</span>
                                            ))}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
}
