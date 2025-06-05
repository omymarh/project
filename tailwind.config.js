import defaultTheme from 'tailwindcss/defaultTheme'
import forms from '@tailwindcss/forms'
import daisyui from 'daisyui'
import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
    './storage/framework/views/*.php',
    './resources/views/**/*.blade.php',
    './resources/js/**/*.{js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', ...defaultTheme.fontFamily.sans],
      },
    },
  },

  plugins: [forms, daisyui, typography],

  daisyui: {
    themes: ['corporate', 'dark'], // Active les deux thèmes
    darkTheme: 'dark',             // Définit 'dark' comme thème sombre par défaut
  },
}
