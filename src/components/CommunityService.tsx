import { motion } from 'framer-motion';
import { fadeInLeft, fadeInRight, viewportOnce } from '../animations/variants';

const serviceItems = [
    {
        eyebrow: 'Music Volunteer',
        title: '義大醫院音樂志工',
        description: '以鋼琴、空靈鼓與合奏參與院內志工服務，為病友與家屬帶來溫柔的音樂陪伴。',
        images: [
            {
                src: '/gallery/volunteer/hospital-music-volunteer-2026-08.webp',
                alt: '林美杏老師與音樂志工夥伴在義大醫院合影，現場有鋼琴、空靈鼓與吉他',
            },
        ],
    },
    {
        eyebrow: 'Senior Music Care',
        title: '岡山樂齡中心音樂輔療講師',
        description: '結合歌唱、節奏與肢體律動設計樂齡音樂活動，陪伴學員在互動與共學中維持身心活力。',
        images: [
            {
                src: '/gallery/music-class/okayama-senior-music-therapy-2026-08-a.webp',
                alt: '林美杏老師帶領學員進行團體音樂律動活動',
            },
            {
                src: '/gallery/music-class/okayama-senior-music-therapy-2026-08-b.webp',
                alt: '學員跟隨林美杏老師以拍手與歌唱參與團體音樂活動',
            },
        ],
    },
];

export default function CommunityService() {
    return (
        <section id="service" className="bg-ivory section-padding" aria-labelledby="service-heading">
            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    className="max-w-3xl mb-10 md:mb-14"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={viewportOnce}
                >
                    <p className="text-gold font-sans text-base tracking-[0.2em] uppercase mb-3">
                        Music in the Community
                    </p>
                    <h2 id="service-heading" className="font-serif text-heading text-piano mb-5">
                        讓音樂走進更多人的生活
                    </h2>
                    <p className="text-warm-600 text-lg leading-relaxed">
                        從教室、合唱團到醫院志工與樂齡課程，美杏老師以音樂陪伴不同世代，
                        讓學習不只停留在技巧，也成為交流、照顧與分享的力量。
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-7 lg:gap-8">
                    {serviceItems.map((item, index) => (
                        <motion.article
                            key={item.title}
                            variants={index === 0 ? fadeInLeft : fadeInRight}
                            initial="hidden"
                            whileInView="visible"
                            viewport={viewportOnce}
                            className="glass-card overflow-hidden group"
                        >
                            <div className={`grid h-72 sm:h-80 ${item.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                {item.images.map((image) => (
                                    <div key={image.src} className="relative overflow-hidden">
                                        <img
                                            src={image.src}
                                            alt={image.alt}
                                            width={item.images.length > 1 ? 496 : 992}
                                            height={item.images.length > 1 ? 640 : 744}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-piano/20 via-transparent to-transparent" aria-hidden="true" />
                                    </div>
                                ))}
                            </div>

                            <div className="p-7 sm:p-8">
                                <p className="text-gold text-xs font-sans tracking-[0.18em] uppercase mb-2">
                                    {item.eyebrow}
                                </p>
                                <h3 className="font-serif text-2xl sm:text-3xl text-piano mb-3">
                                    {item.title}
                                </h3>
                                <p className="text-warm-600 text-base leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </motion.article>
                    ))}
                </div>
            </div>
        </section>
    );
}
