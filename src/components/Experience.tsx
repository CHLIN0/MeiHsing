import { motion } from 'framer-motion';
import { Music, Mic2, Piano, Heart } from 'lucide-react';
import { fadeInUp } from '../animations/variants';
import type { Experience as ExperienceType } from '../types';

const experiences: ExperienceType[] = [
    {
        title: 'YAMAHA 音樂講師暨召集人',
        org: '功學社山葉樂器股份有限公司',
        period: '1986 - 2017',
        icon: <Music className="w-5 h-5 text-amber-900" />,
        details:
            '服務長達 31 年，兼任檢定監考官，培育無數音樂學子。退休時獲頒「功在樂教」紀念殊榮。',
    },
    {
        title: '社區合唱團伴奏與指導',
        org: '高雄市各區合唱團',
        period: '1997 - 至今',
        icon: <Mic2 className="w-5 h-5 text-amber-900" />,
        details:
            '長期擔任岡山區長青學苑民謠歌唱班教師及合唱團伴奏。曾指導岡山圖書館合唱團(21年)、路竹時代合唱團，現任興毅南興南忠區合唱團指導老師。',
    },
    {
        title: '林美杏音樂教室負責人',
        org: '私人音樂工作室',
        period: 'Ongoing',
        icon: <Piano className="w-5 h-5 text-amber-900" />,
        details:
            '教授古典鋼琴、爵士鋼琴、自彈自唱與樂理。每年舉辦師生音樂會，並帶領學生榮獲南區 YMF 合奏比賽第一名等佳績。',
    },
    {
        title: '樂齡講師與音樂志工',
        org: '社會服務與關懷',
        period: '2019 - 至今',
        icon: <Heart className="w-5 h-5 text-amber-900" />,
        details:
            '擔任岡山區岡山里關懷據點音樂講師，帶領長者音樂律動唱跳。並於義大醫院擔任音樂志工，以鋼琴與空靈鼓療癒大眾。',
    },
];

export default function Experience() {
    return (
        <section id="experience" className="py-24 md:py-32 relative">
            <div className="max-w-4xl mx-auto px-6">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="text-center mb-20"
                >
                    <h3 className="text-amber-500 font-serif tracking-widest text-lg mb-2">EXPERIENCE</h3>
                    <h2 className="text-3xl md:text-4xl font-serif text-white">音樂教育軌跡</h2>
                </motion.div>

                <div className="space-y-16">
                    {experiences.map((exp, index) => (
                        <motion.div
                            key={index}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                            className="relative pl-8 md:pl-0"
                        >
                            <div className="md:flex items-center justify-between group">
                                {/* Timeline Line (Desktop) */}
                                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-stone-800 -translate-x-1/2 group-last:bg-gradient-to-b group-last:from-stone-800 group-last:to-transparent" />

                                {/* Left Side (Dates) */}
                                <div
                                    className={`md:w-5/12 mb-4 md:mb-0 ${index % 2 === 0 ? 'md:text-right md:pr-12' : 'md:order-2 md:pl-12'
                                        }`}
                                >
                                    <div className="text-amber-500 font-mono text-lg">{exp.period}</div>
                                    <div className="text-stone-500 font-light">{exp.org}</div>
                                </div>

                                {/* Center Dot */}
                                <div className="absolute left-0 md:left-1/2 w-8 h-8 rounded-full bg-card border border-amber-600/50 -translate-x-1/2 flex items-center justify-center z-10 group-hover:bg-amber-500/10 transition-colors">
                                    {exp.icon}
                                </div>

                                {/* Right Side (Content) */}
                                <div
                                    className={`md:w-5/12 ${index % 2 === 0 ? 'md:order-2 md:pl-12' : 'md:text-right md:pr-12'
                                        }`}
                                >
                                    <h4 className="text-xl text-white font-serif mb-3">{exp.title}</h4>
                                    <p className="text-stone-400 font-light leading-relaxed">{exp.details}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
