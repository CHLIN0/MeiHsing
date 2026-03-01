import { useState, useEffect } from 'react';

export default function Nav() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-500 ${isScrolled
                    ? 'bg-background/90 backdrop-blur-md py-3 shadow-lg shadow-black/50'
                    : 'bg-transparent py-6'
                }`}
        >
            <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
                <a href="/" className="flex items-center gap-3 group">
                    <img
                        src="/logo.png"
                        alt="ML Logo"
                        className="w-10 h-10 rounded-full object-cover border border-amber-500/30 group-hover:border-amber-500 transition-colors"
                    />
                    <span className="text-xl md:text-2xl font-serif text-amber-500 tracking-widest">
                        Lin Mei-Hsing
                    </span>
                </a>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-8 text-sm tracking-widest uppercase">
                    <a href="#about" className="hover:text-amber-500 transition-colors">
                        關於老師
                    </a>
                    <a href="#certifications" className="hover:text-amber-500 transition-colors">
                        專業資格
                    </a>
                    <a href="#experience" className="hover:text-amber-500 transition-colors">
                        教學生涯
                    </a>
                    <a href="#gallery" className="hover:text-amber-500 transition-colors">
                        音樂時光
                    </a>
                    <a
                        href="/links"
                        className="px-4 py-2 border border-amber-500/50 text-amber-500 rounded-sm hover:bg-amber-500/10 transition-colors"
                    >
                        聯繫我
                    </a>
                </div>

                {/* Mobile Hamburger */}
                <button
                    className="md:hidden text-stone-300 p-2"
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    aria-label="Toggle menu"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isMobileOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileOpen && (
                <div className="md:hidden bg-background/95 backdrop-blur-md border-t border-stone-800 mt-2">
                    <div className="flex flex-col px-6 py-4 space-y-4 text-sm tracking-widest uppercase">
                        <a href="#about" className="hover:text-amber-500 transition-colors" onClick={() => setIsMobileOpen(false)}>
                            關於老師
                        </a>
                        <a href="#certifications" className="hover:text-amber-500 transition-colors" onClick={() => setIsMobileOpen(false)}>
                            專業資格
                        </a>
                        <a href="#experience" className="hover:text-amber-500 transition-colors" onClick={() => setIsMobileOpen(false)}>
                            教學生涯
                        </a>
                        <a href="#gallery" className="hover:text-amber-500 transition-colors" onClick={() => setIsMobileOpen(false)}>
                            音樂時光
                        </a>
                        <a
                            href="/links"
                            className="text-amber-500 hover:text-amber-400 transition-colors"
                            onClick={() => setIsMobileOpen(false)}
                        >
                            聯繫我
                        </a>
                    </div>
                </div>
            )}
        </nav>
    );
}
