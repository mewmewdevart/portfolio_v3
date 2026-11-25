import { useRef } from 'react'
import { CHARACTER_EYES, CHARACTER_PORTRAIT_META } from '../../config/characterEyes'
import { useEyeTracking } from '../../hooks/useEyeTracking'

type CharacterPortraitProps = {
  className?: string
}

/**
 * Retrato ilustrado com rastreamento ocular suave via GSAP.
 */
export function CharacterPortrait({ className = '' }: CharacterPortraitProps) {
  const portraitRef = useRef<HTMLDivElement>(null)
  const irisRefs = useRef<(HTMLImageElement | null)[]>([])

  useEyeTracking(portraitRef, irisRefs, CHARACTER_EYES)

  return (
    <div className={`self-center overflow-hidden ${className}`.trim()}>
      <div
        ref={portraitRef}
        className="relative isolate w-full aspect-square pointer-events-none select-none"
      >
        {CHARACTER_EYES.map((eye, index) => (
          <div
            key={eye.id}
            aria-hidden="true"
            className={`absolute inset-0 block size-full bg-sclera ${eye.clipClassName}`}
          >
            <img
              ref={(el) => {
                irisRefs.current[index] = el
              }}
              src={eye.irisSrc}
              alt=""
              draggable={false}
              className="eye-iris-rest absolute inset-0 block size-full max-w-none"
            />
          </div>
        ))}
        <img
          src={CHARACTER_PORTRAIT_META.faceSrc}
          width={CHARACTER_PORTRAIT_META.width}
          height={CHARACTER_PORTRAIT_META.height}
          alt={CHARACTER_PORTRAIT_META.alt}
          draggable={false}
          className="absolute inset-0 z-1 block size-full max-w-none"
        />
      </div>
    </div>
  )
}
