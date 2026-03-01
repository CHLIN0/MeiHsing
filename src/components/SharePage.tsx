import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../animations/variants';

interface LinkItem {
    href: string;
    label: string;
    description: string;
    icon: React.ReactNode;
}

const links: LinkItem[] = [
    {
        href: 'https://www.facebook.com/piano.lin.3',
        label: 'Facebook 專頁',
        description: '最新演出與教學花絮',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M13.5 9.5V7.8c0-.8.2-1.3 1.4-1.3H16V4.1c-.6-.1-1.3-.1-1.9-.1-1.9 0-3.1 1.1-3.1 3.2v2.3H9v2.6h2v7.5h2.5v-7.5H16l.3-2.6h-2.8z" />
            </svg>
        ),
    },
    {
        href: 'https://www.instagram.com/meishing888/',
        label: 'Instagram 日常',
        description: '課程花絮與練習靈感',
        icon: (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
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
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M21.6 7.2a2 2 0 00-1.4-1.4C18.4 5.3 12 5.3 12 5.3s-6.4 0-8.2.5A2 2 0 002.4 7.2 21.3 21.3 0 002 12a21.3 21.3 0 00.4 4.8 2 2 0 001.4 1.4c1.8.5 8.2.5 8.2.5s6.4 0 8.2-.5a2 2 0 001.4-1.4A21.3 21.3 0 0022 12a21.3 21.3 0 00-.4-4.8zM10.5 14.7V9.3l4.7 2.7-4.7 2.7z" />
            </svg>
        ),
    },
];

export default function SharePage() {
    return (
        <div className="min-h-screen bg-background text-stone-300 font-sans selection:bg-amber-700 selection:text-white">
            {/* 裝飾背景 */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-900/5 rounded-full blur-3xl" />
            </div>

            <div className="max-w-lg mx-auto px-6 py-16">
                <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
                    {/* 頭像與簡介 */}
                    <motion.section variants={fadeInUp} className="text-center mb-12">
                        <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-2 border-amber-500/30 p-1">
                            <img
                                src="/head1.webp"
                                alt="林美杏老師"
                                className="w-full h-full object-cover rounded-full"
                            />
                        </div>
                        <p className="text-amber-500 font-serif tracking-[0.3em] text-xs uppercase mb-2">
                            Piano Artist &amp; Mentor
                        </p>
                        <h1 className="text-3xl md:text-4xl font-serif text-white tracking-wider mb-3">
                            林美杏 老師
                        </h1>
                        <p className="text-stone-400 font-light tracking-wider">
                            音樂是我們成長中不可多得的陪伴
                        </p>
                    </motion.section>

                    {/* 社群連結 */}
                    <motion.section variants={fadeInUp} className="mb-12">
                        <h2 className="text-amber-500 font-serif tracking-widest text-sm uppercase mb-6 text-center">
                            與我保持聯繫
                        </h2>
                        <div className="space-y-3">
                            {links.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-4 bg-card border border-stone-800 rounded-lg hover:border-amber-900/50 hover:bg-card/80 transition-all group"
                                >
                                    <span className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 group-hover:bg-amber-500/20 transition-colors">
                                        {link.icon}
                                    </span>
                                    <span className="flex flex-col">
                                        <span className="text-white font-medium group-hover:text-amber-400 transition-colors">
                                            {link.label}
                                        </span>
                                        <span className="text-stone-500 text-sm">{link.description}</span>
                                    </span>
                                </a>
                            ))}
                        </div>
                    </motion.section>

                    {/* 教學理念 */}
                    <motion.section variants={fadeInUp} className="mb-12">
                        <h2 className="text-amber-500 font-serif tracking-widest text-sm uppercase mb-4 text-center">
                            教學理念
                        </h2>
                        <div className="p-6 bg-card border border-stone-800 rounded-lg">
                            <p className="text-stone-400 font-light leading-relaxed text-center">
                                美杏老師擁有 40 年的鋼琴教學經驗，於 Yamaha 擔任音樂講師 30 餘年，並擔任合唱團指揮與伴奏長達 30 年。
                                她擅長以細膩的聲音想像與肢體律動訓練，陪伴學生探索音樂的層次與故事。
                            </p>
                        </div>
                    </motion.section>

                    {/* 聯繫資訊 */}
                    <motion.section variants={fadeInUp} className="text-center mb-8">
                        <p className="text-stone-500 text-sm mb-2">
                            預約試聽或合作洽詢
                        </p>
                        <a
                            href="mailto:ms@linho.me"
                            className="text-amber-500 hover:text-amber-400 font-serif text-lg tracking-wider transition-colors"
                        >
                            ms@linho.me
                        </a>
                    </motion.section>

                    {/* 回到主頁 */}
                    <motion.div variants={fadeInUp} className="text-center">
                        <a
                            href="/"
                            className="inline-flex items-center gap-2 text-stone-500 hover:text-amber-500 transition-colors text-sm tracking-wider"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            回到主頁
                        </a>
                    </motion.div>

                    {/* Footer */}
                    <motion.footer variants={fadeInUp} className="mt-12 pt-6 border-t border-stone-900 text-center">
                        <p className="text-stone-700 text-xs">♫ 期待與你在音樂中相遇。</p>
                    </motion.footer>
                </motion.div>
            </div>
        </div>
    );
}
