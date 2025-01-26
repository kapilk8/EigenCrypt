/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderColor: {
        border: 'hsl(var(--border) / <alpha-value>)'
      },
      backgroundColor: {
        background: 'hsl(var(--background) / <alpha-value>)'
      },
      textColor: {
        foreground: 'hsl(var(--foreground) / <alpha-value>)'
      }
    }
  },
  plugins: []
} 