import type { Config } from "tailwindcss"

const sizes = {
  app: "calc(100vh - 72px)",
}

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
      height: sizes,
      maxHeight: sizes,
      spacing: {
        "18": "4.5rem",
      },
      width: {
        body: "712px",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        info: "#0E4CAF",
        background: "hsl(var(--background))",
        backgroundaccent: "hsl(var(--background-accent))",
        backgroundSecondary: "hsl(var(--background-secondary))",
        backgroundSecondaryHover: "hsl(var(--background-secondary-hover))",
        tertiary: "#E0E2EB",
        button: {
          primary: {
            DEFAULT: "hsl(var(--button-primary))",
            foreground: "hsl(var(--button-primary-text))",
            hover: "hsla(var(--button-primary), 0.8)",
          },
          secondary: {
            DEFAULT: "hsl(var(--button-secondary))",
            foreground: "hsl(var(--button-secondary-foreground))",
            hover: "hsla(var(--button-secondary), 0.8)",
          },
        },
        text: {
          primary: "hsl(var(--text-primary))",
          secondary: "hsl(var(--text-secondary))",
          default: "hsl(var(--text-default))",
          muted: "hsl(var(--text-muted))",
          destructive: "#FF0420",
        },
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        optimismRed: "hsl(var(--destructive))",
        callout: {
          DEFAULT: "#D6E4FF",
          foreground: "#3374DB",
        },
        contrast: {
          DEFAULT: "#05060B",
          white: "#FFFFFF",
          foreground: "#FBFCFE",
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
        "slow-spin": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slow-spin": "slow-spin 2s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
