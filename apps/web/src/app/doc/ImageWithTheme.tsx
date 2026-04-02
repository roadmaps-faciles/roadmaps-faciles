"use client";

import { cn } from "@roadmaps-faciles/ui";
import { Moon, Sun } from "lucide-react";
import { type ImgHTMLAttributes, useCallback, useEffect, useRef, useState } from "react";

const OVERRIDE_ATTR = "data-img-preview-override";

/**
 * Hook that tracks which image theme is currently displayed
 * (system/user theme or manual override) and provides a toggle function.
 */
function useImagePreviewTheme() {
  const [showing, setShowing] = useState<"dark" | "light">("light");

  useEffect(() => {
    const update = () => {
      const override = document.documentElement.getAttribute(OVERRIDE_ATTR);
      const theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
      setShowing((override || theme) as "dark" | "light");
    };
    update();

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [OVERRIDE_ATTR, "class"],
    });
    return () => observer.disconnect();
  }, []);

  const toggle = useCallback(() => {
    const override = document.documentElement.getAttribute(OVERRIDE_ATTR);
    const theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    const current = override || theme;
    const next = current === "dark" ? "light" : "dark";

    if (next === theme) {
      document.documentElement.removeAttribute(OVERRIDE_ATTR);
    } else {
      document.documentElement.setAttribute(OVERRIDE_ATTR, next);
    }
  }, []);

  return { showing, toggle };
}

/**
 * Preloads the hidden image variant when the wrapper approaches the viewport.
 */
function usePreloadHiddenImage(srcLight: string, srcDark: string) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          const theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
          const override = document.documentElement.getAttribute(OVERRIDE_ATTR);
          const current = override || theme;
          const hiddenSrc = current === "light" ? srcDark : srcLight;

          const img = new Image();
          img.src = hiddenSrc;

          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [srcLight, srcDark]);

  return wrapperRef;
}

/**
 * MDX component that renders theme-aware screenshots with a toggle button.
 *
 * Usage in MDX:
 * ```mdx
 * <ImageWithTheme
 *   srcLight="/doc/screenshots/example-light.png"
 *   srcDark="/doc/screenshots/example-dark.png"
 *   alt="Description"
 * />
 * ```
 */
export const ImageWithTheme = ({
  srcLight,
  srcDark,
  alt,
  ...props
}: {
  srcDark: string;
  srcLight: string;
} & Omit<ImgHTMLAttributes<HTMLImageElement>, "src">) => {
  const { showing, toggle } = useImagePreviewTheme();
  const wrapperRef = usePreloadHiddenImage(srcLight, srcDark);
  const className = cn("rounded-lg", props.className);

  return (
    <div ref={wrapperRef} className="image-with-theme">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={srcLight} alt={alt} {...props} loading="lazy" data-theme-img="light" className={className} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={srcDark} alt={alt} {...props} data-theme-img="dark" className={className} />
      <button
        type="button"
        className="image-theme-toggle"
        onClick={toggle}
        aria-label={showing === "light" ? "Voir en mode sombre" : "Voir en mode clair"}
        title={showing === "light" ? "Voir en mode sombre" : "Voir en mode clair"}
      >
        {showing === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
      </button>
    </div>
  );
};
