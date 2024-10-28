/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: '#1317F7',
        secondary: '#2B3FC4',
        tertiary: '#3C3744'
      },
    }
  },
  plugins: [],
}
