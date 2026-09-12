/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        aerospace: {
          950: '#030712',
          900: '#060b18',
          850: '#091226',
          800: '#0e1c38',
          700: '#16284f',
          600: '#1f386e',
          500: '#2b4d96',
        },
        hud: {
          cyan: '#00f0ff',
          emerald: '#00ff88',
          amber: '#ffb703',
          crimson: '#ff0055',
          blue: '#2563eb',
          purple: '#8b5cf6',
          teal: '#14b8a6',
          silver: '#94a3b8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['Orbitron', 'sans-serif'],
      },
      backgroundImage: {
        'radar-grid': 'radial-gradient(circle, rgba(0, 240, 255, 0.08) 1px, transparent 1px)',
        'cockpit-glass': 'linear-gradient(135deg, rgba(14, 28, 56, 0.75) 0%, rgba(6, 11, 24, 0.85) 100%)',
      },
      boxShadow: {
        'hud-glow': '0 0 15px rgba(0, 240, 255, 0.25)',
        'hud-glow-green': '0 0 15px rgba(0, 255, 136, 0.25)',
        'hud-glow-red': '0 0 15px rgba(255, 0, 85, 0.35)',
        'hud-glow-amber': '0 0 15px rgba(255, 183, 3, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radarSweep 4s linear infinite',
        'telemetry-glow': 'telemetryGlow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        telemetryGlow: {
          '0%': { opacity: '0.8', filter: 'drop-shadow(0 0 2px rgba(0, 240, 255, 0.4))' },
          '100%': { opacity: '1', filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.8))' },
        }
      }
    },
  },
  plugins: [],
}
