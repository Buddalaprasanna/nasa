
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#245C3A',       // Primary Dark Green
          light: '#8DBF74',      // Light Green Accent
          bg: '#F8F8F0',         // Soft Off-White / Natural Ivory Background
          card: '#FFFFFF',       // Clean White Card
          warning: '#F59E0B',    // Amber / Orange Warning
          danger: '#EF4444',     // Soft Red Indicator
          earth: '#8B5A2B',      // Earthy Brown Accent
          accent: '#E8F5E9'      // Soft Pale Green Tint
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Noto Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
