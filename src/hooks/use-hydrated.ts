import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Returns false during SSR and the first client render, then true once
 * hydrated. Canonical replacement for the `useState(false)` + `useEffect`
 * mounted pattern (avoids set-state-in-effect).
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
