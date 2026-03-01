import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { fadeInUp, staggerContainer } from '../animations/variants';

export default function Hero() {
    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
            {/* 背景圖與遮罩 */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/background.png"
                    alt="林美杏音樂教室"
                    className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
            </div>

            <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-20">
                <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
                    <motion.h2
                        variants={fadeInUp}
                        className="text-amber-500 font-serif tracking-[0.3em] text-sm md:text-base mb-6 uppercase"
                    >
                        Pianist &amp; Music Educator
                    </motion.h2>
                    <motion.h1
                        variants={fadeInUp}
                        className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 tracking-wider"
                    >
                        林 美 杏
                    </motion.h1>
                    <motion.p
                        variants={fadeInUp}
                        className="text-lg md:text-2xl text-stone-400 font-light tracking-widest mb-12"
                    >
                        「以琴音織就人生，用音樂溫暖歲月」
                    </motion.p>
                    <motion.div
                        variants={fadeInUp}
                        className="w-px h-24 bg-gradient-to-b from-amber-500 to-transparent mx-auto"
                    />
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce"
            >
                <ChevronDown className="text-amber-500 w-8 h-8 opacity-70" />
            </motion.div>
        </section>
    );
}
