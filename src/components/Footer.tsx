export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-piano border-t border-white/5 text-warm-300 pt-16 pb-8" role="contentinfo">
            <div className="max-w-5xl mx-auto px-6">

                {/* Main Footer Content */}
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10 md:gap-6 mb-12 text-center md:text-left">

                    {/* Brand Section */}
                    <div className="flex flex-col items-center md:items-start gap-4 max-w-sm">
                        <div className="flex items-center gap-3">
                            <img
                                src="/logo.webp"
                                alt=""
                                width={40}
                                height={40}
                                className="rounded-full shadow-lg opacity-90"
                                loading="lazy"
                            />
                            <span className="font-serif text-2xl text-cream tracking-wide">林美杏音樂教室</span>
                        </div>
                        <p className="text-warm-400/80 text-sm leading-relaxed">
                            從兒童啟蒙、進階演奏到樂齡學習，依照每位學生的步調安排課程，陪伴他們聽見音樂，也更認識自己。
                        </p>
                    </div>

                    {/* Connect Section */}
                    <div className="flex flex-col items-center md:items-start gap-5">
                        <h3 className="font-serif text-cream/90 text-sm tracking-[0.2em] uppercase">Connect</h3>
                        <div className="flex items-center gap-3">
                            {/* Facebook */}
                            <a
                                href="https://www.facebook.com/piano.lin.3"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white/5 border border-white/5 hover:bg-gold-light/10 hover:border-gold-light/30 flex items-center justify-center text-warm-400 hover:text-gold-light transition-all duration-300 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(234,179,8,0.15)] group"
                                aria-label="Facebook"
                            >
                                <svg viewBox="0 0 24 24" className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="currentColor">
                                    <path d="M13.5 9.5V7.8c0-.8.2-1.3 1.4-1.3H16V4.1c-.6-.1-1.3-.1-1.9-.1-1.9 0-3.1 1.1-3.1 3.2v2.3H9v2.6h2v7.5h2.5v-7.5H16l.3-2.6h-2.8z" />
                                </svg>
                            </a>
                            {/* Instagram */}
                            <a
                                href="https://www.instagram.com/meishing888/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white/5 border border-white/5 hover:bg-gold-light/10 hover:border-gold-light/30 flex items-center justify-center text-warm-400 hover:text-gold-light transition-all duration-300 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(234,179,8,0.15)] group"
                                aria-label="Instagram"
                            >
                                <svg viewBox="0 0 24 24" className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="currentColor">
                                    <path d="M16.8 3H7.2A4.2 4.2 0 003 7.2v9.6A4.2 4.2 0 007.2 21h9.6a4.2 4.2 0 004.2-4.2V7.2A4.2 4.2 0 0016.8 3zm2.7 14.8a2.7 2.7 0 01-2.7 2.7H7.2a2.7 2.7 0 01-2.7-2.7V7.2a2.7 2.7 0 012.7-2.7h9.6a2.7 2.7 0 012.7 2.7v9.6z" />
                                    <path d="M12 8.2A3.8 3.8 0 1015.8 12 3.8 3.8 0 0012 8.2zm0 6.3A2.5 2.5 0 1114.5 12 2.5 2.5 0 0112 14.5z" />
                                    <circle cx="16.2" cy="7.8" r=".8" />
                                </svg>
                            </a>
                            {/* YouTube */}
                            <a
                                href="https://www.youtube.com/@%E6%9E%97%E7%BE%8E%E6%9D%8F-w2d"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-white/5 border border-white/5 hover:bg-gold-light/10 hover:border-gold-light/30 flex items-center justify-center text-warm-400 hover:text-gold-light transition-all duration-300 cursor-pointer shadow-sm hover:shadow-[0_0_15px_rgba(234,179,8,0.15)] group"
                                aria-label="YouTube"
                            >
                                <svg viewBox="0 0 24 24" className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="currentColor">
                                    <path d="M21.6 7.2a2 2 0 00-1.4-1.4C18.4 5.3 12 5.3 12 5.3s-6.4 0-8.2.5A2 2 0 002.4 7.2 21.3 21.3 0 002 12a21.3 21.3 0 00.4 4.8 2 2 0 001.4 1.4c1.8.5 8.2.5 8.2.5s6.4 0 8.2-.5a2 2 0 001.4-1.4A21.3 21.3 0 0022 12a21.3 21.3 0 00-.4-4.8zM10.5 14.7V9.3l4.7 2.7-4.7 2.7z" />
                                </svg>
                            </a>
                        </div>
                        <a
                            href="/links"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/8 hover:bg-gold-light/10 hover:border-gold-light/30 text-warm-400 hover:text-gold-light text-xs tracking-wider font-medium transition-all duration-300 cursor-pointer group mt-1"
                        >
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0-12.814a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0 12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                            </svg>
                            所有連結
                            <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" aria-hidden="true" />

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 font-sans">

                    {/* Copyright */}
                    <p className="text-sm text-warm-500/80 tracking-wide order-2 md:order-1">
                        &copy; {currentYear} 林美杏音樂教室. All rights reserved.
                    </p>

                    {/* Back to top */}
                    <a
                        href="#"
                        className="flex items-center gap-2 group text-warm-500/80 hover:text-gold-light transition-colors duration-300 order-1 md:order-2"
                        aria-label="回到頁面頂部"
                    >
                        <span className="text-xs uppercase tracking-[0.15em]">Back to top</span>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gold-light/10 transition-colors duration-300">
                            <svg className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                <path d="M18 15l-6-6-6 6" />
                            </svg>
                        </div>
                    </a>

                    {/* Credits */}
                    <p className="text-sm text-warm-500/80 tracking-wide flex items-center gap-1.5 order-3 md:order-3">
                        Website by
                        <a
                            href="https://brlin.org"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-warm-400 hover:text-gold-light font-medium transition-colors duration-300 hover:underline underline-offset-4 decoration-gold-light/30"
                        >
                            BRlin
                        </a>
                    </p>

                </div>
            </div>
        </footer>
    );
}
