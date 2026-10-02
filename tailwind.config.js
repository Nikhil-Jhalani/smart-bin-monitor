/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        municipal: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#16a34a',
          600: '#15803d',
          700: '#166534',
          800: '#14532d',
          900: '#052e16',
        },
        status: {
          normal: '#22c55e',      // Green = Normal (<60%)
          partial: '#eab308',     // Yellow = Partially Full (60-79%)
          warning: '#f97316',     // Orange = Cleaning Overdue / Recommended (80-89%)
          urgent: '#ef4444',      // Red = Full / Urgent (>=90%)
        }
      }
    },
  },
  plugins: [],
}
