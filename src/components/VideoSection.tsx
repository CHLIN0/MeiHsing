import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, viewportOnce } from '../animations/variants';

export default function VideoSection() {
    return (
        <section id="video" className="bg-cream section-padding" aria-labelledby="video-heading">
            <div className="max-w-5xl mx-auto px-6">
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={viewportOnce}
                >
                    <p className="text-gold font-sans text-sm tracking-[0.2em] uppercase mb-3">
                        Performances
                    </p>
                    <h2 id="video-heading" className="font-serif text-heading text-piano">
                        演奏影音
                    </h2>
                    <p className="text-warm-500 mt-4 max-w-lg mx-auto text-sm leading-relaxed">
                        欣賞美杏老師與學生們的精彩演出，感受音樂的溫度與力量。
                    </p>
                </motion.div>

                <motion.div
                    variants={staggerContainer(0.15)}
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                    className="space-y-8"
                >
                    {/* Main featured video */}
                    <motion.div variants={fadeInUp} className="glass-card overflow-hidden">
                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                            <iframe
                                className="absolute inset-0 w-full h-full"
                                src="https://www.youtube.com/embed/?listType=user_uploads&list=林美杏"
                                title="林美杏老師 YouTube 頻道"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                loading="lazy"
                            />
                        </div>
                    </motion.div>

                    {/* YouTube channel link */}
                    <motion.div variants={fadeInUp} className="text-center">
                        <a
                            href="https://www.youtube.com/@%E6%9E%97%E7%BE%8E%E6%9D%8F-w2d"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-outline cursor-pointer inline-flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                <path d="M21.6 7.2a2 2 0 00-1.4-1.4C18.4 5.3 12 5.3 12 5.3s-6.4 0-8.2.5A2 2 0 002.4 7.2 21.3 21.3 0 002 12a21.3 21.3 0 00.4 4.8 2 2 0 001.4 1.4c1.8.5 8.2.5 8.2.5s6.4 0 8.2-.5a2 2 0 001.4-1.4A21.3 21.3 0 0022 12a21.3 21.3 0 00-.4-4.8zM10.5 14.7V9.3l4.7 2.7-4.7 2.7z" />
                            </svg>
                            前往 YouTube 頻道
                        </a>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
