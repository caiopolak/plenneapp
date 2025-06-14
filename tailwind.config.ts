
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
        primary: {
          DEFAULT: "#003f5c",
          foreground: "#f4f4f4",
        },
        secondary: {
          DEFAULT: "#2f9e44",
          foreground: "#f4f4f4",
        },
        neutral: {
          light: "#f4f4f4",
          dark: "#2b2b2b",
        },
        graphite: "#2b2b2b",
        attention: "#f8961e",
        error: "#d62828",
        accent: "#f8961e",
        background: "#f4f4f4",
        surface: "#ffffff",
      },
      fontFamily: {
        display: ["Poppins", "sans-serif"],
        text: ["Inter", "sans-serif"],
        highlight: ["Montserrat", "IBM Plex Sans", "sans-serif"],
      },
      borderRadius: {
        xl: "1.2rem",
        lg: "1rem",
        md: "0.75rem",
        sm: "0.5rem",
      },
      boxShadow: {
        card: "0 4px 32px 0 rgba(44, 63, 92, 0.12)",
        accent: "0 2px 16px 0 rgba(47, 158, 68, 0.08), 0 6px 32px 0 rgba(0,63,92,0.10)",
      },
      backgroundImage: {
        "blue-green-gradient": "linear-gradient(120deg, #003f5c 0%, #2f9e44 100%)",
        "attention-gradient": "linear-gradient(98deg, #f8961e 15%, #003f5c 89%)"
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

