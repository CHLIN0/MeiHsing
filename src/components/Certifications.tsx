import { motion } from 'framer-motion';
import { Award, Piano, BookOpen } from 'lucide-react';
import { fadeInUp } from '../animations/variants';
import type { Certification } from '../types';

const certifications: Certification[] = [
    {
        icon: <Award className="w-8 h-8 text-amber-500 mb-4" />,
        title: 'YAMAHA 音樂檢定',
        desc: '具備鋼琴五級、電子琴五級，以及指導級四級資格。曾長期擔任檢定監考官。',
        year: '1987 - 1999',
    },
    {
        icon: <Piano className="w-8 h-8 text-amber-500 mb-4" />,
        title: 'KAWAI 音樂能力檢定',
        desc: '取得 KAWAI 演奏等級五級 (Performance Grade 5) 專業資格。',
        year: '1985',
    },
    {
        icon: <BookOpen className="w-8 h-8 text-amber-500 mb-4" />,
        title: '樂齡教育專業',
        desc: '具備高雄市政府教育局核發之「樂齡學習專業人員（一般課程講師）」培訓證明。',
        year: 'Professional',
    },
];

export default function Certifications() {
    return (
        <section id="certifications" className="py-24 bg-surface relative border-y border-stone-900">
            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="text-center mb-16"
                >
                    <h3 className="text-amber-500 font-serif tracking-widest text-lg mb-2">QUALIFICATIONS</h3>
                    <h2 className="text-3xl md:text-4xl font-serif text-white">專業認證與資格</h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {certifications.map((item, index) => (
                        <motion.div
                            key={index}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                            className="bg-card p-10 rounded-sm border border-stone-800 hover:border-amber-900/50 transition-colors group"
                        >
                            {item.icon}
                            <div className="text-xs text-stone-500 mb-2 font-mono">{item.year}</div>
                            <h4 className="text-xl text-white font-serif mb-4 group-hover:text-amber-400 transition-colors">
                                {item.title}
                            </h4>
                            <p className="text-stone-400 font-light leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
