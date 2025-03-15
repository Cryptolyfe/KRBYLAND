// tailwind.config.ts
import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  // Combine all content globs (we add mdx extensions as in the TS version)
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Merge fontFamily settings from the JS config with defaults
      fontFamily: {
        retro: ["'Press Start 2P'", ...fontFamily.sans],
        modern: ["'Poppins'", ...fontFamily.sans],
      },
      // Merge colors from both files
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        neonBlue: "#00FFFF",
        retroPink: "#FF00FF",
        darkBg: "#1E1E1E",
        lightBg: "#F5F5F5",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    // Uncomment the line below if you need aspect ratio support
    // require("@tailwindcss/aspect-ratio"),
  ],
};

export default config;
