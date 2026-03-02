import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, viewportOnce } from '../animations/variants';

const socialLinks = [
    {
        name: 'Facebook',
        href: 'https://www.facebook.com/piano.lin.3',
        desc: '最新演出與教學花絮',
        icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
                <path d="M13.5 9.5V7.8c0-.8.2-1.3 1.4-1.3H16V4.1c-.6-.1-1.3-.1-1.9-.1-1.9 0-3.1 1.1-3.1 3.2v2.3H9v2.6h2v7.5h2.5v-7.5H16l.3-2.6h-2.8z" />
            </svg>
        ),
    },
    {
        name: 'Instagram',
        href: 'https://www.instagram.com/meishing888/',
        desc: '課程花絮與練習靈感',
        icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
                <path d="M16.8 3H7.2A4.2 4.2 0 003 7.2v9.6A4.2 4.2 0 007.2 21h9.6a4.2 4.2 0 004.2-4.2V7.2A4.2 4.2 0 0016.8 3zm2.7 14.8a2.7 2.7 0 01-2.7 2.7H7.2a2.7 2.7 0 01-2.7-2.7V7.2a2.7 2.7 0 012.7-2.7h9.6a2.7 2.7 0 012.7 2.7v9.6z" />
                <path d="M12 8.2A3.8 3.8 0 1015.8 12 3.8 3.8 0 0012 8.2zm0 6.3A2.5 2.5 0 1114.5 12 2.5 2.5 0 0112 14.5z" />
                <circle cx="16.2" cy="7.8" r=".8" />
            </svg>
        ),
    },
    {
        name: 'YouTube',
        href: 'https://www.youtube.com/@%E6%9E%97%E7%BE%8E%E6%9D%8F-w2d',
        desc: '演奏紀錄與示範課程',
        icon: (
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
                <path d="M21.6 7.2a2 2 0 00-1.4-1.4C18.4 5.3 12 5.3 12 5.3s-6.4 0-8.2.5A2 2 0 002.4 7.2 21.3 21.3 0 002 12a21.3 21.3 0 00.4 4.8 2 2 0 001.4 1.4c1.8.5 8.2.5 8.2.5s6.4 0 8.2-.5a2 2 0 001.4-1.4A21.3 21.3 0 0022 12a21.3 21.3 0 00-.4-4.8zM10.5 14.7V9.3l4.7 2.7-4.7 2.7z" />
            </svg>
        ),
    },
];

const currentTeaching = [
    {
        title: '岡山長青學苑合唱團',
        role: '老師兼伴奏',
        icon: '🎤',
    },
    {
        title: '岡山長青民謠班',
        role: '教師',
        icon: '🎶',
    },
    {
        title: '純陽南忠區合唱團',
        role: '指導老師',
        icon: '🎵',
    },
    {
        title: '林美杏音樂教室',
        role: '古典鋼琴 · 爵士鋼琴 · 自彈自唱 · 樂理教學',
        icon: '🎹',
    },
];

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        course: '',
        goal: '',
        time: '',
        other: ''
    });

    const [copied, setCopied] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Fix hydration mismatch by only rendering rich interactive elements after mount
    useEffect(() => {
        setMounted(true);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getCourseName = (value: string) => {
        const courses: Record<string, string> = {
            'classic-piano': '古典鋼琴',
            'jazz-piano': '爵士鋼琴',
            'sing-play': '自彈自唱',
            'theory': '樂理教學',
            'choir': '合唱團',
            'senior': '樂齡課程',
            'other': '其他'
        };
        return courses[value] || value;
    };

    const generateMessage = () => {
        return `您好，我想預約/洽詢課程：
1. 姓名：${formData.name}
2. 感興趣的課程：${getCourseName(formData.course)}
3. 學習目標或目前程度：${formData.goal}
4. 方便上課的時段：${formData.time}
5. 其他想了解的事項：${formData.other}`;
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(generateMessage());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = generateMessage();
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err);
            }
            document.body.removeChild(textArea);
        }
    };

    const handleEmail = () => {
        const subject = encodeURIComponent(`預約/洽詢課程 - ${formData.name}`);
        const body = encodeURIComponent(generateMessage());
        window.location.href = `mailto:ms@linho.me?subject=${subject}&body=${body}`;
    };

    return (
        <section id="contact" className="relative bg-cream section-padding" aria-labelledby="contact-heading">
            {/* Top wave */}
            <div className="absolute top-0 left-0 right-0" aria-hidden="true">
                <svg viewBox="0 0 1440 60" className="w-full h-auto" preserveAspectRatio="none">
                    <path d="M0,30 C360,55 720,5 1080,35 C1260,50 1380,20 1440,30 L1440,0 L0,0 Z" fill="#FAF7F2" />
                </svg>
            </div>

            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    className="text-center mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={viewportOnce}
                >
                    <p className="text-gold font-sans text-base tracking-[0.2em] uppercase mb-3">
                        Get in Touch
                    </p>
                    <h2 id="contact-heading" className="font-serif text-heading text-piano">
                        與我聯繫
                    </h2>
                </motion.div>

                <motion.div
                    className="grid lg:grid-cols-3 gap-10 items-start"
                    variants={staggerContainer(0.15)}
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                >
                    {/* Current Teaching — left column */}
                    <motion.div variants={fadeInLeft}>
                        <h3 className="font-serif text-2xl text-piano mb-6 flex items-center gap-2">
                            <span className="text-gold" aria-hidden="true">♩</span>
                            目前教學
                        </h3>
                        <div className="space-y-4">
                            {currentTeaching.map((item) => (
                                <div
                                    key={item.title}
                                    className="glass-card p-5 group hover:border-gold-light/30 transition-colors duration-200"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-xl flex-shrink-0 mt-0.5" aria-hidden="true">{item.icon}</span>
                                        <div>
                                            <h4 className="font-serif text-lg text-piano font-medium">{item.title}</h4>
                                            <p className="text-warm-500 text-base mt-0.5">{item.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Contact instructions & Generation — center column */}
                    <motion.div variants={fadeInUp}>
                        <h3 className="font-serif text-2xl text-piano mb-6 flex items-center gap-2">
                            <span className="text-gold" aria-hidden="true">✉</span>
                            預約試聽
                        </h3>
                        <div className="bg-white/80 border border-warm-200 rounded-xl p-6 shadow-sm">
                            <p className="text-piano text-base font-sans mb-4 leading-relaxed">
                                歡迎填寫下方資訊，一鍵複製訊息或發送 Email 與我聯繫！收到訊息後，我會盡快回覆您。
                            </p>

                            <form className="space-y-4 mb-6" onSubmit={(e) => e.preventDefault()}>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-sans font-medium text-piano mb-1.5">
                                        1. 姓名
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="如何稱呼您？"
                                        className="w-full px-3 py-2 bg-white/50 border border-warm-200 rounded text-piano placeholder:text-warm-400 focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors duration-200 font-sans text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="course" className="block text-sm font-sans font-medium text-piano mb-1.5">
                                        2. 感興趣的課程
                                    </label>
                                    <select
                                        id="course"
                                        name="course"
                                        value={formData.course}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-white/50 border border-warm-200 rounded text-piano focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors duration-200 font-sans text-sm cursor-pointer"
                                    >
                                        <option value="">請選擇…</option>
                                        <option value="classic-piano">古典鋼琴</option>
                                        <option value="jazz-piano">爵士鋼琴</option>
                                        <option value="sing-play">自彈自唱</option>
                                        <option value="theory">樂理教學</option>
                                        <option value="choir">合唱團</option>
                                        <option value="senior">樂齡課程</option>
                                        <option value="other">其他</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="goal" className="block text-sm font-sans font-medium text-piano mb-1.5">
                                        3. 學習目標或目前程度
                                    </label>
                                    <input
                                        type="text"
                                        id="goal"
                                        name="goal"
                                        value={formData.goal}
                                        onChange={handleChange}
                                        placeholder="例如：初學者 / 想準備檢定"
                                        className="w-full px-3 py-2 bg-white/50 border border-warm-200 rounded text-piano placeholder:text-warm-400 focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors duration-200 font-sans text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="time" className="block text-sm font-sans font-medium text-piano mb-1.5">
                                        4. 方便上課的時段
                                    </label>
                                    <input
                                        type="text"
                                        id="time"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleChange}
                                        placeholder="例如：平日晚上 / 週末下午"
                                        className="w-full px-3 py-2 bg-white/50 border border-warm-200 rounded text-piano placeholder:text-warm-400 focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors duration-200 font-sans text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="other" className="block text-sm font-sans font-medium text-piano mb-1.5">
                                        5. 其他想了解的事項
                                    </label>
                                    <textarea
                                        id="other"
                                        name="other"
                                        value={formData.other}
                                        onChange={handleChange}
                                        rows={2}
                                        placeholder="有任何問題都可以填寫…"
                                        className="w-full px-3 py-2 bg-white/50 border border-warm-200 rounded text-piano placeholder:text-warm-400 focus:border-gold focus:ring-1 focus:ring-gold/30 transition-colors duration-200 font-sans text-sm resize-none"
                                    />
                                </div>
                            </form>

                            {mounted && (
                                <div className="space-y-3">
                                    <button
                                        onClick={handleCopy}
                                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gold text-white rounded-lg font-medium hover:bg-gold-dark transition-colors duration-200 shadow-sm"
                                    >
                                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            {copied ? (
                                                <path d="M20 6L9 17l-5-5" />
                                            ) : (
                                                <>
                                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                                </>
                                            )}
                                        </svg>
                                        {copied ? '已複製到剪貼簿！' : '複製訊息，前往社群發送'}
                                    </button>

                                    <button
                                        onClick={handleEmail}
                                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white/50 border border-gold/50 text-gold-dark rounded-lg font-medium hover:bg-gold/10 transition-colors duration-200"
                                    >
                                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                        直接透過 Email 送出
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Social links + info — right column */}
                    <motion.div variants={fadeInRight} className="space-y-5">
                        <h3 className="font-serif text-2xl text-piano mb-6 flex items-center gap-2">
                            <span className="text-gold" aria-hidden="true">♫</span>
                            社群與聯繫
                        </h3>

                        {/* Email */}
                        <div className="glass-card p-5">
                            <h4 className="font-serif text-lg text-piano mb-1.5">Email</h4>
                            <a
                                href="mailto:ms@linho.me"
                                className="text-gold hover:text-gold-dark transition-colors duration-200 cursor-pointer font-sans text-base"
                            >
                                ms@linho.me
                            </a>
                            <p className="text-warm-500 text-sm mt-1">通常於 24 小時內回覆</p>
                        </div>

                        {/* Social cards */}
                        {socialLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="glass-card p-4 flex items-center gap-4 group cursor-pointer hover:border-gold-light/30 transition-colors duration-200 block"
                            >
                                <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold/20 transition-colors duration-200 flex-shrink-0">
                                    {link.icon}
                                </div>
                                <div>
                                    <span className="font-sans font-medium text-piano text-base block">{link.name}</span>
                                    <span className="text-warm-500 text-sm">{link.desc}</span>
                                </div>
                            </a>
                        ))}

                        {/* All links page */}
                        <a
                            href="/links"
                            className="glass-card p-4 flex items-center gap-4 group cursor-pointer hover:border-gold-light/30 transition-colors duration-200 block"
                        >
                            <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold/20 transition-colors duration-200 flex-shrink-0">
                                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0-12.814a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0 12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <span className="font-sans font-medium text-piano text-base block">查看所有連結</span>
                                <span className="text-warm-500 text-sm">含 QR Code，方便分享</span>
                            </div>
                            <svg className="w-4 h-4 text-warm-400 group-hover:text-gold transition-colors duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </a>

                        {/* Tagline */}
                        <p className="text-center text-warm-500 text-base italic font-serif pt-2">
                            ♩ 期待與你在音樂中相遇。
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
