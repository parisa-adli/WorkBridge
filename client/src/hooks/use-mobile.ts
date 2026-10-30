import * as React from "react"

// the sidebar turns into its Sheet drawer below lg (1024px)
const MOBILE_BREAKPOINT = 1024

// useSyncExternalStore instead of stock's setState in an effect (react-hooks 7 set-state-in-effect)
function subscribe(onChange: () => void) {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.innerWidth < MOBILE_BREAKPOINT
  )
}
