export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-piano text-warm-300 py-12" role="contentinfo">
            <div className="max-w-5xl mx-auto px-6">
                {/* Top ornamental line */}
                <div className="h-px bg-gradient-to-r from-transparent via-gold-light/30 to-transparent mb-10" aria-hidden="true" />

                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Logo + name */}
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo.png"
                            alt=""
                            width={32}
                            height={32}
                            className="rounded-full opacity-80"
                            loading="lazy"
                        />
                        <span className="font-serif text-xl text-cream">林美杏老師</span>
                    </div>

                    {/* Social icons */}
                    <div className="flex items-center gap-4">
                        <a
                            href="https://www.facebook.com/piano.lin.3"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-warm-400 hover:text-gold-light transition-colors duration-200 cursor-pointer"
                            aria-label="Facebook"
                        >
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                                <path d="M13.5 9.5V7.8c0-.8.2-1.3 1.4-1.3H16V4.1c-.6-.1-1.3-.1-1.9-.1-1.9 0-3.1 1.1-3.1 3.2v2.3H9v2.6h2v7.5h2.5v-7.5H16l.3-2.6h-2.8z" />
                            </svg>
                        </a>
                        <a
                            href="https://www.instagram.com/meishing888/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-warm-400 hover:text-gold-light transition-colors duration-200 cursor-pointer"
                            aria-label="Instagram"
                        >
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                                <path d="M16.8 3H7.2A4.2 4.2 0 003 7.2v9.6A4.2 4.2 0 007.2 21h9.6a4.2 4.2 0 004.2-4.2V7.2A4.2 4.2 0 0016.8 3zm2.7 14.8a2.7 2.7 0 01-2.7 2.7H7.2a2.7 2.7 0 01-2.7-2.7V7.2a2.7 2.7 0 012.7-2.7h9.6a2.7 2.7 0 012.7 2.7v9.6z" />
                                <path d="M12 8.2A3.8 3.8 0 1015.8 12 3.8 3.8 0 0012 8.2zm0 6.3A2.5 2.5 0 1114.5 12 2.5 2.5 0 0112 14.5z" />
                                <circle cx="16.2" cy="7.8" r=".8" />
                            </svg>
                        </a>
                        <a
                            href="https://www.youtube.com/@%E6%9E%97%E7%BE%8E%E6%9D%8F-w2d"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-warm-400 hover:text-gold-light transition-colors duration-200 cursor-pointer"
                            aria-label="YouTube"
                        >
                            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                                <path d="M21.6 7.2a2 2 0 00-1.4-1.4C18.4 5.3 12 5.3 12 5.3s-6.4 0-8.2.5A2 2 0 002.4 7.2 21.3 21.3 0 002 12a21.3 21.3 0 00.4 4.8 2 2 0 001.4 1.4c1.8.5 8.2.5 8.2.5s6.4 0 8.2-.5a2 2 0 001.4-1.4A21.3 21.3 0 0022 12a21.3 21.3 0 00-.4-4.8zM10.5 14.7V9.3l4.7 2.7-4.7 2.7z" />
                            </svg>
                        </a>
                    </div>

                    {/* Copyright */}
                    <p className="text-base text-warm-500 font-sans">
                        © {currentYear} 林美杏老師。
                    </p>
                </div>

                {/* Back to top */}
                <div className="text-center mt-8">
                    <a
                        href="#"
                        className="inline-flex items-center gap-1.5 text-sm text-warm-500 hover:text-gold-light transition-colors duration-200 cursor-pointer font-sans"
                        aria-label="回到頁面頂部"
                    >
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M18 15l-6-6-6 6" />
                        </svg>
                        回到頂部
                    </a>
                </div>
            </div>
        </footer>
    );
}
