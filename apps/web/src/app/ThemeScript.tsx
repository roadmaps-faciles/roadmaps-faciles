/**
 * Inline script that toggles the `dark` class on <html> before first paint.
 * Prevents FOUC by detecting dark mode preference synchronously.
 *
 * Reads localStorage key "theme" (shadcn/next-themes convention).
 * Falls back to system `prefers-color-scheme`.
 *
 * NOTE: dangerouslySetInnerHTML is intentional — this is a static trusted
 * string, not user input. Required for blocking script before React hydration.
 */
export const ThemeScript = () => (
  <script
    suppressHydrationWarning
    dangerouslySetInnerHTML={{
      __html: `(function(){try{var s=localStorage.getItem("theme");var d=s==="dark"||(s!=="light"&&matchMedia("(prefers-color-scheme:dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light"}catch(e){}})()`,
    }}
  />
);
