import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, viewportOnce } from '../animations/variants';

const certifications = [
    {
        title: 'YAMAHA 指導級四級',
        org: 'YAMAHA Music Foundation',
        year: '1999',
        desc: 'Fundamentals Grade 4 — YAMAHA 系統最高等級教學認證，具備完整的音樂教育指導能力。',
    },
    {
        title: 'YAMAHA 鋼琴演奏五級',
        org: 'YAMAHA Music Foundation',
        year: '1988',
        desc: 'Fundamentals Grade 5 — 涵蓋獨奏、即興演奏與視奏能力的鋼琴演奏認證。',
    },
    {
        title: 'YAMAHA 電子琴五級',
        org: 'YAMAHA Music Foundation',
        year: '1987',
        desc: 'Electone Grade 5 — 電子琴演奏能力檢定，展現多元樂器演奏實力。',
    },
    {
        title: 'KAWAI 演奏五級',
        org: 'KAWAI Music Foundation',
        year: '1985',
        desc: 'Performance Grade 5 — KAWAI 鋼琴演奏能力檢定，奠定堅實演奏基礎。',
    },
    {
        title: '樂齡學習專業人員',
        org: '高雄市政府教育局',
        year: '',
        desc: '取得一般課程講師培訓證明書，具備樂齡教育專業資格。',
    },
    {
        title: '功在樂教紀念獎',
        org: 'YAMAHA 功學社',
        year: '2017',
        desc: '31 年教學貢獻卓著，退休時由功學社山葉樂器頒發「功在樂教」紀念獎座。',
    },
];

export default function Certifications() {
    return (
        <section className="bg-cream section-padding" aria-labelledby="cert-heading">
            <div className="max-w-5xl mx-auto px-6">
                <motion.div
                    className="text-center mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={viewportOnce}
                >
                    <p className="text-gold font-sans text-base tracking-[0.2em] uppercase mb-3">
                        Qualifications
                    </p>
                    <h2 id="cert-heading" className="font-serif text-heading text-piano">
                        專業資格與榮譽
                    </h2>
                </motion.div>

                <motion.div
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={staggerContainer(0.08)}
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                >
                    {certifications.map((cert) => (
                        <motion.div
                            key={cert.title}
                            variants={fadeInUp}
                            className="glass-card p-7 group cursor-default hover:border-gold-light/30 transition-colors duration-200"
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mt-1">
                                    <svg className="w-5 h-5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                        <path d="M12 15l-3.5 2 .67-3.9L6 10.1l3.9-.57L12 6l1.58 3.53 3.9.57-2.83 2.76.67 3.9z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-serif text-xl text-piano mb-0.5">{cert.title}</h3>
                                    <div className="flex items-center gap-2 mb-2.5">
                                        <p className="text-gold text-xs font-sans tracking-wider uppercase">{cert.org}</p>
                                        {cert.year && (
                                            <span className="text-warm-400 text-xs font-sans tabular-nums">· {cert.year}</span>
                                        )}
                                    </div>
                                    <p className="text-warm-600 text-base leading-relaxed">{cert.desc}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
