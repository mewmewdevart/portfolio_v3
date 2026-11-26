import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { EYE_TRACKING_CONFIG, type EyeConfig } from '../config/characterEyes'

export function useEyeTracking(
  portraitRef: RefObject<HTMLDivElement | null>,
  irisRefs: RefObject<(HTMLImageElement | null)[]>,
  eyes: EyeConfig[],
  flipped = false,
  reducedMotion = false,
) {
  useEffect(() => {
    const portrait = portraitRef.current
    if (!portrait) return

    if (reducedMotion) {
      irisRefs.current.forEach((iris) => {
        if (iris) gsap.set(iris, { clearProps: 'transform' })
      })
      return
    }

    const motion = gsap.matchMedia()
    const effectiveAnchorX = flipped
      ? 1 - EYE_TRACKING_CONFIG.anchorXRatio
      : EYE_TRACKING_CONFIG.anchorXRatio
    const xDirection = flipped ? -1 : 1

    motion.add(EYE_TRACKING_CONFIG.mediaQuery, () => {
      const easing: gsap.TweenVars = {
        duration: EYE_TRACKING_CONFIG.duration,
        ease: EYE_TRACKING_CONFIG.ease,
      }

      const trackedEyes = eyes.flatMap((eye, index) => {
        const iris = irisRefs.current[index]
        if (!iris) return []

        const style = getComputedStyle(iris)
        const parsedX = Number.parseFloat(style.getPropertyValue('--rest-x'))
        const parsedY = Number.parseFloat(style.getPropertyValue('--rest-y'))
        const restX = Number.isFinite(parsedX) ? parsedX : eye.restX
        const restY = Number.isFinite(parsedY) ? parsedY : eye.restY

        gsap.set(iris, { x: 0, y: 0, xPercent: restX, yPercent: restY })

        return [
          {
            ...eye,
            restX,
            restY,
            moveX: gsap.quickTo(iris, 'xPercent', easing),
            moveY: gsap.quickTo(iris, 'yPercent', easing),
          },
        ]
      })

      const follow = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') {
          return
        }

        const bounds = portrait.getBoundingClientRect()
        if (!bounds.width || !bounds.height) return

        const { anchorYRatio, radiusRatio } = EYE_TRACKING_CONFIG
        const dx =
          (event.clientX - bounds.left - bounds.width * effectiveAnchorX) /
          (bounds.width * radiusRatio)
        const dy =
          (event.clientY - bounds.top - bounds.height * anchorYRatio) /
          (bounds.height * radiusRatio)
        const distance = Math.max(1, Math.hypot(dx, dy))
        const horizontal = dx / distance
        const vertical = dy / distance

        for (const eye of trackedEyes) {
          const offsetX = horizontal * eye.rangeX * xDirection
          eye.moveX(eye.restX + offsetX)
          eye.moveY(eye.restY + vertical * eye.rangeY + offsetX * eye.slope)
        }
      }

      const reset = () => {
        for (const eye of trackedEyes) {
          eye.moveX(eye.restX)
          eye.moveY(eye.restY)
        }
      }

      window.addEventListener('pointermove', follow, { passive: true })
      document.documentElement.addEventListener('pointerleave', reset)
      window.addEventListener('blur', reset)

      return () => {
        window.removeEventListener('pointermove', follow)
        document.documentElement.removeEventListener('pointerleave', reset)
        window.removeEventListener('blur', reset)
      }
    })

    return () => {
      motion.revert()
    }
  }, [portraitRef, irisRefs, eyes, flipped, reducedMotion])
}
