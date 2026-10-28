import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const getSnapshot = () => window.matchMedia(QUERY).matches;
const getServerSnapshot = () => null;

/** null during SSR and hydration, so a Player can mount once on the client with autoPlay already decided. */
export const usePrefersReducedMotion = () =>
  useSyncExternalStore<boolean | null>(subscribe, getSnapshot, getServerSnapshot);
