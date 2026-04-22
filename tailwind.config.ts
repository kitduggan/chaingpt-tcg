import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f',
        'cyan-neon': '#00f5ff',
        'magenta-neon': '#ff00ff',
        'green-neon': '#00ff85',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        ui: ['Inter', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '0% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        glow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        scanline: {
          '0%': { top: '-4px' },
          '100%': { top: '100vh' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        glow: 'glow 2s ease-in-out infinite',
        scanline: 'scanline 8s linear infinite',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
