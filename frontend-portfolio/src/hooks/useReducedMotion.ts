import { useEffect, useState } from 'react'

const REDUCED_MOTION_STORAGE_KEY = 'portfolio-reduced-motion'

function getInitialReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  const stored = window.localStorage.getItem(REDUCED_MOTION_STORAGE_KEY)
  if (stored === 'true') return true
  if (stored === 'false') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState<boolean>(getInitialReducedMotion)

  useEffect(() => {
    const root = document.documentElement
    if (reducedMotion) {
      root.dataset.reducedMotion = 'true'
    } else {
      delete root.dataset.reducedMotion
    }
  }, [reducedMotion])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (event: MediaQueryListEvent) => {
      if (window.localStorage.getItem(REDUCED_MOTION_STORAGE_KEY) !== null) return
      setReducedMotion(event.matches)
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const toggleReducedMotion = () => {
    setReducedMotion((current) => {
      const next = !current
      window.localStorage.setItem(REDUCED_MOTION_STORAGE_KEY, String(next))
      return next
    })
  }

  return {
    reducedMotion,
    toggleReducedMotion,
  }
}
