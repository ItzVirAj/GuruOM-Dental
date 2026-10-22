"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Hook to detect desktop viewports (default >= 1024px).
 * SSR-safe, updates reactively on window resize without cascading renders.
 */
export function useIsDesktop(breakpoint = 1024): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === "undefined" || !window.matchMedia) {
        return () => {};
      }
      const mediaQuery = window.matchMedia(`(min-width: ${breakpoint}px)`);
      mediaQuery.addEventListener("change", onStoreChange);
      return () => mediaQuery.removeEventListener("change", onStoreChange);
    },
    [breakpoint]
  );

  const getSnapshot = () => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(`(min-width: ${breakpoint}px)`).matches;
  };

  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default useIsDesktop;
