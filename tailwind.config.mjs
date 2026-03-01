/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            fontFamily: {
                serif: ['"Cormorant"', 'serif'],
                sans: ['"Montserrat"', '"Noto Sans TC"', 'sans-serif'],
                display: ['"Cormorant"', 'serif'],
            },
            colors: {
                ivory: '#FAF7F2',
                cream: '#F5F0E8',
                piano: '#2C1810',
                gold: {
                    DEFAULT: '#8B6914',
                    light: '#D4A853',
                    dark: '#5C4510',
                    muted: 'rgba(212, 168, 83, 0.2)',
                },
                warm: {
                    50: '#FAF7F2',
                    100: '#F5F0E8',
                    200: '#E8DFD0',
                    300: '#D4C5AD',
                    400: '#B8A68A',
                    500: '#9C8A6E',
                    600: '#6B5D4F',
                    700: '#3D2B1F',
                    800: '#2C1810',
                    900: '#1A0E08',
                },
            },
            spacing: {
                '18': '4.5rem',
                '22': '5.5rem',
                '30': '7.5rem',
                '34': '8.5rem',
            },
            fontSize: {
                'display': ['clamp(3.5rem, 8vw, 8rem)', { lineHeight: '1.1', fontWeight: '300' }],
                'heading': ['clamp(2.25rem, 5vw, 4rem)', { lineHeight: '1.2', fontWeight: '400' }],
                'subheading': ['clamp(1.5rem, 3vw, 2rem)', { lineHeight: '1.4', fontWeight: '500' }],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'fade-in': 'fadeIn 0.6s ease-out forwards',
                'slide-up': 'slideUp 0.6s ease-out forwards',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
        },
    },
    plugins: [],
};
