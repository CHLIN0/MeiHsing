import { motion } from 'framer-motion';
import { fadeInUp } from '../animations/variants';
import type { GalleryItem } from '../types';

const galleryItems: GalleryItem[] = [
    // 音樂會
    {
        src: '/音樂會/6FEE3079-2968-4748-B573-68BCAEF1610F_1_105_c.jpeg',
        alt: '師生音樂會舞台表演',
        caption: '師生音樂會',
    },
    // 合唱團
    {
        src: '/合唱團/C908D620-88CD-40FA-917B-673B52014D53_1_105_c.jpeg',
        alt: '合唱團指導排練',
        caption: '合唱團指導',
    },
    // 合奏
    {
        src: '/合奏/BFA493A0-A8E3-44E0-B2EC-E3F5EA1AF60B_1_105_c.jpeg',
        alt: '學生合奏表演',
        caption: '合奏比賽',
    },
    // 音樂會
    {
        src: '/音樂會/7A469A0B-46F3-41F2-B25C-1875311A4451_1_105_c.jpeg',
        alt: '音樂會演出照',
        caption: '鋼琴演奏',
    },
    // 志工
    {
        src: '/志工/D4A1A001-3ED7-4B94-A170-D6E39BC5A81A_1_105_c.jpeg',
        alt: '義大醫院音樂志工服務',
        caption: '音樂志工',
    },
    // 音樂教室
    {
        src: '/音樂會/9F2BAB6C-6CEE-46D0-AA7C-6D54C14BAB24_1_105_c.jpeg',
        alt: '音樂會合影',
        caption: '音樂會合影',
    },
];

export default function Gallery() {
    return (
        <section id="gallery" className="py-24 bg-background">
            <div className="max-w-6xl mx-auto px-6">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="flex items-center space-x-4 mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-serif text-white">音樂時光</h2>
                    <div className="h-px bg-amber-500/30 flex-grow" />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {galleryItems.map((item, index) => (
                        <motion.div
                            key={index}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeInUp}
                            className="group relative aspect-square overflow-hidden rounded-sm"
                        >
                            <img
                                src={item.src}
                                alt={item.alt}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <span className="text-white font-serif">{item.caption}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
