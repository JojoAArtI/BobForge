/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ff5a36',
          50: '#fff0eb',
          100: '#ffd8cc',
          200: '#ffbeac',
          300: '#ffa184',
          400: '#ff845b',
          500: '#ff5a36',
          600: '#eb4722',
          700: '#c83b1b',
          800: '#9e2f16',
          900: '#742210',
        },
        secondary: {
          DEFAULT: '#393939',
          50: '#f5f5f5',
          100: '#e0e0e0',
          200: '#c6c6c6',
          300: '#a8a8a8',
          400: '#8d8d8d',
          500: '#6f6f6f',
          600: '#525252',
          700: '#393939',
          800: '#262626',
          900: '#161616',
        },
        success: '#24a148',
        warning: '#f1c21b',
        danger: '#da1e28',
        info: '#0043ce',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

// Made with Bob
