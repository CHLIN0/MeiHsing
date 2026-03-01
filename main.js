import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Award, Users, Heart, Mic2, BookOpen, ChevronDown, Piano } from 'lucide-react';

// === 動畫變數設定 (Framer Motion Variants) ===
const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.2 }
    }
};

const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1 } }
};

export default function App() {
    const [isScrolled, setIsScrolled] = useState(false);

    // 監聽捲動以改變導覽列樣式
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-stone-300 font-sans selection:bg-amber-700 selection:text-white">

            {/* 導覽列 */}
            <nav className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-[#0a0a0a]/90 backdrop-blur-md py-4 shadow-lg shadow-black/50' : 'bg-transparent py-6'}`}>
                <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
                    <div className="text-xl md:text-2xl font-serif text-amber-500 tracking-widest">
                        Lin Mei-Hsing
                    </div>
                    <div className="hidden md:flex space-x-8 text-sm tracking-widest uppercase">
                        <a href="#about" className="hover:text-amber-500 transition-colors">關於老師</a>
                        <a href="#certifications" className="hover:text-amber-500 transition-colors">專業資格</a>
                        <a href="#experience" className="hover:text-amber-500 transition-colors">教學生涯</a>
                        <a href="#gallery" className="hover:text-amber-500 transition-colors">音樂時光</a>
                    </div>
                </div>
            </nav>

            {/* Hero 區塊 (首屏) */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* 背景圖與遮罩 */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=2070&auto=format&fit=crop"
                        alt=""
                        className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/50 to-[#0a0a0a]"></div>
                </div>

                <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-20">
                    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
                        <motion.h2 variants={fadeInUp} className="text-amber-500 font-serif tracking-[0.3em] text-sm md:text-base mb-6 uppercase">
                            Pianist & Music Educator
                        </motion.h2>
                        <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 tracking-wider">
                            林 美 杏
                        </motion.h1>
                        <motion.p variants={fadeInUp} className="text-lg md:text-2xl text-stone-400 font-light tracking-widest mb-12">
                            「以琴音織就人生，用音樂溫暖歲月」
                        </motion.p>
                        <motion.div variants={fadeInUp} className="w-1px h-24 bg-gradient-to-b from-amber-500 to-transparent mx-auto"></motion.div>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce"
                >
                    <ChevronDown className="text-amber-500 w-8 h-8 opacity-70" />
                </motion.div>
            </section>

            {/* 關於老師 Section */}
            <section id="about" className="py-24 md:py-32 relative">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row gap-16 items-center">
                        <motion.div
                            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}
                            className="w-full md:w-5/12 relative"
                        >
                            <div className="aspect-[3/4] overflow-hidden rounded-t-full border border-stone-800 p-2 relative">
                                <img
                                    src="https://images.unsplash.com/photo-1571243701469-8dbf86159c36?q=80&w=1964&auto=format&fit=crop"
                                    alt=""
                                    className="w-full h-full object-cover rounded-t-full grayscale hover:grayscale-0 transition-all duration-700"
                                />
                                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#0a0a0a] border border-amber-900/30 rounded-full flex items-center justify-center">
                                    <span className="text-amber-500 font-serif text-center text-sm">40+ Years<br />Experience</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}
                            className="w-full md:w-7/12 space-y-8"
                        >
                            <motion.div variants={fadeInUp} className="flex items-center space-x-4">
                                <div className="h-px bg-amber-500 w-12"></div>
                                <h3 className="text-amber-500 font-serif tracking-widest text-xl">ABOUT</h3>
                            </motion.div>
                            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-serif text-white leading-snug">
                                深耕音樂教育<br />跨越世代的音樂橋樑
                            </motion.h2>
                            <motion.div variants={fadeInUp} className="space-y-6 text-stone-400 leading-relaxed font-light tracking-wide text-lg">
                                <p>
                                    畢業於國立台南大學音樂系，林美杏老師在音樂教育領域深耕近四十年。秉持著對音樂的無比熱忱，她不僅在體制內外的音樂教室擁有豐富的指導經驗，更將這份愛延伸至社區與長者。
                                </p>
                                <p>
                                    從古典鋼琴的嚴謹、爵士鋼琴的奔放，到合唱團的凝聚力，美杏老師用音樂串聯起不同世代的心。近年來更致力於樂齡音樂教育，將心靈成長、人際關係與音樂律動結合，讓音樂成為滋養生命的靈藥。
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 專業資格 Section */}
            <section id="certifications" className="py-24 bg-[#0f0f11] relative border-y border-stone-900">
                <div className="max-w-6xl mx-auto px-6">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                        className="text-center mb-16"
                    >
                        <h3 className="text-amber-500 font-serif tracking-widest text-lg mb-2">QUALIFICATIONS</h3>
                        <h2 className="text-3xl md:text-4xl font-serif text-white">專業認證與資格</h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Award className="w-8 h-8 text-amber-500 mb-4" />,
                                title: "YAMAHA 音樂檢定",
                                desc: "具備鋼琴五級、電子琴五級，以及指導級四級資格。曾長期擔任檢定監考官。",
                                year: "1987 - 1999"
                            },
                            {
                                icon: <Piano className="w-8 h-8 text-amber-500 mb-4" />,
                                title: "KAWAI 音樂能力檢定",
                                desc: "取得 KAWAI 演奏等級五級 (Performance Grade 5) 專業資格。",
                                year: "1985"
                            },
                            {
                                icon: <BookOpen className="w-8 h-8 text-amber-500 mb-4" />,
                                title: "樂齡教育專業",
                                desc: "具備高雄市政府教育局核發之「樂齡學習專業人員（一般課程講師）」培訓證明。",
                                year: "Professional"
                            }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                                className="bg-[#151518] p-10 rounded-sm border border-stone-800 hover:border-amber-900/50 transition-colors group"
                            >
                                {item.icon}
                                <div className="text-xs text-stone-500 mb-2 font-mono">{item.year}</div>
                                <h4 className="text-xl text-white font-serif mb-4 group-hover:text-amber-400 transition-colors">{item.title}</h4>
                                <p className="text-stone-400 font-light leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 教學生涯 Section (Timeline) */}
            <section id="experience" className="py-24 md:py-32 relative">
                <div className="max-w-4xl mx-auto px-6">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                        className="text-center mb-20"
                    >
                        <h3 className="text-amber-500 font-serif tracking-widest text-lg mb-2">EXPERIENCE</h3>
                        <h2 className="text-3xl md:text-4xl font-serif text-white">音樂教育軌跡</h2>
                    </motion.div>

                    <div className="space-y-16">
                        {[
                            {
                                title: "YAMAHA 音樂講師暨召集人",
                                org: "功學社山葉樂器股份有限公司",
                                period: "1986 - 2017",
                                icon: <Music className="w-5 h-5 text-amber-900" />,
                                details: "服務長達 31 年，兼任檢定監考官，培育無數音樂學子。退休時獲頒「功在樂教」紀念殊榮。"
                            },
                            {
                                title: "社區合唱團伴奏與指導",
                                org: "高雄市各區合唱團",
                                period: "1997 - 至今",
                                icon: <Mic2 className="w-5 h-5 text-amber-900" />,
                                details: "長期擔任岡山區長青學苑民謠歌唱班教師及合唱團伴奏。曾指導岡山圖書館合唱團(21年)、路竹時代合唱團，現任興毅南興南忠區合唱團指導老師。"
                            },
                            {
                                title: "林美杏音樂教室負責人",
                                org: "私人音樂工作室",
                                period: "Ongoing",
                                icon: <Piano className="w-5 h-5 text-amber-900" />,
                                details: "教授古典鋼琴、爵士鋼琴、自彈自唱與樂理。每年舉辦師生音樂會，並帶領學生榮獲南區 YMF 合奏比賽第一名等佳績。"
                            },
                            {
                                title: "樂齡講師與音樂志工",
                                org: "社會服務與關懷",
                                period: "2019 - 至今",
                                icon: <Heart className="w-5 h-5 text-amber-900" />,
                                details: "擔任岡山區岡山里關懷據點音樂講師，帶領長者音樂律動唱跳。並於義大醫院擔任音樂志工，以鋼琴與空靈鼓療癒大眾。"
                            }
                        ].map((exp, index) => (
                            <motion.div
                                key={index}
                                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                                className="relative pl-8 md:pl-0"
                            >
                                <div className="md:flex items-center justify-between group">
                                    {/* Timeline Line (Desktop) */}
                                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-stone-800 -translate-x-1/2 group-last:bg-gradient-to-b group-last:from-stone-800 group-last:to-transparent"></div>

                                    {/* Left Side (Dates) */}
                                    <div className={`md:w-5/12 mb-4 md:mb-0 ${index % 2 === 0 ? 'md:text-right md:pr-12' : 'md:order-2 md:pl-12'}`}>
                                        <div className="text-amber-500 font-mono text-lg">{exp.period}</div>
                                        <div className="text-stone-500 font-light">{exp.org}</div>
                                    </div>

                                    {/* Center Dot */}
                                    <div className="absolute left-0 md:left-1/2 w-8 h-8 rounded-full bg-[#151518] border border-amber-600/50 -translate-x-1/2 flex items-center justify-center z-10 group-hover:bg-amber-500/10 transition-colors">
                                        {exp.icon}
                                    </div>

                                    {/* Right Side (Content) */}
                                    <div className={`md:w-5/12 ${index % 2 === 0 ? 'md:order-2 md:pl-12' : 'md:text-right md:pr-12'}`}>
                                        <h4 className="text-xl text-white font-serif mb-3">{exp.title}</h4>
                                        <p className="text-stone-400 font-light leading-relaxed">{exp.details}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 剪影/藝廊 Section */}
            <section id="gallery" className="py-24 bg-[#0a0a0a]">
                <div className="max-w-6xl mx-auto px-6">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                        className="flex items-center space-x-4 mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-serif text-white">音樂時光</h2>
                        <div className="h-px bg-amber-500/30 flex-grow"></div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Gallery Images with AI Prompts in Alt */}
                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="group relative aspect-square overflow-hidden rounded-sm">
                            <img src="https://images.unsplash.com/photo-1558522195-e1201b090344?q=80&w=2070&auto=format&fit=crop" alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="text-white font-serif">師生音樂會剪影</span>
                            </div>
                        </motion.div>

                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="group relative aspect-square overflow-hidden rounded-sm">
                            <img src="https://images.unsplash.com/photo-1505904947942-e1c8b3d688ff?q=80&w=1964&auto=format&fit=crop" alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="text-white font-serif">樂齡合唱團指導</span>
                            </div>
                        </motion.div>

                        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="group relative aspect-square overflow-hidden rounded-sm">
                            <img src="https://images.unsplash.com/photo-1514119412350-e174d90d280e?q=80&w=2070&auto=format&fit=crop" alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="text-white font-serif">林美杏音樂教室</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#050505] py-12 border-t border-stone-900">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
                    <div className="mb-6 md:mb-0">
                        <h2 className="text-2xl font-serif text-white tracking-widest mb-2">林 美 杏</h2>
                        <p className="text-stone-500 text-sm tracking-wider">Lin Mei-Hsing | Pianist & Music Educator</p>
                    </div>

                    <div className="flex space-x-6 text-stone-500">
                        <div className="flex items-center gap-2 hover:text-amber-500 transition-colors cursor-pointer">
                            <Heart size={16} /> <span>音樂志工服務</span>
                        </div>
                        <div className="flex items-center gap-2 hover:text-amber-500 transition-colors cursor-pointer">
                            <Users size={16} /> <span>樂齡教育推廣</span>
                        </div>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto px-6 mt-12 text-center text-stone-700 text-xs">
                    <p>© {new Date().getFullYear()} 林美杏音樂工作室. All rights reserved.</p>
                </div>
            </footer>

        </div>
    );
}