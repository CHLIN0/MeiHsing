import { motion } from 'framer-motion';
import { fadeInUp, fadeInLeft, fadeInRight, staggerContainer, viewportOnce } from '../animations/variants';

interface TimelineItem {
    year: string;
    title: string;
    description: string;
    icon: string;
    highlights?: string[];
}

const timeline: TimelineItem[] = [
    {
        year: '1985',
        title: 'KAWAI 鋼琴演奏五級',
        description: '取得 KAWAI Performance Grade 5，正式開啟音樂教學生涯。',
        icon: '♩',
    },
    {
        year: '1986 – 2017',
        title: 'YAMAHA 功學社山葉樂器',
        description: '擔任音樂講師、講師召集人長達 31 年，兼任檢定監考官。退休時榮獲「功在樂教」紀念獎座。',
        icon: '♪',
        highlights: [
            '指導學生參加 Yamaha Music Festival 屢獲佳績',
            '多次獲頒「優秀講師表彰」',
            '指導學生參加 Junior Original Concert',
            '任教年資 30 年紀念',
        ],
    },
    {
        year: '1997 – 至今',
        title: '岡山長青學苑',
        description: '擔任民謠歌唱班教師、合唱團指導與鋼琴伴奏近三十年，持續深耕樂齡音樂教育。',
        icon: '♫',
    },
    {
        year: '1999',
        title: 'YAMAHA 指導級四級',
        description: '取得 YAMAHA Fundamentals Grade 4，具備完整的音樂教育指導能力。',
        icon: '𝄞',
    },
    {
        year: '2001 – 2022',
        title: '岡山圖書館合唱團指導老師',
        description: '帶領合唱團超過 20 年，指揮與鋼琴伴奏經驗豐富。',
        icon: '♬',
    },
    {
        year: '2011 – 2014',
        title: '路竹時代合唱團指導',
        description: '擴展合唱教學至路竹地區，指導社區合唱培育音樂愛好者。',
        icon: '♩',
    },
    {
        year: '2019 – 2023',
        title: '岡山里關懷據點音樂講師',
        description: '帶領音樂律動唱跳活動，以音樂關懷社區長者健康。',
        icon: '♫',
    },
    {
        year: '2023 – 至今',
        title: '純陽南忠區合唱團指導',
        description: '現任興毅南興南忠區合唱團指導老師，持續在合唱教育路上耕耘。',
        icon: '🎵',
    },
    {
        year: '現任',
        title: '岡山樂齡中心音樂輔療講師',
        description: '結合歌唱、節奏與肢體律動設計樂齡音樂活動，陪伴學員在互動與共學中維持身心活力。',
        icon: '♫',
    },
    {
        year: '現任',
        title: '義大醫院音樂志工',
        description: '參與院內音樂志工服務，透過鋼琴、空靈鼓與合奏，為病友與家屬帶來溫暖的音樂陪伴。',
        icon: '♪',
    },
];

export default function Experience() {
    return (
        <section id="experience" className="section-padding bg-ivory" aria-labelledby="experience-heading">
            <div className="max-w-4xl mx-auto px-6">
                {/* Section header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={viewportOnce}
                >
                    <p className="text-gold font-sans text-base tracking-[0.2em] uppercase mb-3">
                        Teaching Journey
                    </p>
                    <h2 id="experience-heading" className="font-serif text-heading text-piano">
                        教學歷程
                    </h2>
                </motion.div>

                {/* Timeline */}
                <div className="relative">
                    {/* Center line */}
                    <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold-light/40 via-gold-light/20 to-transparent md:-translate-x-px" aria-hidden="true" />

                    <motion.div
                        variants={staggerContainer(0.12)}
                        initial="hidden"
                        whileInView="visible"
                        viewport={viewportOnce}
                    >
                        {timeline.map((item, index) => {
                            const isLeft = index % 2 === 0;
                            return (
                                <motion.div
                                    key={`${item.year}-${item.title}`}
                                    variants={isLeft ? fadeInLeft : fadeInRight}
                                    className={`relative flex items-start mb-12 last:mb-0 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                                        }`}
                                >
                                    {/* Mobile layout */}
                                    <div className="md:hidden flex items-start gap-4 w-full pl-2">
                                        <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-ivory border-2 border-gold-light/40 flex items-center justify-center">
                                            <span className="text-gold text-lg" aria-hidden="true">{item.icon}</span>
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <span className="text-gold font-sans text-sm tracking-[0.1em] uppercase font-medium">
                                                {item.year}
                                            </span>
                                            <h3 className="font-serif text-2xl text-piano mt-1 mb-2">{item.title}</h3>
                                            <p className="text-warm-600 text-base leading-relaxed">{item.description}</p>
                                            {item.highlights && (
                                                <ul className="mt-3 space-y-1.5">
                                                    {item.highlights.map((h) => (
                                                        <li key={h} className="text-warm-500 text-sm flex items-start gap-2">
                                                            <span className="text-gold-light mt-0.5 flex-shrink-0" aria-hidden="true">✦</span>
                                                            {h}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>

                                    {/* Desktop layout: alternating */}
                                    <div className={`hidden md:flex items-start w-full ${isLeft ? '' : 'flex-row-reverse'}`}>
                                        <div className={`w-[calc(50%-2rem)] ${isLeft ? 'text-right pr-8' : 'text-left pl-8'}`}>
                                            <span className="text-gold font-sans text-sm tracking-[0.1em] uppercase font-medium">
                                                {item.year}
                                            </span>
                                            <h3 className="font-serif text-2xl text-piano mt-1 mb-2">{item.title}</h3>
                                            <p className="text-warm-600 text-base leading-relaxed">{item.description}</p>
                                            {item.highlights && (
                                                <ul className={`mt-3 space-y-1.5 ${isLeft ? 'text-right' : 'text-left'}`}>
                                                    {item.highlights.map((h) => (
                                                        <li key={h} className={`text-warm-500 text-sm flex items-start gap-2 ${isLeft ? 'justify-end' : ''}`}>
                                                            {isLeft && h}
                                                            <span className="text-gold-light mt-0.5 flex-shrink-0" aria-hidden="true">✦</span>
                                                            {!isLeft && h}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>

                                        <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-ivory border-2 border-gold-light/40 flex items-center justify-center mx-auto">
                                            <span className="text-gold text-lg" aria-hidden="true">{item.icon}</span>
                                        </div>

                                        <div className="w-[calc(50%-2rem)]" />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
