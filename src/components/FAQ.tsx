import { useState } from 'react';
import { motion } from 'framer-motion';
import { viewportOnce } from '../animations/variants';

const faqs = [
    {
        question: '幾歲可以開始學鋼琴？',
        answer: '一般建議 4 至 5 歲開始接觸音樂啟蒙課程，培養節奏感與音感基礎。正式鋼琴課則建議 5 歲以上開始。不過每個孩子的發展不同，歡迎預約試聽讓老師評估。',
    },
    {
        question: '沒有音樂基礎也可以學嗎？',
        answer: '當然可以！美杏老師擁有近四十年教學經驗，從零基礎啟蒙到進階演奏都有豐富的教學方法。無論是兒童、青少年或成人，都能找到適合的學習方式。',
    },
    {
        question: '樂齡學員也適合嗎？',
        answer: '非常適合！美杏老師長期推廣樂齡音樂教育，目前帶領岡山長青學苑合唱團、民謠班等課程。音樂學習沒有年齡限制，退休後學琴更能豐富生活、活化腦力。',
    },
    {
        question: '老師教哪些類型的音樂？',
        answer: '美杏老師的教學範圍包含古典鋼琴、爵士鋼琴、自彈自唱，以及基礎樂理教學和空靈鼓。此外也擔任合唱團指揮與伴奏，教學經驗涵蓋獨奏與合奏領域。',
    },
    {
        question: '如何預約試聽或聯繫老師？',
        answer: '您可以透過 Facebook、Instagram 或 LINE 直接聯繫美杏老師預約試聽。也歡迎透過本網站下方的聯繫方式與老師取得聯絡。',
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="faq" className="section-padding bg-cream" aria-labelledby="faq-heading">
            <div className="max-w-3xl mx-auto px-6">
                <motion.div
                    className="text-center mb-10"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={viewportOnce}
                >
                    <p className="text-gold font-sans text-base tracking-[0.2em] uppercase mb-3">
                        FAQ
                    </p>
                    <h2 id="faq-heading" className="font-serif text-heading text-piano">
                        常見問題
                    </h2>
                </motion.div>

                <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    viewport={viewportOnce}
                >
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="border border-warm-200 rounded-xl overflow-hidden bg-white/60 backdrop-blur-sm"
                        >
                            <button
                                onClick={() => toggle(index)}
                                className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer hover:bg-warm-50/50 transition-colors duration-200"
                                aria-expanded={openIndex === index}
                                aria-controls={`faq-answer-${index}`}
                            >
                                <span className="font-sans font-medium text-piano text-lg pr-4">
                                    {faq.question}
                                </span>
                                <svg
                                    className={`w-5 h-5 text-gold flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    aria-hidden="true"
                                >
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </button>
                            <div
                                id={`faq-answer-${index}`}
                                role="region"
                                aria-labelledby={`faq-question-${index}`}
                                className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                            >
                                <div className="px-6 pb-5 text-warm-600 text-base leading-relaxed">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* FAQPage JSON-LD structured data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: faqs.map((faq) => ({
                            '@type': 'Question',
                            name: faq.question,
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: faq.answer,
                            },
                        })),
                    }),
                }}
            />
        </section>
    );
}
