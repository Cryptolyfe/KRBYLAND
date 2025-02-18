// tailwind.config.js

// Use standard imports (ESM or CommonJS). 
// If you want an ESM style with `export default`, that's fine, 
// but remove the `type` keyword.

import { fontFamily } from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        retro: ["'Press Start 2P'", ...fontFamily.sans],
        modern: ["'Poppins'", ...fontFamily.sans],
      },
      colors: {
        neonBlue: '#00FFFF',
        retroPink: '#FF00FF',
        darkBg: '#1E1E1E',
        lightBg: '#F5F5F5',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    // require('@tailwindcss/aspect-ratio'), // comment out or remove if you don't need it
  ],
}

export default config
