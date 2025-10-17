
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
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        neutral: {
          light: "hsl(0 0% 96%)",
          dark: "hsl(240 10% 17%)",
        },
        graphite: "hsl(240 10% 17%)",
        attention: "hsl(24 95% 53%)",
        error: "hsl(0 84% 60%)",
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        background: "hsl(var(--background))",
        surface: "hsl(var(--card))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "hsl(var(--foreground))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
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

