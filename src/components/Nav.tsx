import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OfficialLinksPopover from './OfficialLinksPopover';

const navLinks = [
    { href: '#about', label: '關於' },
    { href: '#experience', label: '經歷' },
    { href: '#gallery', label: '相簿' },
    { href: '#contact', label: '聯繫' },
];

export default function Nav() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-white/85 backdrop-blur-md shadow-sm border-b border-gold-muted'
                : 'bg-transparent'
                }`}
        >
            <nav className="max-w-6xl mx-auto px-6 flex items-center justify-between h-18" aria-label="主導航">
                {/* Logo + Name */}
                <a href="/" className="flex items-center gap-3 group cursor-pointer">
                    <img
                        src="/logo.webp"
                        alt="林美杏老師 Logo"
                        width={40}
                        height={40}
                        className="rounded-full"
                    />
                    <div className="flex flex-col leading-tight">
                        <span className={`font-serif text-lg font-medium tracking-wide transition-colors duration-300 ${scrolled ? 'text-piano' : 'text-cream'}`}>
                            林美杏音樂教室
                        </span>
                        <span className={`text-[0.65rem] font-sans tracking-[0.15em] uppercase transition-colors duration-300 ${scrolled ? 'text-warm-500' : 'text-warm-300'}`}>
                            Piano · Music
                        </span>
                    </div>
                </a>

                {/* Desktop Nav */}
                <ul className="hidden md:flex items-center gap-8">
                    {navLinks.map(({ href, label }) => (
                        <li key={href}>
                            <a
                                href={href}
                                className={`text-sm font-sans font-medium transition-colors duration-200 cursor-pointer ${scrolled ? 'text-warm-600 hover:text-gold' : 'text-warm-100 hover:text-gold-light'}`}
                            >
                                {label}
                            </a>
                        </li>
                    ))}
                    <li className={scrolled ? 'text-warm-600 hover:text-gold' : 'text-warm-100 hover:text-gold-light'}>
                        <OfficialLinksPopover
                            fallbackUrl="https://ms.linho.me/"
                            pageName="林美杏老師官方網站"
                        />
                    </li>
                    <li>
                        <a href="#contact" className="btn-cta text-sm py-2 px-5 cursor-pointer">
                            預約試聽
                        </a>
                    </li>
                </ul>

                {/* Mobile Hamburger */}
                <button
                    className="md:hidden flex flex-col gap-1.5 p-2 cursor-pointer touch-target"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label={mobileOpen ? '關閉選單' : '開啟選單'}
                    aria-expanded={mobileOpen}
                >
                    <motion.span
                        className={`block w-6 h-[2px] origin-center transition-colors duration-300 ${scrolled ? 'bg-piano' : 'bg-cream'}`}
                        animate={mobileOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                        transition={{ duration: 0.2 }}
                    />
                    <motion.span
                        className={`block w-6 h-[2px] transition-colors duration-300 ${scrolled ? 'bg-piano' : 'bg-cream'}`}
                        animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                        transition={{ duration: 0.15 }}
                    />
                    <motion.span
                        className={`block w-6 h-[2px] origin-center transition-colors duration-300 ${scrolled ? 'bg-piano' : 'bg-cream'}`}
                        animate={mobileOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
                        transition={{ duration: 0.2 }}
                    />
                </button>
            </nav>

            {/* Mobile Slide-out */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            style={{ overscrollBehavior: 'contain' }}
                        />
                        <motion.div
                            className="fixed top-0 right-0 h-full w-72 bg-ivory z-50 shadow-2xl flex flex-col pt-24 px-8"
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            style={{ overscrollBehavior: 'contain' }}
                        >
                            {navLinks.map(({ href, label }, i) => (
                                <motion.a
                                    key={href}
                                    href={href}
                                    onClick={() => setMobileOpen(false)}
                                    className="py-4 text-lg font-serif text-piano border-b border-gold-muted cursor-pointer"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 + 0.1 }}
                                >
                                    {label}
                                </motion.a>
                            ))}
                            <div className="py-3 text-piano border-b border-gold-muted flex items-center justify-between gap-3">
                                <span className="font-serif text-lg text-piano">官方連結</span>
                                <OfficialLinksPopover
                                    fallbackUrl="https://ms.linho.me/"
                                    pageName="林美杏老師官方網站"
                                />
                            </div>
                            <a
                                href="#contact"
                                onClick={() => setMobileOpen(false)}
                                className="btn-cta mt-8 justify-center cursor-pointer"
                            >
                                預約試聽
                            </a>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
}
