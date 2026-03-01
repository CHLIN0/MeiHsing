import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../animations/variants';

export default function About() {
    return (
        <section id="about" className="py-24 md:py-32 relative">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col md:flex-row gap-16 items-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-100px' }}
                        variants={fadeInUp}
                        className="w-full md:w-5/12 relative"
                    >
                        <div className="aspect-[3/4] overflow-hidden rounded-t-full border border-stone-800 p-2 relative">
                            <img
                                src="/head1.jpeg"
                                alt="林美杏老師"
                                className="w-full h-full object-cover rounded-t-full transition-all duration-700"
                            />
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-background border border-amber-900/30 rounded-full flex items-center justify-center">
                                <span className="text-amber-500 font-serif text-center text-sm">
                                    40+ Years
                                    <br />
                                    Experience
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-100px' }}
                        variants={staggerContainer}
                        className="w-full md:w-7/12 space-y-8"
                    >
                        <motion.div variants={fadeInUp} className="flex items-center space-x-4">
                            <div className="h-px bg-amber-500 w-12" />
                            <h3 className="text-amber-500 font-serif tracking-widest text-xl">ABOUT</h3>
                        </motion.div>
                        <motion.h2
                            variants={fadeInUp}
                            className="text-3xl md:text-5xl font-serif text-white leading-snug"
                        >
                            深耕音樂教育
                            <br />
                            跨越世代的音樂橋樑
                        </motion.h2>
                        <motion.div
                            variants={fadeInUp}
                            className="space-y-6 text-stone-400 leading-relaxed font-light tracking-wide text-lg"
                        >
                            <p>
                                林美杏老師在音樂教育領域深耕近四十年。秉持著對音樂的無比熱忱，她不僅在體制內外的音樂教室擁有豐富的指導經驗，更將這份愛延伸至社區與長者。
                            </p>
                            <p>
                                從古典鋼琴的嚴謹、爵士鋼琴的奔放，到合唱團的凝聚力，美杏老師用音樂串聯起不同世代的心。近年來更致力於樂齡音樂教育，將心靈成長、人際關係與音樂律動結合，讓音樂成為滋養生命的靈藥。
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
