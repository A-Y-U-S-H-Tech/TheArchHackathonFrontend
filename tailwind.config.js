/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        base: "#0B0E14",
        panel: "#141925",
        panel2: "#1A2030",
        border: "#1E2433",
        accent: "#00D4B8",
        alert: "#FF6B5B",
        warn: "#F5A623",
        muted: "#8B93A7",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
