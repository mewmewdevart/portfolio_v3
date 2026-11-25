import { useEffect, useState } from 'react'
import type { SectionId } from '../config/navigation'

export function useActiveSection(
  sectionIds: SectionId[],
  initialId: SectionId = 'about',
) {
  const [activeSection, setActiveSection] = useState<SectionId>(initialId)

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (!elements.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id as SectionId)
          }
        }
      },
      {
        rootMargin: '-25% 0px -60% 0px',
        threshold: 0,
      },
    )

    for (const el of elements) {
      observer.observe(el)
    }

    return () => {
      observer.disconnect()
    }
  }, [sectionIds])

  return [activeSection, setActiveSection] as const
}
