import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, fadeInLeft, staggerContainer, viewportOnce } from '../animations/variants';

export default function Hero() {
    const noteRef = useRef<HTMLDivElement>(null);

    // Floating musical notes animation
    useEffect(() => {
        if (!noteRef.current) return;
        const symbols = ['♩', '♪', '♫', '♬', '𝄞'];
        const container = noteRef.current;

        const createNote = () => {
            const note = document.createElement('span');
            note.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            note.className = 'floating-note';
            note.style.left = `${Math.random() * 100}%`;
            note.style.animationDuration = `${6 + Math.random() * 4}s`;
            note.style.fontSize = `${14 + Math.random() * 18}px`;
            note.style.opacity = `${0.1 + Math.random() * 0.15}`;
            container.appendChild(note);
            setTimeout(() => note.remove(), 10000);
        };

        // Check reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const interval = setInterval(createNote, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative min-h-[100svh] flex items-center overflow-hidden">
            {/* Background image — YAMAHA piano */}
            <div className="absolute inset-0">
                <img
                    src="/background2.webp"
                    alt=""
                    className="w-full h-full object-cover"
                    fetchPriority="high"
                    aria-hidden="true"
                />
                {/* Dark gradient overlay for text readability */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(135deg, rgba(44,24,16,0.88) 0%, rgba(44,24,16,0.72) 40%, rgba(44,24,16,0.55) 70%, rgba(44,24,16,0.40) 100%)',
                    }}
                />
            </div>

            {/* Floating notes container */}
            <div ref={noteRef} className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true" />

            {/* Gold ornamental line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold-light/40 to-transparent" aria-hidden="true" />

            {/* Content */}
            <div className="relative max-w-6xl mx-auto px-6 w-full pt-24 pb-16">
                <motion.div
                    className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16"
                    variants={staggerContainer(0.15)}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Portrait */}
                    <motion.div variants={fadeInLeft} className="relative flex-shrink-0">
                        <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
                            {/* Gold border ring */}
                            <div className="absolute inset-0 rounded-full border-2 border-gold-light/50" />
                            <div className="absolute -inset-3 rounded-full border border-gold-light/20" />
                            {/* Photo */}
                            <img
                                src="/head.webp"
                                alt="林美杏老師"
                                width={320}
                                height={320}
                                className="w-full h-full rounded-full object-cover"
                                fetchPriority="high"
                            />
                            {/* Decorative treble clef */}
                            <span className="absolute -right-4 -bottom-2 text-5xl text-gold-light/30 font-serif select-none" aria-hidden="true">
                                𝄞
                            </span>
                        </div>
                    </motion.div>

                    {/* Text content */}
                    <motion.div variants={fadeInUp} className="text-center lg:text-left max-w-2xl">
                        <p className="text-gold-light/70 font-sans text-base tracking-[0.2em] uppercase mb-3">
                            Piano Artist & Mentor
                        </p>

                        <h1 className="font-serif text-display mb-6">
                            <span className="text-cream">林美杏</span>
                            <span className="text-gold-light ml-3 font-light">老師</span>
                        </h1>

                        <p className="text-warm-100 text-xl leading-relaxed mb-3 font-light italic font-serif">
                            「音樂是我們成長中不可多得的陪伴」
                        </p>

                        <p className="text-warm-200 text-lg leading-relaxed mb-5 max-w-xl mx-auto lg:mx-0">
                            三十幾年音樂教育深耕，YAMAHA 資深音樂講師，以細膩的聲音想像與肢體律動訓練，
                            陪伴每一位學生探索音樂的層次與故事。
                        </p>

                        {/* Current positions — highlighted cards */}
                        <ul className="mb-6 space-y-3 text-lg text-warm-100 max-w-xl mx-auto lg:mx-0 list-none">
                            <li className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2.5 border border-gold-light/20">
                                <span className="text-gold-light text-base flex-shrink-0" aria-hidden="true">▸</span>
                                岡山長青學苑合唱團老師兼伴奏
                            </li>
                            <li className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2.5 border border-gold-light/20">
                                <span className="text-gold-light text-base flex-shrink-0" aria-hidden="true">▸</span>
                                岡山長青民謠班老師
                            </li>
                            <li className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2.5 border border-gold-light/20">
                                <span className="text-gold-light text-base flex-shrink-0" aria-hidden="true">▸</span>
                                純陽南忠區合唱團指導老師
                            </li>
                            <li className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2.5 border border-gold-light/20">
                                <span className="text-gold-light text-base flex-shrink-0" aria-hidden="true">▸</span>
                                林美杏音樂教室
                            </li>
                        </ul>

                        {/* Teaching subjects */}
                        <div className="flex flex-wrap gap-2 mb-8 justify-center lg:justify-start">
                            {['古典鋼琴', '爵士鋼琴', '自彈自唱', '樂理教學'].map((subject) => (
                                <span
                                    key={subject}
                                    className="inline-flex items-center px-4 py-2 rounded-full bg-white/12 border border-gold-light/35 text-warm-100 text-sm font-sans tracking-wide backdrop-blur-sm"
                                >
                                    {subject}
                                </span>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <a href="#contact" className="btn-cta cursor-pointer">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                    <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM21 16c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
                                </svg>
                                預約試聽
                            </a>
                            <a href="#gallery" className="btn-outline-hero cursor-pointer">
                                教學花絮
                            </a>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Bottom wave transition */}
            <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
                <svg viewBox="0 0 1440 60" className="w-full h-auto" preserveAspectRatio="none">
                    <path
                        d="M0,40 C240,10 480,60 720,30 C960,0 1200,50 1440,20 L1440,60 L0,60 Z"
                        fill="#F5F0E8"
                    />
                </svg>
            </div>

            <style>{`
        .floating-note {
          position: absolute;
          bottom: -20px;
          color: #D4A853;
          animation: floatUp linear forwards;
          pointer-events: none;
          user-select: none;
        }
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
        </section>
    );
}
