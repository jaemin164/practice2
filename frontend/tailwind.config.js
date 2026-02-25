/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        karrot: {
          orange: '#FF6F0F',
          light: '#FFF5EC',
        },
      },
    },
  },
  plugins: [],
};
