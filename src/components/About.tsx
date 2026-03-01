import { motion } from 'framer-motion';
import { fadeInLeft, fadeInRight, staggerContainer, viewportOnce } from '../animations/variants';

export default function About() {
    return (
        <section id="about" className="bg-cream section-padding" aria-labelledby="about-heading">
            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20"
                    variants={staggerContainer(0.2)}
                    initial="hidden"
                    whileInView="visible"
                    viewport={viewportOnce}
                >
                    {/* Image */}
                    <motion.div variants={fadeInLeft} className="relative flex-shrink-0 w-full lg:w-2/5">
                        <div className="relative aspect-[3/4] max-w-sm mx-auto lg:mx-0 overflow-hidden rounded-2xl border-gold-ornate">
                            <img
                                src="/head1.webp"
                                alt="林美杏老師在音樂會上的照片"
                                width={400}
                                height={533}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                            {/* Overlay gradient */}
                            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-piano/40 to-transparent" />
                        </div>
                        {/* Decorative staff lines */}
                        <div className="absolute -bottom-6 -right-6 w-24 opacity-20" aria-hidden="true">
                            <div className="divider-staff">
                                <span /><span /><span /><span /><span />
                            </div>
                        </div>
                    </motion.div>

                    {/* Text content */}
                    <motion.div variants={fadeInRight} className="lg:w-3/5">
                        <p className="text-gold font-sans text-base tracking-[0.15em] uppercase mb-3">
                            About the Teacher
                        </p>
                        <h2 id="about-heading" className="font-serif text-heading text-piano mb-8">
                            關於美杏老師
                        </h2>

                        <div className="space-y-5 text-warm-600 text-lg leading-relaxed">
                            <p>
                                美杏老師擁有<strong className="text-piano font-medium">近四十年</strong>的鋼琴教學經驗，
                                於 YAMAHA 音樂教室擔任資深講師超過 31 年，同時擔任合唱團指揮與伴奏長達 30 年。
                            </p>
                            <p>
                                她擅長以<em className="text-gold font-serif">細膩的聲音想像</em>與肢體律動訓練，
                                帶領學生探索音樂的層次與故事。無論是初學啟蒙的幼童，還是重拾琴鍵的樂齡學員，
                                她都能用溫暖與耐心點燃他們對音樂的熱情。
                            </p>
                            <p>
                                她相信，音樂不只是技巧的累積，更是心靈的滋養。每一堂課，都是一場最美的陪伴。
                            </p>
                        </div>

                        {/* Decorative quote */}
                        <blockquote className="mt-8 pl-6 border-l-2 border-gold-light/40 italic font-serif text-xl text-warm-500">
                            「每個孩子都有自己的音樂天賦，<br />我只是幫他們找到那個聲音。」
                        </blockquote>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
