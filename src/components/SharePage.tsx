import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Avoid SSR issues with qr-code-styling
const isBrowser = typeof window !== 'undefined';

interface LinkItem {
    href: string;
    label: string;
    description: string;
    icon: React.ReactNode;
}

const links: LinkItem[] = [
    {
        href: 'https://ms.linho.me',
        label: '官方網站',
        description: '深入了解美杏老師的鋼琴世界',
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
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M21.6 7.2a2 2 0 00-1.4-1.4C18.4 5.3 12 5.3 12 5.3s-6.4 0-8.2.5A2 2 0 002.4 7.2 21.3 21.3 0 002 12a21.3 21.3 0 00.4 4.8 2 2 0 001.4 1.4c1.8.5 8.2.5 8.2.5s6.4 0 8.2-.5a2 2 0 001.4-1.4A21.3 21.3 0 0022 12a21.3 21.3 0 00-.4-4.8zM10.5 14.7V9.3l4.7 2.7-4.7 2.7z" />
            </svg>
        ),
    },
];

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7 }
    },
};

export default function SharePage() {
    const [mounted, setMounted] = useState(false);
    const qrRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);

        // Dynamically import QRCodeStyling to avoid SSR issues
        if (isBrowser) {
            import('qr-code-styling').then(({ default: QRCodeStyling }) => {
                if (!qrRef.current) return;
                qrRef.current.innerHTML = ''; // clear previous

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
                                { offset: 0, color: '#c59d7c' },
                                { offset: 1, color: '#3e3a36' }
                            ]
                        }
                    },
                    cornersSquareOptions: {
                        type: 'extra-rounded',
                        color: '#8c6b50'
                    },
                    cornersDotOptions: {
                        type: 'rounded',
                        color: '#c59d7c'
                    }
                });

                qrCode.append(qrRef.current);
            });
        }
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#f7f5f2] text-stone-800 font-sans selection:bg-amber-100 selection:text-amber-900 relative flex flex-col items-center py-12 px-4 sm:px-6 before:fixed before:inset-0 before:bg-[url('/noise.webp')] before:opacity-[0.03] before:mix-blend-multiply before:-z-10">

            {/* Soft Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none w-full h-full overflow-hidden">
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-amber-600/5 rounded-full blur-[100px]" />
                <div className="absolute top-[40%] right-[-10%] w-[400px] h-[400px] bg-orange-700/5 rounded-full blur-[80px]" />
            </div>

            <motion.div
                className="relative z-10 w-full max-w-[640px] shadow-2xl shadow-stone-300/40 bg-white/95 backdrop-blur-md rounded-[2.5rem] p-8 sm:p-12 ring-1 ring-stone-900/5 my-auto"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
            >
                {/* Profile Identity */}
                <motion.section variants={fadeInUp} className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10">
                    <div className="relative shrink-0 group">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-700/20 to-amber-300/10 blur-md group-hover:blur-xl transition-all duration-500 rounded-full"></div>
                        <div className="relative w-32 h-32 rounded-full overflow-hidden p-[2px] bg-gradient-to-tr from-amber-200 via-amber-100 to-[#8c6b50]/30">
                            <div className="w-full h-full rounded-full overflow-hidden bg-white">
                                <img
                                    src="/head1.webp"
                                    alt="林美杏老師"
                                    className="w-full h-full object-cover rounded-full scale-100 group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col text-center sm:text-left justify-center sm:pt-4">
                        <h2 className="text-[#a58162] font-serif tracking-[0.2em] text-xs uppercase mb-2 font-medium">
                            Piano Artist &amp; Mentor
                        </h2>
                        <h1 className="text-3xl sm:text-4xl text-stone-800 font-serif tracking-widest mb-3">
                            林美杏 <span className="text-2xl text-stone-500 font-light">老師</span>
                        </h1>
                        <p className="text-stone-500 font-light tracking-wider text-sm">
                            音樂是我們成長中不可多得的陪伴
                        </p>
                    </div>
                </motion.section>

                {/* Decorative Divider */}
                <motion.div variants={fadeInUp} className="w-full flex justify-center mb-10">
                    <div className="w-full max-w-[80%] border-t-[1.5px] border-dashed border-stone-200" />
                </motion.div>

                {/* Links Section */}
                <motion.section variants={fadeInUp} className="w-full mb-12">
                    <h3 className="text-stone-800 font-serif text-lg tracking-widest mb-6 px-1">
                        與我保持聯繫
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {links.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center p-4 bg-stone-50 rounded-2xl ring-1 ring-stone-900/5 hover:ring-amber-500/30 hover:bg-[#fffdfa] hover:shadow-md hover:shadow-amber-900/5 transition-all duration-300 group"
                            >
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#c9b4a1] text-white shrink-0 group-hover:bg-[#b0937a] transition-colors mr-4 shadow-sm">
                                    {link.icon}
                                </div>

                                <div className="flex flex-col justify-center truncate">
                                    <span className="text-stone-800 font-medium tracking-wide mb-0.5 text-sm group-hover:text-amber-900 transition-colors">
                                        {link.label}
                                    </span>
                                    <span className="text-stone-500 font-light text-[11px] tracking-wide truncate">
                                        {link.description}
                                    </span>
                                </div>
                            </a>
                        ))}
                    </div>
                </motion.section>

                {/* Philosophy Section */}
                <motion.section variants={fadeInUp} className="mb-12 px-1">
                    <h3 className="text-stone-800 font-serif text-lg tracking-widest mb-4">
                        教學理念
                    </h3>
                    <p className="text-stone-500 font-light text-sm leading-[1.8] tracking-wider text-justify">
                        美杏老師擁有 40 年的鋼琴教學經驗，於 Yamaha 擔任音樂講師 30 餘年，並擔任合唱團指揮與伴奏長達 30 年。她擅長以細膩的聲音想像與肢體律動訓練，陪伴學生探索音樂的層次與故事。
                    </p>
                </motion.section>

                {/* QR Code Section */}
                <motion.section variants={fadeInUp} className="flex flex-col items-center border-t border-stone-100 pt-10">
                    <h3 className="text-stone-800 font-serif text-lg tracking-widest mb-2">
                        QR Code
                    </h3>
                    <p className="text-stone-400 font-light text-[11px] tracking-wider mb-6">
                        掃描即可快速開啟網站：ms.linho.me
                    </p>

                    <div className="relative bg-stone-50 p-6 rounded-[2rem] ring-1 ring-stone-900/5 mb-8 inline-block shadow-sm">
                        <div ref={qrRef} className="w-[180px] h-[180px] flex items-center justify-center pointer-events-none mix-blend-multiply" />
                    </div>

                    <div className="text-center group">
                        <p className="text-stone-500 text-xs tracking-widest mb-3">
                            預約試聽或合作洽詢：
                            <a href="mailto:ms@linho.me" className="text-[#a58162] hover:text-[#8c6b50] font-medium transition-colors ml-1">
                                ms@linho.me
                            </a>
                        </p>
                        <p className="text-[#a58162] text-xs italic opacity-80">♫ 期待與你在音樂中相遇。</p>
                    </div>
                </motion.section>

            </motion.div>
        </div>
    );
}
