import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn, viewportOnce } from '../animations/variants';

const testimonials = [
    {
        quote: '美杏老師讓我家孩子從討厭練琴，變成每天主動坐在鋼琴前。她那種溫柔但堅定的教學方式，真的很神奇。',
        name: '王媽媽',
        role: '學生家長',
    },
    {
        quote: '跟美杏老師學了三年，她不只教琴，更教我如何用音樂表達自己。每堂課都像在說一個新故事。',
        name: '陳同學',
        role: '鋼琴學生',
    },
    {
        quote: '退休後加入樂齡班，美杏老師的課程讓我重新找到生活的樂趣。音樂真的不分年齡！',
        name: '林伯伯',
        role: '樂齡學員',
    },
    {
        quote: '美杏老師帶領合唱團三十年，她對音樂的熱情感染了每一個團員。我們不只是在唱歌，更是在分享快樂。',
        name: '張團員',
        role: '合唱團成員',
    },
];

export default function Testimonials() {
    const [current, setCurrent] = useState(0);

    const next = useCallback(() => {
        setCurrent((c) => (c + 1) % testimonials.length);
    }, []);

    const prev = useCallback(() => {
        setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
    }, []);

    // Auto-advance
    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        const timer = setInterval(next, 6000);
        return () => clearInterval(timer);
    }, [next]);

    return (
        <section className="section-padding bg-ivory" aria-labelledby="testimonials-heading">
            <div className="max-w-3xl mx-auto px-6">
                <motion.div
                    className="text-center mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={viewportOnce}
                >
                    <p className="text-gold font-sans text-base tracking-[0.2em] uppercase mb-3">
                        Testimonials
                    </p>
                    <h2 id="testimonials-heading" className="font-serif text-heading text-piano">
                        學生與家長的話
                    </h2>
                </motion.div>

                {/* Carousel */}
                <div className="relative" role="region" aria-label="學生回饋輪播" aria-live="polite">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current}
                            variants={fadeIn}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            className="text-center"
                        >
                            {/* Decorative quote mark */}
                            <span className="block text-6xl text-gold-light/30 font-serif leading-none mb-6" aria-hidden="true">
                                "
                            </span>

                            <blockquote className="font-serif text-2xl md:text-3xl text-piano leading-relaxed mb-8 italic">
                                {testimonials[current].quote}
                            </blockquote>

                            <div>
                                <p className="font-sans font-medium text-piano text-lg">{testimonials[current].name}</p>
                                <p className="text-warm-500 text-base">{testimonials[current].role}</p>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation dots */}
                    <div className="flex justify-center gap-2 mt-10" role="tablist" aria-label="選擇回饋">
                        {testimonials.map((_, i) => (
                            <button
                                key={i}
                                role="tab"
                                aria-selected={i === current}
                                aria-label={`第 ${i + 1} 則回饋`}
                                onClick={() => setCurrent(i)}
                                className={`w-2.5 h-2.5 rounded-full cursor-pointer touch-target transition-all duration-200 ${i === current ? 'bg-gold w-6' : 'bg-warm-300 hover:bg-warm-400'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Prev/Next buttons */}
                    <button
                        onClick={prev}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-sm flex items-center justify-center text-warm-600 cursor-pointer transition-colors duration-200 hidden md:flex"
                        aria-label="上一則"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-white/80 hover:bg-white shadow-sm flex items-center justify-center text-warm-600 cursor-pointer transition-colors duration-200 hidden md:flex"
                        aria-label="下一則"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    );
}
