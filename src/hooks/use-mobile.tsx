import { useState, useEffect } from "react"
import { useMounted } from "./use-mounted"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  const mounted = useMounted()

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    if (mounted) {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      mql.addEventListener("change", onChange)
    }

    return () => mql.removeEventListener("change", onChange)
  }, [mounted])

  if (!mounted) return false

  return isMobile
}
