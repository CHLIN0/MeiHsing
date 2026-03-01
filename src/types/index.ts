import type { ReactNode } from 'react';

export interface Certification {
    icon: ReactNode;
    title: string;
    desc: string;
    year: string;
}

export interface Experience {
    title: string;
    org: string;
    period: string;
    icon: ReactNode;
    details: string;
}

export interface GalleryItem {
    src: string;
    alt: string;
    caption: string;
}
