import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      }
    },
    extend: {
      colors: {
        plenne: {
          emerald: "#017F66",
          electric: "#0057FF",
          gold: "#F5B942",
          graphite: "#1C1C1C",
          white: "#FFFFFF",
        },
        primary: {
          DEFAULT: "#017F66",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#0057FF",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#F5B942",
          foreground: "#1C1C1C"
        },
        background: "#FFFFFF",
        foreground: "#1C1C1C",
          border: {
            DEFAULT: "#e5e7eb",
            border: "#e5e7eb", // Cor cinza-clara padrão Tailwind
          },
        },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      borderRadius: {
        lg: '1.2rem',
        md: '0.6rem',
        sm: '0.3rem'
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
