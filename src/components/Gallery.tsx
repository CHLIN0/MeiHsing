import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInUp, staggerContainer, lightboxOverlay, lightboxContent, viewportOnce } from '../animations/variants';

type Category = 'all' | 'concert' | 'choir' | 'ensemble' | 'music-class' | 'volunteer';

interface GalleryTab {
    id: Category;
    label: string;
    count: number;
}

const categoryTabs: GalleryTab[] = [
    { id: 'concert', label: '音樂會', count: 16 },
    { id: 'choir', label: '合唱團', count: 13 },
    { id: 'ensemble', label: '合奏', count: 7 },
    { id: 'music-class', label: '音樂班', count: 2 },
    { id: 'volunteer', label: '志工', count: 2 },
];

function getCategoryImages(category: Exclude<Category, 'all'>): string[] {
    const tab = categoryTabs.find(t => t.id === category);
    if (!tab) return [];
    return Array.from({ length: tab.count }, (_, i) =>
        `/gallery/${category}/${category}-${String(i + 1).padStart(2, '0')}.jpeg`
    );
}

function getAllImages(): string[] {
    return categoryTabs.flatMap(tab =>
        getCategoryImages(tab.id as Exclude<Category, 'all'>)
    );
}

const totalCount = categoryTabs.reduce((sum, t) => sum + t.count, 0);

const tabs: GalleryTab[] = [
    { id: 'all', label: '全部', count: totalCount },
    ...categoryTabs,
];

export default function Gallery() {
    const [activeTab, setActiveTab] = useState<Category>('all');
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const images = useMemo(() =>
        activeTab === 'all' ? getAllImages() : getCategoryImages(activeTab as Exclude<Category, 'all'>),
        [activeTab]
    );

    const openLightbox = useCallback((index: number) => {
        setLightboxIndex(index);
        document.body.style.overflow = 'hidden';
    }, []);

    const closeLightbox = useCallback(() => {
        setLightboxIndex(null);
        document.body.style.overflow = '';
    }, []);

    const navigate = useCallback((direction: 1 | -1) => {
        if (lightboxIndex === null) return;
        const next = lightboxIndex + direction;
        if (next >= 0 && next < images.length) {
            setLightboxIndex(next);
        }
    }, [lightboxIndex, images.length]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigate(-1);
        if (e.key === 'ArrowRight') navigate(1);
    }, [closeLightbox, navigate]);

    return (
        <section id="gallery" className="section-padding bg-ivory" aria-labelledby="gallery-heading">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={viewportOnce}
                >
                    <p className="text-gold font-sans text-base tracking-[0.2em] uppercase mb-3">
                        Gallery
                    </p>
                    <h2 id="gallery-heading" className="font-serif text-heading text-piano">
                        教學花絮
                    </h2>
                </motion.div>

                {/* Tabs */}
                <div className="flex justify-center gap-2 mb-12 flex-wrap" role="tablist" aria-label="相簿分類">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 rounded-full text-base font-sans font-medium cursor-pointer touch-target transition-all duration-200 ${activeTab === tab.id
                                ? 'bg-gold text-white shadow-md shadow-gold/20'
                                : 'bg-warm-200/50 text-warm-600 hover:bg-warm-200'
                                }`}
                        >
                            {tab.label}
                            <span className="ml-1.5 text-xs opacity-70">({tab.count})</span>
                        </button>
                    ))}
                </div>

                {/* Photo Grid */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4"
                        variants={staggerContainer(0.05)}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    >
                        {images.map((src, i) => (
                            <motion.div
                                key={src}
                                variants={fadeInUp}
                                className="break-inside-avoid cursor-pointer group"
                                onClick={() => openLightbox(i)}
                            >
                                <div className="relative overflow-hidden rounded-xl">
                                    <img
                                        src={src}
                                        alt={`${tabs.find(t => t.id === activeTab)?.label || ''} 照片 ${i + 1}`}
                                        className="w-full h-auto block transition-transform duration-500 group-hover:scale-105"
                                        loading="lazy"
                                        width={400}
                                        height={300}
                                    />
                                    <div className="absolute inset-0 bg-piano/0 group-hover:bg-piano/10 transition-colors duration-300" />
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxIndex !== null && (
                    <motion.div
                        className="fixed inset-0 z-[100] flex items-center justify-center"
                        variants={lightboxOverlay}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={closeLightbox}
                        onKeyDown={handleKeyDown}
                        tabIndex={0}
                        role="dialog"
                        aria-modal="true"
                        aria-label="照片預覽"
                        style={{ overscrollBehavior: 'contain' }}
                    >
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-piano/90 backdrop-blur-sm" />

                        {/* Image */}
                        <motion.div
                            className="relative z-10 max-w-5xl max-h-[85vh] mx-4"
                            variants={lightboxContent}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={images[lightboxIndex]}
                                alt={`${tabs.find(t => t.id === activeTab)?.label || ''} 照片 ${lightboxIndex + 1}`}
                                className="max-w-full max-h-[85vh] object-contain rounded-lg"
                            />

                            {/* Counter */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm font-sans tabular-nums">
                                {lightboxIndex + 1} / {images.length}
                            </div>
                        </motion.div>

                        {/* Close button */}
                        <button
                            className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors duration-200"
                            onClick={closeLightbox}
                            aria-label="關閉預覽"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Navigation arrows */}
                        {lightboxIndex > 0 && (
                            <button
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors duration-200"
                                onClick={(e) => { e.stopPropagation(); navigate(-1); }}
                                aria-label="上一張"
                            >
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                            </button>
                        )}
                        {lightboxIndex < images.length - 1 && (
                            <button
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors duration-200"
                                onClick={(e) => { e.stopPropagation(); navigate(1); }}
                                aria-label="下一張"
                            >
                                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 18l6-6-6-6" />
                                </svg>
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
