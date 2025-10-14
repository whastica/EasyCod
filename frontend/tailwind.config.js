/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#CB4C10",
          foreground: "#FFFFFF",
          50: "#FFEEE6",
          100: "#FFDDCD",
          200: "#FFBB9B",
          300: "#FF9969",
          400: "#FF7737",
          500: "#CB4C10",
          600: "#B23C0C",
          700: "#992E08",
          800: "#801F04",
          900: "#661100",
        },
        secondary: {
          DEFAULT: "#D6FE3D",
          foreground: "#000000",
          50: "#FBFFE9",
          100: "#F7FFD4",
          200: "#EFFFAA",
          300: "#E7FF7F",
          400: "#DFFF55",
          500: "#D6FE3D",
          600: "#CCEB2A",
          700: "#B8D217",
          800: "#9BB80A",
          900: "#7E9F00",
        },
        accent: {
          DEFAULT: "#4D4D4D",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#1A1A1A",
          foreground: "#A1A1AA",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        popover: {
          DEFAULT: "#1A1A1A",
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "#1A1A1A",
          foreground: "#FFFFFF",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #0A0A0A 100%)',
        'gradient-primary': 'linear-gradient(135deg, #CB4C10 0%, #D6FE3D 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #D6FE3D 0%, #CB4C10 100%)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}