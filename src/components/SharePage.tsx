import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ── helpers ──────────────────────────────────────────── */
const isBrowser = typeof window !== 'undefined';

/* ── SVG Decorations ─────────────────────────────────── */

/** Treble-clef divider — a delicate musical separator */
const TrebleClefDivider = ({ className = '' }: { className?: string }) => (
    <div className={`flex items-center justify-center gap-4 select-none ${className}`} aria-hidden="true">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/30 to-[#c9a96e]/60" />
        <svg viewBox="0 0 40 60" className="w-6 h-9 text-[#c9a96e]/50" fill="currentColor">
            <path d="M20 0c0 0-8 10-8 22c0 8 4 13 8 16c4-3 8-8 8-16C28 10 20 0 20 0zM17 28c0-4 1.5-8 3-11c1.5 3 3 7 3 11c0 5-2 8-3 9.5C19 36 17 33 17 28zM20 42v18M18 48h4M16 52h8" strokeWidth="1.2" stroke="currentColor" fill="none" />
        </svg>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[#c9a96e]/30 to-[#c9a96e]/60" />
    </div>
);

/** Decorative staff lines — five thin horizontal lines */
const StaffLines = ({ className = '' }: { className?: string }) => (
    <svg viewBox="0 0 200 24" className={`w-24 h-4 text-[#c9a96e]/20 ${className}`} aria-hidden="true">
        {[3, 7, 11, 15, 19].map((y) => (
            <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="currentColor" strokeWidth="0.6" />
        ))}
    </svg>
);

/** Small decorative note cluster */
const NoteCluster = ({ className = '' }: { className?: string }) => (
    <svg viewBox="0 0 30 30" className={`w-5 h-5 text-[#c9a96e]/25 ${className}`} fill="currentColor" aria-hidden="true">
        <circle cx="8" cy="20" r="3" />
        <line x1="11" y1="20" x2="11" y2="6" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="20" cy="16" r="3" />
        <line x1="23" y1="16" x2="23" y2="2" stroke="currentColor" strokeWidth="1.2" />
        <path d="M11 6 Q17 4 23 2" stroke="currentColor" strokeWidth="1" fill="none" />
    </svg>
);

/* ── Data ─────────────────────────────────────────────── */

interface LinkItem {
    href: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    brandColor: string; // gradient accent
}

const links: LinkItem[] = [
    {
        href: 'https://ms.linho.me',
        label: '官方網站',
        description: '深入了解美杏老師的鋼琴世界',
        brandColor: '#6B8E6B',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
        ),
    },
    {
        href: 'https://www.facebook.com/piano.lin.3',
        label: 'Facebook 專頁',
        description: '最新演出與教學花絮',
        brandColor: '#1877F2',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M13.5 9.5V7.8c0-.8.2-1.3 1.4-1.3H16V4.1c-.6-.1-1.3-.1-1.9-.1-1.9 0-3.1 1.1-3.1 3.2v2.3H9v2.6h2v7.5h2.5v-7.5H16l.3-2.6h-2.8z" />
            </svg>
        ),
    },
    {
        href: 'https://www.instagram.com/meishing888/',
        label: 'Instagram 日常',
        description: '課程花絮與練習靈感',
        brandColor: '#E4405F',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M16.8 3H7.2A4.2 4.2 0 003 7.2v9.6A4.2 4.2 0 007.2 21h9.6a4.2 4.2 0 004.2-4.2V7.2A4.2 4.2 0 0016.8 3zm1.7 14.8a1.7 1.7 0 01-1.7 1.7H7.2a1.7 1.7 0 01-1.7-1.7V7.2A1.7 1.7 0 017.2 5.5h9.6a1.7 1.7 0 011.7 1.7v9.6z" />
                <path d="M12 8.2A3.8 3.8 0 108 12a3.8 3.8 0 004-3.8zm0 6.2A2.4 2.4 0 119.6 12 2.4 2.4 0 0112 14.4z" />
                <circle cx="16.7" cy="7.3" r=".9" />
            </svg>
        ),
    },
    {
        href: 'https://www.youtube.com/@%E6%9E%97%E7%BE%8E%E6%9D%8F-w2d',
        label: 'YouTube 頻道',
        description: '演奏紀錄與示範課程',
        brandColor: '#FF0000',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M21.6 7.2a2 2 0 00-1.4-1.4C18.4 5.3 12 5.3 12 5.3s-6.4 0-8.2.5A2 2 0 002.4 7.2 21.3 21.3 0 002 12a21.3 21.3 0 00.4 4.8 2 2 0 001.4 1.4c1.8.5 8.2.5 8.2.5s6.4 0 8.2-.5a2 2 0 001.4-1.4A21.3 21.3 0 0022 12a21.3 21.3 0 00-.4-4.8zM10.5 14.7V9.3l4.7 2.7-4.7 2.7z" />
            </svg>
        ),
    },
];

/* ── Animation variants ───────────────────────────────── */

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
};

const fadeInUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.92 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
};

const linkCardVariant = {
    hidden: { opacity: 0, y: 16, scale: 0.97 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            delay: i * 0.08,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        },
    }),
};

/* ── Component ───────────────────────────────────────── */

export default function SharePage() {
    const [mounted, setMounted] = useState(false);
    const [copied, setCopied] = useState(false);
    const qrRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);

        if (isBrowser) {
            import('qr-code-styling').then(({ default: QRCodeStyling }) => {
                if (!qrRef.current) return;
                qrRef.current.innerHTML = '';

                const qrCode = new QRCodeStyling({
                    width: 200,
                    height: 200,
                    type: 'svg',
                    data: 'https://ms.linho.me',
                    margin: 0,
                    backgroundOptions: { color: 'transparent' },
                    dotsOptions: {
                        type: 'rounded',
                        gradient: {
                            type: 'linear',
                            rotation: Math.PI / 4,
                            colorStops: [
                                { offset: 0, color: '#c9a96e' },
                                { offset: 1, color: '#5c4a32' },
                            ],
                        },
                    },
                    cornersSquareOptions: {
                        type: 'extra-rounded',
                        color: '#8c6b50',
                    },
                    cornersDotOptions: {
                        type: 'rounded',
                        color: '#c9a96e',
                    },
                });

                qrCode.append(qrRef.current);
            });
        }
    }, []);

    const handleCopyUrl = async () => {
        try {
            await navigator.clipboard.writeText('https://ms.linho.me');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            /* clipboard not available — silent fallback */
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center py-10 px-4 sm:px-6 font-sans overflow-hidden"
            style={{
                background: 'linear-gradient(165deg, #faf8f4 0%, #f5efe6 35%, #ede4d8 65%, #f0ebe3 100%)',
            }}
        >
            {/* ── Ambient background glows ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[120px]"
                    style={{ background: 'radial-gradient(circle, rgba(201,169,110,0.12) 0%, transparent 70%)' }}
                />
                <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[100px]"
                    style={{ background: 'radial-gradient(circle, rgba(180,140,90,0.08) 0%, transparent 70%)' }}
                />
                <div className="absolute top-[50%] left-[-10%] w-[400px] h-[400px] rounded-full blur-[90px]"
                    style={{ background: 'radial-gradient(circle, rgba(210,185,145,0.06) 0%, transparent 70%)' }}
                />
            </div>

            {/* ── Decorative floating notes (background) ── */}
            <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
                <NoteCluster className="absolute top-[12%] left-[8%] rotate-12 opacity-40" />
                <NoteCluster className="absolute top-[25%] right-[10%] -rotate-6 opacity-30" />
                <StaffLines className="absolute bottom-[20%] left-[5%] rotate-3 opacity-40" />
                <StaffLines className="absolute top-[60%] right-[6%] -rotate-2 opacity-30" />
                <NoteCluster className="absolute bottom-[8%] right-[15%] rotate-45 opacity-25" />
            </div>

            {/* ── Main Card ── */}
            <motion.div
                className="relative z-10 w-full max-w-[620px] my-auto"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
            >
                {/* Card container with layered depth */}
                <motion.div
                    variants={scaleIn}
                    className="relative rounded-[2rem] overflow-hidden"
                    style={{
                        boxShadow: '0 4px 40px rgba(120,90,50,0.08), 0 1px 3px rgba(120,90,50,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
                    }}
                >
                    {/* Top gold ornamental border */}
                    <div className="h-[3px] w-full" aria-hidden="true"
                        style={{ background: 'linear-gradient(90deg, transparent 5%, #c9a96e 30%, #d4b47e 50%, #c9a96e 70%, transparent 95%)' }}
                    />

                    <div className="bg-white/92 backdrop-blur-xl px-7 sm:px-11 pt-10 pb-10">

                        {/* ── Profile Identity ── */}
                        <motion.section variants={fadeInUp} className="flex flex-col items-center text-center mb-8">
                            {/* Portrait with gold ring */}
                            <div className="relative mb-6 group cursor-default">
                                {/* Outer glow */}
                                <div className="absolute -inset-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                                    style={{ background: 'radial-gradient(circle, rgba(201,169,110,0.15) 0%, transparent 70%)' }}
                                />
                                {/* Gold ring */}
                                <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full p-[2.5px]"
                                    style={{ background: 'linear-gradient(145deg, #d4b47e, #c9a96e 40%, #a68450 70%, #c9a96e)' }}
                                >
                                    <div className="w-full h-full rounded-full overflow-hidden bg-white p-[2px]">
                                        <img
                                            src="/head1.webp"
                                            alt="林美杏老師"
                                            className="w-full h-full object-cover rounded-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                                        />
                                    </div>
                                </div>
                                {/* Decorative treble clef */}
                                <span className="absolute -right-2 -bottom-1 text-3xl font-serif select-none opacity-25 text-[#c9a96e]" aria-hidden="true">
                                    𝄞
                                </span>
                            </div>

                            {/* Name & tagline */}
                            <p className="font-serif tracking-[0.25em] text-[11px] uppercase mb-2.5"
                                style={{ color: '#b8956a' }}
                            >
                                Piano Artist & Mentor
                            </p>
                            <h1 className="font-serif tracking-[0.08em] mb-3"
                                style={{ fontSize: 'clamp(2rem, 5vw, 2.6rem)', color: '#3d3028' }}
                            >
                                林美杏{' '}
                                <span className="font-light" style={{ color: '#8a7a68' }}>老師</span>
                            </h1>
                            <p className="font-serif italic tracking-wider text-sm"
                                style={{ color: '#a89880' }}
                            >
                                「音樂是我們成長中不可多得的陪伴」
                            </p>
                        </motion.section>

                        {/* ── Musical divider ── */}
                        <motion.div variants={fadeInUp}>
                            <TrebleClefDivider className="mb-9" />
                        </motion.div>

                        {/* ── Links Section ── */}
                        <motion.section variants={fadeInUp} className="mb-10">
                            <h2 className="font-serif tracking-[0.15em] text-base mb-5 px-0.5"
                                style={{ color: '#4a3f34' }}
                            >
                                與我保持聯繫
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                {links.map((link, i) => (
                                    <motion.a
                                        key={link.label}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        custom={i}
                                        variants={linkCardVariant}
                                        className="group relative flex items-center p-4 rounded-2xl cursor-pointer transition-all duration-300"
                                        style={{
                                            background: 'linear-gradient(135deg, #ffffff 0%, #faf7f2 100%)',
                                            boxShadow: '0 1px 4px rgba(120,90,50,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
                                            border: '1px solid rgba(201,169,110,0.12)',
                                        }}
                                        whileHover={{
                                            y: -2,
                                            boxShadow: '0 8px 24px rgba(120,90,50,0.10), inset 0 1px 0 rgba(255,255,255,0.9)',
                                            border: '1px solid rgba(201,169,110,0.30)',
                                        }}
                                    >
                                        {/* Left accent line */}
                                        <div className="absolute left-0 top-3 bottom-3 w-[2.5px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                            style={{ background: link.brandColor }}
                                        />

                                        {/* Icon circle */}
                                        <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 mr-3.5 transition-all duration-300 group-hover:scale-105"
                                            style={{
                                                background: 'linear-gradient(145deg, #d9c4a5, #c9a96e)',
                                                color: '#fff',
                                                boxShadow: '0 2px 8px rgba(180,140,90,0.2)',
                                            }}
                                        >
                                            {link.icon}
                                        </div>

                                        {/* Text */}
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className="text-sm font-medium tracking-wide mb-0.5 transition-colors duration-300"
                                                style={{ color: '#3d3028' }}
                                            >
                                                {link.label}
                                            </span>
                                            <span className="text-[11px] tracking-wide truncate"
                                                style={{ color: '#a09080' }}
                                            >
                                                {link.description}
                                            </span>
                                        </div>

                                        {/* Arrow */}
                                        <svg className="w-4 h-4 shrink-0 ml-2 opacity-0 group-hover:opacity-60 -translate-x-1 group-hover:translate-x-0 transition-all duration-300"
                                            viewBox="0 0 24 24" fill="none" stroke="#8a7a68" strokeWidth="2"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                                        </svg>
                                    </motion.a>
                                ))}
                            </div>
                        </motion.section>

                        {/* ── Teaching Philosophy ── */}
                        <motion.section variants={fadeInUp} className="mb-10">
                            <h2 className="font-serif tracking-[0.15em] text-base mb-4 px-0.5"
                                style={{ color: '#4a3f34' }}
                            >
                                教學理念
                            </h2>

                            <div className="relative pl-6 sm:pl-8"
                                style={{ borderLeft: '2px solid rgba(201,169,110,0.25)' }}
                            >
                                {/* Decorative quote mark */}
                                <span className="absolute -left-1 -top-3 font-serif text-5xl leading-none select-none"
                                    style={{ color: 'rgba(201,169,110,0.20)' }}
                                    aria-hidden="true"
                                >
                                    "
                                </span>

                                <p className="text-sm leading-[2] tracking-wider font-light text-justify"
                                    style={{ color: '#6b5e50' }}
                                >
                                    美杏老師擁有將近 40 年的鋼琴教學經驗，於 Yamaha 擔任音樂講師 30 餘年，並擔任合唱團指揮與伴奏長達 30 年。她擅長以細膩的聲音想像與肢體律動訓練，陪伴學生探索音樂的層次與故事。
                                </p>
                            </div>
                        </motion.section>

                        {/* ── Musical divider ── */}
                        <motion.div variants={fadeInUp}>
                            <TrebleClefDivider className="mb-9" />
                        </motion.div>

                        {/* ── QR Code Section ── */}
                        <motion.section variants={fadeInUp} className="flex flex-col items-center">
                            <h2 className="font-serif tracking-[0.15em] text-base mb-1.5"
                                style={{ color: '#4a3f34' }}
                            >
                                QR Code
                            </h2>
                            <p className="text-[11px] tracking-wider mb-6"
                                style={{ color: '#b0a090' }}
                            >
                                掃描即可快速開啟網站：ms.linho.me
                            </p>

                            {/* QR code frame with gold accent ring */}
                            <div className="relative mb-6">
                                {/* Pulsing ring */}
                                <div className="absolute -inset-3 rounded-[1.6rem] opacity-40 animate-pulse"
                                    style={{
                                        border: '1.5px solid rgba(201,169,110,0.25)',
                                        animationDuration: '3s',
                                    }}
                                />
                                <div className="relative rounded-[1.2rem] p-5 sm:p-6"
                                    style={{
                                        background: 'linear-gradient(145deg, #fdfcfa, #f8f4ee)',
                                        boxShadow: '0 2px 16px rgba(120,90,50,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
                                        border: '1px solid rgba(201,169,110,0.15)',
                                    }}
                                >
                                    <div ref={qrRef}
                                        className="w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] flex items-center justify-center pointer-events-none"
                                        style={{ mixBlendMode: 'multiply' }}
                                    />
                                </div>
                            </div>

                            {/* Copy URL button */}
                            <button
                                onClick={handleCopyUrl}
                                className="group flex items-center gap-2 px-5 py-2.5 rounded-full cursor-pointer transition-all duration-300 text-xs tracking-wider font-medium"
                                style={{
                                    background: copied
                                        ? 'linear-gradient(135deg, #6B8E6B, #5a7a5a)'
                                        : 'linear-gradient(135deg, #c9a96e, #b8956a)',
                                    color: '#fff',
                                    boxShadow: '0 2px 10px rgba(180,140,90,0.2)',
                                }}
                                aria-label="複製網址"
                            >
                                {copied ? (
                                    <>
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                        已複製！
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                                        </svg>
                                        複製網址
                                    </>
                                )}
                            </button>
                        </motion.section>
                    </div>

                    {/* Bottom section — contact & closing */}
                    <div className="px-7 sm:px-11 py-7"
                        style={{
                            background: 'linear-gradient(180deg, #f8f4ee 0%, #f2ece2 100%)',
                            borderTop: '1px solid rgba(201,169,110,0.10)',
                        }}
                    >
                        <motion.div variants={fadeInUp} className="text-center space-y-2.5">
                            <p className="text-xs tracking-wider" style={{ color: '#8a7a68' }}>
                                預約試聽或合作洽詢：
                                <a href="mailto:ms@linho.me"
                                    className="relative font-medium ml-1.5 transition-colors duration-300 hover:text-[#8c6b50]"
                                    style={{ color: '#b8956a' }}
                                >
                                    ms@linho.me
                                    <span className="absolute left-0 -bottom-0.5 w-0 h-px bg-[#c9a96e] transition-all duration-300 group-hover:w-full" />
                                </a>
                            </p>
                            <p className="font-serif italic text-xs tracking-wider" style={{ color: '#c9a96e' }}>
                                ♫ 期待與你在音樂中相遇。
                            </p>
                        </motion.div>
                    </div>

                    {/* Bottom gold ornamental border */}
                    <div className="h-[2px] w-full" aria-hidden="true"
                        style={{ background: 'linear-gradient(90deg, transparent 10%, #c9a96e 40%, #d4b47e 50%, #c9a96e 60%, transparent 90%)' }}
                    />
                </motion.div>
            </motion.div>

            {/* ── Inline styles for animations ── */}
            <style>{`
                @keyframes gentle-float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-6px) rotate(1deg); }
                }
                @media (prefers-reduced-motion: reduce) {
                    * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
                }
            `}</style>
        </div>
    );
}
