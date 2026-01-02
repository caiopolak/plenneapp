
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
          success: {
            bg: "hsl(var(--card-success-bg))",
            border: "hsl(var(--card-success-border))",
            text: "hsl(var(--card-success-text))",
            accent: "hsl(var(--card-success-accent))",
          },
          error: {
            bg: "hsl(var(--card-error-bg))",
            border: "hsl(var(--card-error-border))",
            text: "hsl(var(--card-error-text))",
            accent: "hsl(var(--card-error-accent))",
          },
          info: {
            bg: "hsl(var(--card-info-bg))",
            border: "hsl(var(--card-info-border))",
            text: "hsl(var(--card-info-text))",
            accent: "hsl(var(--card-info-accent))",
          },
          warning: {
            bg: "hsl(var(--card-warning-bg))",
            border: "hsl(var(--card-warning-border))",
            text: "hsl(var(--card-warning-text))",
            accent: "hsl(var(--card-warning-accent))",
          },
          primary: {
            bg: "hsl(var(--card-primary-bg))",
            border: "hsl(var(--card-primary-border))",
            text: "hsl(var(--card-primary-text))",
            accent: "hsl(var(--card-primary-accent))",
          },
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
        "glow": "0 0 20px rgba(47, 158, 68, 0.3)",
        "glow-primary": "0 0 20px rgba(0, 63, 92, 0.3)",
      },
      backgroundImage: {
        "blue-green-gradient": "linear-gradient(120deg, #003f5c 0%, #2f9e44 100%)",
        "attention-gradient": "linear-gradient(98deg, #f8961e 15%, #003f5c 89%)"
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(10px)" }
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" }
        },
        "slide-in-left": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" }
        },
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" }
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" }
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        },
        "number-count": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        // Micro-animations
        "press": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.97)" },
          "100%": { transform: "scale(1)" }
        },
        "wiggle": {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-2deg)" },
          "75%": { transform: "rotate(2deg)" }
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" }
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(47, 158, 68, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(47, 158, 68, 0.5)" }
        },
        "pop": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" }
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-2px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(2px)" }
        },
        "slide-up-fade": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "icon-bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" }
        },
        "success-check": {
          "0%": { transform: "scale(0) rotate(-45deg)", opacity: "0" },
          "50%": { transform: "scale(1.2) rotate(0deg)" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" }
        }
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out forwards",
        "fade-out": "fade-out 0.3s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        "slide-up": "slide-up 0.4s ease-out forwards",
        "slide-down": "slide-down 0.4s ease-out forwards",
        "slide-in-right": "slide-in-right 0.4s ease-out forwards",
        "slide-in-left": "slide-in-left 0.4s ease-out forwards",
        "bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
        "pulse-subtle": "pulse-subtle 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "number-count": "number-count 0.5s ease-out forwards",
        // Micro-animations
        "press": "press 0.15s ease-out",
        "wiggle": "wiggle 0.5s ease-in-out",
        "float": "float 3s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "pop": "pop 0.3s ease-out",
        "shake": "shake 0.5s ease-in-out",
        "slide-up-fade": "slide-up-fade 0.3s ease-out forwards",
        "icon-bounce": "icon-bounce 0.4s ease-out",
        "success-check": "success-check 0.4s ease-out forwards"
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

