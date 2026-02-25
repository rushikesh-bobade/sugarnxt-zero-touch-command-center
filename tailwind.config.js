/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0f172a',
        'bg-panel': '#1e293b',
        'bg-panel-light': '#263548',
        'accent-blue': '#22d3ee',
        'accent-green': '#10b981',
        'accent-red': '#ef4444',
        'accent-amber': '#f59e0b',
        'text-primary': '#f1f5f9',
        'text-secondary': '#94a3b8',
        'border-subtle': '#334155',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'counter': 'counter 0.3s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(34,211,238,0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(34,211,238,0.8), 0 0 40px rgba(34,211,238,0.3)' },
        },
      },
      boxShadow: {
        'neon-blue': '0 0 10px rgba(34,211,238,0.5), 0 0 20px rgba(34,211,238,0.2)',
        'neon-green': '0 0 10px rgba(16,185,129,0.5), 0 0 20px rgba(16,185,129,0.2)',
        'neon-red': '0 0 10px rgba(239,68,68,0.5), 0 0 20px rgba(239,68,68,0.2)',
        'neon-amber': '0 0 10px rgba(245,158,11,0.5), 0 0 20px rgba(245,158,11,0.2)',
        'panel': '0 4px 24px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
};
