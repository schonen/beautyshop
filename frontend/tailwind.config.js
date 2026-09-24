/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#ad2d47",
        "on-primary": "#ffffff",
        "primary-container": "#ff6b81",
        "on-primary-container": "#6e0021",
        "inverse-primary": "#ffb2b9",
        "primary-fixed": "#ffdadc",
        "primary-fixed-dim": "#ffb2b9",
        "on-primary-fixed": "#400010",
        "on-primary-fixed-variant": "#8c1231",

        secondary: "#844f5a",
        "on-secondary": "#ffffff",
        "secondary-container": "#ffbac6",
        "on-secondary-container": "#7b4752",
        "secondary-fixed": "#ffd9df",
        "secondary-fixed-dim": "#f8b4c0",
        "on-secondary-fixed": "#350e18",
        "on-secondary-fixed-variant": "#693842",

        tertiary: "#615d5f",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#9f9b9c",
        "on-tertiary-container": "#353334",

        surface: "#f8f9ff",
        "surface-dim": "#d0dbed",
        "surface-bright": "#f8f9ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#eff4ff",
        "surface-container": "#e6eeff",
        "surface-container-high": "#dee9fc",
        "surface-container-highest": "#d9e3f6",
        "surface-variant": "#d9e3f6",
        "on-surface": "#121c2a",
        "on-surface-variant": "#584143",
        "inverse-surface": "#27313f",
        "inverse-on-surface": "#eaf1ff",

        background: "#f8f9ff",
        "on-background": "#121c2a",

        outline: "#8b7072",
        "outline-variant": "#dfbfc1",

        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2.5rem",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
