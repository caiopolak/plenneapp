
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
        // Vibrant & neon-inspired palette
        vibrant: {
          pink: "#FF56A9",
          blue: "#3C8EFF",
          purple: "#AA5DFF",
          gold: "#FFD600",
          green: "#00E886",
          orange: "#FF8900",
          bg: "#0C0B1A", // Night dark, for contrast
          card: "#161429"
        },
        primary: {
          DEFAULT: "#FF56A9", // neon pink
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#3C8EFF",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#FFD600",
          foreground: "#161429"
        },
        success: "#00E886",
        warning: "#FFD600",
        danger: "#FF3B55",
        background: "#0C0B1A",
        surface: "#161429",
        border: {
          DEFAULT: "#242236",
        },
      },
      fontFamily: {
        // Nova fonte display para títulos e uma excelente para leitura
        display: ["'Space Grotesk'", "Poppins", "sans-serif"],
        text: ["'Inter'", "Poppins", "sans-serif"],
      },
      borderRadius: {
        xl: "1.5rem",
        lg: "1rem",
        md: "0.8rem",
        sm: "0.4rem"
      },
      boxShadow: {
        neon: "0 2px 30px 0 rgba(255,86,169,0.3), 0 1.5px 10px 0 rgba(60,142,255,0.14)",
        vibrant: "0 2px 22px 0 rgba(170,93,255,0.3), 0 4px 22px 0 rgba(255,214,0,0.09)"
      },
      backgroundImage: {
        // Backdrop para toda a aplicação
        "vibrant-gradient": "linear-gradient(135deg,#FF56A9 0%,#3C8EFF 45%,#AA5DFF 100%)",
        "vibrant-mobile": "linear-gradient(120deg,#FF56A9 20%,#FFD600 90%)"
      },
      animation: {
        blob: "blob 8s infinite",
      },
      keyframes: {
        blob: {
          "0%": { transform: "scale(1) translate(0px, 0px)" },
          "33%": { transform: "scale(1.1) translate(30px, -20px)" },
          "66%": { transform: "scale(0.95) translate(-24px, 22px)" },
          "100%": { transform: "scale(1) translate(0px, 0px)" }
        },
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
