import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    fontFamily: {
      "geist-sans": ["var(--font-geist-sans)", "sans-serif"],
    },
    // align with dsfr
    screens: {
      sm: "36em",
      md: "48em",
      lg: "62em",
      xl: "78em",
    },
  },
  plugins: [],
} satisfies Config;
