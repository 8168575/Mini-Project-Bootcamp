/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        planner: '0 24px 60px rgba(102, 84, 60, 0.12)',
      },
    },
  },
  plugins: [],
};
