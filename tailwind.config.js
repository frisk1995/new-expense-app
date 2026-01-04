/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5',      // インディゴブルー
        'primary-focus': '#4338ca',
        'primary-content': '#ffffff',
        secondary: '#f3f4f6',     // ライトグレー
        'secondary-focus': '#e5e7eb',
        'secondary-content': '#1f2937',
      }
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [{
      light: {
        primary: '#4f46e5',
        'primary-focus': '#4338ca',
        'primary-content': '#ffffff',
        secondary: '#f3f4f6',
        'secondary-focus': '#e5e7eb',
        'secondary-content': '#1f2937',
        'base-100': '#ffffff',
        'base-200': '#f9fafb',
        'base-300': '#f3f4f6',
        'neutral': '#1f2937',
        'neutral-content': '#ffffff',
      }
    }],
    defaultTheme: "light",
  },
}
