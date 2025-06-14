
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
          DEFAULT: "var(--primary)",
          foreground: "var(--foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--surface)",
        },
        success: "var(--success)",
        danger: "var(--danger)",
        background: "var(--background)",
        surface: "var(--surface)",
        border: "var(--border)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        text: ["'Inter'", "sans-serif"],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
      },
      boxShadow: {
        neon: "0 2px 30px 0 rgba(255,86,169,0.3), 0 1.5px 10px 0 rgba(60,142,255,0.14)",
        vibrant: "0 2px 22px 0 rgba(170,93,255,0.3), 0 4px 22px 0 rgba(255,214,0,0.09)"
      },
      backgroundImage: {
        "vibrant-gradient": "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 45%, var(--accent) 100%)",
        "vibrant-mobile": "linear-gradient(120deg, var(--primary) 20%, var(--accent) 90%)"
      },
      animation: {
        blob: "blob 8s infinite",
        "fade-in": "fade-in 0.5s ease-out forwards",
      },
      keyframes: {
        blob: {
          "0%": { transform: "scale(1) translate(0px, 0px)" },
          "33%": { transform: "scale(1.1) translate(30px, -20px)" },
          "66%": { transform: "scale(0.95) translate(-24px, 22px)" },
          "100%": { transform: "scale(1) translate(0px, 0px)" }
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
