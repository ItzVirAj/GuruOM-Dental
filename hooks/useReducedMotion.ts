"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Hook to detect and react to user's prefers-reduced-motion OS preference.
 * SSR-safe, updates reactively if user changes system accessibility settings without cascading renders.
 */
export function useReducedMotion(): boolean {
  const subscribe = useCallback((onStoreChange: () => void) => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return () => {};
    }
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    mediaQuery.addEventListener("change", onStoreChange);
    return () => mediaQuery.removeEventListener("change", onStoreChange);
  }, []);

  const getSnapshot = () => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };

  const getServerSnapshot = () => false;

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default useReducedMotion;
