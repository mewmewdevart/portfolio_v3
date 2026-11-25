import characterFaceImg from '../assets/images/character/character-face.png'
import screenLeftIrisImg from '../assets/images/character/eye-iris-screen-left.png'
import screenRightIrisImg from '../assets/images/character/eye-iris-screen-right.png'

export type EyeConfig = {
  id: 'screen-left' | 'screen-right'
  irisSrc: string
  clipClassName: string
  restX: number
  restY: number
  rangeX: number
  rangeY: number
  slope: number
}

export const CHARACTER_PORTRAIT_META = {
  faceSrc: characterFaceImg,
  width: 1254,
  height: 1254,
  alt: 'Retrato ilustrado de Larissa, com cabelo afro, piercings e detalhes roxos.',
} as const

export const EYE_TRACKING_CONFIG = {
  mediaQuery: '(any-hover: hover) and (prefers-reduced-motion: no-preference)',
  duration: 0.42,
  ease: 'power3.out',
  anchorXRatio: 0.405,
  anchorYRatio: 0.448,
  radiusRatio: 0.3,
} as const

export const CHARACTER_EYES: EyeConfig[] = [
  {
    id: 'screen-left',
    irisSrc: screenLeftIrisImg,
    clipClassName: 'eye-clip-screen-left',
    restX: -0.88,
    restY: 1.04,
    rangeX: 1.3,
    rangeY: 0.28,
    slope: -0.24,
  },
  {
    id: 'screen-right',
    irisSrc: screenRightIrisImg,
    clipClassName: 'eye-clip-screen-right',
    restX: -1.04,
    restY: 0.96,
    rangeX: 1.6,
    rangeY: 0.34,
    slope: -0.13,
  },
]
