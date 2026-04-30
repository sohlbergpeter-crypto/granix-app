import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#050807",
        foreground: "#ffffff",
        granix: {
          green: "#00af41",
          dark: "#08110b",
          panel: "#0d1510",
          muted: "#95a39a",
        },
      },
      boxShadow: {
        glow: "0 0 40px rgba(0, 175, 65, 0.22)",
      },
    },
  },
  plugins: [],
};

export default config;
