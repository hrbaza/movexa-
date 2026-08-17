/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Dark cinematic palette (from SRS §10)
        // NB: named "night" not "base" — a `base` color key collides with
        // Tailwind's built-in `text-base` font-size utility and hijacks its color.
        night: '#080808',
        surface: '#111111',
        card: '#181818',
        elevated: '#1f1f1f',
        muted: '#9A9A9A',
        // Movexa brand accent — cinematic crimson→amber
        brand: {
          DEFAULT: '#E11D2A',
          light: '#ff3b4a',
          dark: '#b0121d',
          amber: '#F5A623',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Poppins"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 10px 30px -12px rgba(0,0,0,0.8)',
        glow: '0 0 40px -8px rgba(225,29,42,0.45)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
      },
    },
  },
  plugins: [],
};
