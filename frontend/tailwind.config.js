/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,vue}', './node_modules/flowbite/**/*.js'],
  theme: {
    extend: {
      colors: {
        primary: '#1317F7',
        secondary: '#2B3FC4',
        tertiary: '#3C3744'
      }
    }
  },
  plugins: [
    require('flowbite/plugin')
  ]
}
