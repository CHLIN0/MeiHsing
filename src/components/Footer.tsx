import { Heart, Users, Mail } from 'lucide-react';

interface SocialLink {
    href: string;
    label: string;
    icon: React.ReactNode;
}

const socialLinks: SocialLink[] = [
    {
        href: 'https://www.facebook.com/piano.lin.3',
        label: 'Facebook',
        icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.5 9.5V7.8c0-.8.2-1.3 1.4-1.3H16V4.1c-.6-.1-1.3-.1-1.9-.1-1.9 0-3.1 1.1-3.1 3.2v2.3H9v2.6h2v7.5h2.5v-7.5H16l.3-2.6h-2.8z" />
            </svg>
        ),
    },
    {
        href: 'https://www.instagram.com/meishing888/',
        label: 'Instagram',
        icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.8 3H7.2A4.2 4.2 0 003 7.2v9.6A4.2 4.2 0 007.2 21h9.6a4.2 4.2 0 004.2-4.2V7.2A4.2 4.2 0 0016.8 3zm1.7 14.8a1.7 1.7 0 01-1.7 1.7H7.2a1.7 1.7 0 01-1.7-1.7V7.2A1.7 1.7 0 017.2 5.5h9.6a1.7 1.7 0 011.7 1.7v9.6z" />
                <path d="M12 8.2A3.8 3.8 0 108 12a3.8 3.8 0 004-3.8zm0 6.2A2.4 2.4 0 119.6 12 2.4 2.4 0 0112 14.4z" />
                <circle cx="16.7" cy="7.3" r=".9" />
            </svg>
        ),
    },
    {
        href: 'https://www.youtube.com/@%E6%9E%97%E7%BE%8E%E6%9D%8F-w2d',
        label: 'YouTube',
        icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.6 7.2a2 2 0 00-1.4-1.4C18.4 5.3 12 5.3 12 5.3s-6.4 0-8.2.5A2 2 0 002.4 7.2 21.3 21.3 0 002 12a21.3 21.3 0 00.4 4.8 2 2 0 001.4 1.4c1.8.5 8.2.5 8.2.5s6.4 0 8.2-.5a2 2 0 001.4-1.4A21.3 21.3 0 0022 12a21.3 21.3 0 00-.4-4.8zM10.5 14.7V9.3l4.7 2.7-4.7 2.7z" />
            </svg>
        ),
    },
];

export default function Footer() {
    return (
        <footer className="bg-[#050505] py-12 border-t border-stone-900">
            <div className="max-w-6xl mx-auto px-6">
                {/* 主要內容 */}
                <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-8">
                    <div>
                        <h2 className="text-2xl font-serif text-white tracking-widest mb-2">林 美 杏</h2>
                        <p className="text-stone-500 text-sm tracking-wider">
                            Lin Mei-Hsing | Pianist &amp; Music Educator
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        {/* 社群連結 */}
                        <div className="flex items-center gap-3">
                            {socialLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 rounded-full border border-stone-700 flex items-center justify-center text-stone-400 hover:text-amber-500 hover:border-amber-500/50 transition-colors"
                                    aria-label={link.label}
                                >
                                    {link.icon}
                                </a>
                            ))}
                        </div>

                        <div className="hidden sm:block w-px h-6 bg-stone-800" />

                        {/* 功能連結 */}
                        <div className="flex items-center gap-4 text-stone-500 text-sm">
                            <a
                                href="mailto:ms@linho.me"
                                className="flex items-center gap-2 hover:text-amber-500 transition-colors"
                            >
                                <Mail size={14} /> <span>ms@linho.me</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* 底部服務標籤 */}
                <div className="mt-8 pt-6 border-t border-stone-900/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex gap-6 text-stone-600 text-sm">
                        <span className="flex items-center gap-1.5">
                            <Heart size={12} /> 音樂志工服務
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Users size={12} /> 樂齡教育推廣
                        </span>
                    </div>
                    <p className="text-stone-700 text-xs">
                        © {new Date().getFullYear()} 林美杏音樂工作室. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
