import type { Variants, Transition } from 'framer-motion';

// ===== Transition Presets =====
const smoothOut: Transition = { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] };
const gentleSpring: Transition = { type: 'spring', stiffness: 100, damping: 20 };

// ===== Entrance Animations =====
export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: smoothOut },
};

export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: smoothOut },
};

export const fadeInDown: Variants = {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0, transition: smoothOut },
};

export const fadeInLeft: Variants = {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0, transition: smoothOut },
};

export const fadeInRight: Variants = {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0, transition: smoothOut },
};

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: smoothOut },
};

// ===== Container Stagger =====
export const staggerContainer = (staggerDelay = 0.1): Variants => ({
    hidden: {},
    visible: {
        transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
        },
    },
});

// ===== Text Reveal =====
export const textReveal: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: 'easeOut' },
    },
};

// ===== Card Animations =====
export const cardHover = {
    rest: { scale: 1, y: 0 },
    hover: { scale: 1.02, y: -4, transition: { duration: 0.25, ease: 'easeOut' } },
};

export const cardFlip: Variants = {
    front: { rotateY: 0, transition: { duration: 0.5 } },
    back: { rotateY: 180, transition: { duration: 0.5 } },
};

// ===== Gallery / Lightbox =====
export const lightboxOverlay: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const lightboxContent: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: gentleSpring },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

// ===== Section Transitions =====
export const sectionFade: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
    },
};

// ===== Viewport trigger defaults =====
export const viewportOnce = { once: true, margin: '-80px' };
