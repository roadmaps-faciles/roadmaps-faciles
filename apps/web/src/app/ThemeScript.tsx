import Script from "next/script";

// Inline script that toggles the `dark` class on <html> before first paint.
// Prevents FOUC by detecting dark mode preference synchronously.
// next/script with beforeInteractive injects the script before React hydration,
// keeping it outside the React tree so React doesn't emit a "script tag in React component" warning.
export const ThemeScript = () => (
  <Script id="theme-script" strategy="beforeInteractive">
    {`(function(){try{var s=localStorage.getItem("theme");var d=s==="dark"||(s!=="light"&&matchMedia("(prefers-color-scheme:dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light"}catch(e){}})()`}
  </Script>
);
