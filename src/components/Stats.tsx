import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, viewportOnce } from '../animations/variants';

const stats = [
    {
        number: '40+',
        label: '年教學經歷',
        icon: (
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM21 16c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
            </svg>
        ),
    },
    {
        number: '31',
        label: '年 YAMAHA 講師',
        icon: (
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                <path d="M12 7v6M9 10h6" />
            </svg>
        ),
    },
    {
        number: '30',
        label: '年合唱團指揮',
        icon: (
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z" />
                <path d="M19 10v2a7 7 0 01-14 0v-2" />
                <path d="M12 19v3M8 22h8" />
            </svg>
        ),
    },
    {
        number: '1000+',
        label: '位學生培育',
        icon: (
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
        ),
    },
];

export default function Stats() {
    return (
        <section className="relative bg-piano section-padding overflow-hidden" aria-label="教學成就統計">
            {/* Top wave */}
            <div className="absolute top-0 left-0 right-0" aria-hidden="true">
                <svg viewBox="0 0 1440 60" className="w-full h-auto" preserveAspectRatio="none">
                    <path d="M0,20 C360,55 720,5 1080,40 C1260,55 1380,25 1440,35 L1440,0 L0,0 Z" fill="#F5F0E8" />
                </svg>
            </div>

            {/* Golden glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px]" aria-hidden="true" />

            <div className="relative max-w-5xl mx-auto px-6">
                <motion.div
                    className="text-center mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={viewportOnce}
                >
                    <p className="text-gold-light/70 font-sans text-base tracking-[0.2em] uppercase mb-3">
                        A Lifetime of Music
                    </p>
                    <h2 className="font-serif text-heading text-cream">
                        一生獻給音樂教育
                    </h2>
                </motion.div>

                <motion.div
                    className="grid grid-cols-2 md:grid-cols-4 gap-8"
                    variants={staggerContainer(0.1)}
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                >
                    {stats.map(({ number, label, icon }) => (
                        <motion.div
                            key={label}
                            variants={fadeInUp}
                            className="text-center"
                        >
                            <span className="text-gold-light mb-4 block">{icon}</span>
                            <span className="font-serif text-6xl md:text-7xl text-gold-light tabular-nums font-light block mb-2">
                                {number}
                            </span>
                            <span className="text-warm-300 text-base font-sans">
                                {label}
                            </span>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            {/* Bottom wave */}
            <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
                <svg viewBox="0 0 1440 60" className="w-full h-auto" preserveAspectRatio="none">
                    <path d="M0,20 C240,50 480,10 720,35 C960,60 1200,15 1440,40 L1440,60 L0,60 Z" fill="#FAF7F2" />
                </svg>
            </div>
        </section>
    );
}
