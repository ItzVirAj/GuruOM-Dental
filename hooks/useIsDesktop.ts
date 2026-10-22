"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect desktop viewports (default >= 1024px).
 * SSR-safe, updates reactively on window resize.
 */
export function useIsDesktop(breakpoint = 1024): boolean {
  const [isDesktop, setIsDesktop] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const query = `(min-width: ${breakpoint}px)`;
    const mediaQuery = window.matchMedia(query);
    setIsDesktop(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [breakpoint]);

  return isDesktop;
}

export default useIsDesktop;
