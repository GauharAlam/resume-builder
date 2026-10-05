/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // Templates build the font class from saved data (`font-${fontFamily}`),
  // so these utilities never appear literally in the source.
  safelist: ['font-sans', 'font-serif', 'font-mono'],
  theme: { extend: {} },
  plugins: [],
};
