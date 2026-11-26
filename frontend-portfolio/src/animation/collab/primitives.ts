import gsap from 'gsap'
import type { Marquee, Point, Rect, VirtualCursor } from './cursor'

/** Elementos que o motor transforma (scale/y). Só neles `transform` é limpo ao final. */
const TRANSFORMED = [
  '[data-build="social-item"]',
  '[data-build="nav-line"]',
  '[data-build="tech-tag"]',
  '[data-build="project-arrow"]',
].join(',')

const CLEAR_BASE = 'opacity,visibility,clipPath'

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export const centerOf = (el: Element, fx = 0.5, fy = 0.5): Point => {
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width * fx, y: r.top + r.height * fy }
}

/** Retângulo de layout (ignora scale), centrado onde o elemento está agora. */
export const layoutRect = (el: HTMLElement): Rect => {
  const r = el.getBoundingClientRect()
  const w = el.offsetWidth || r.width
  const h = el.offsetHeight || r.height
  return { left: r.left + r.width / 2 - w / 2, top: r.top + r.height / 2 - h / 2, width: w, height: h }
}

export const unionRect = (els: Element[]): Rect => {
  const rs = els.map((e) => e.getBoundingClientRect())
  const left = Math.min(...rs.map((r) => r.left))
  const top = Math.min(...rs.map((r) => r.top))
  const right = Math.max(...rs.map((r) => r.right))
  const bottom = Math.max(...rs.map((r) => r.bottom))
  return { left, top, width: right - left, height: bottom - top }
}

const isRendered = (el: Element) => {
  const r = el.getBoundingClientRect()
  return r.width > 4 && r.height > 4
}

/* ------------------------------------------------------------------ */
/* Estado inicial / final                                              */
/* ------------------------------------------------------------------ */

export const collectChars = (el: Element) =>
  Array.from(el.querySelectorAll<HTMLElement>('[data-typed-char]'))

export function hideChars(root: Element) {
  root.querySelectorAll<HTMLElement>('[data-typed-char]').forEach((c) => {
    c.style.opacity = '0'
  })
}

/** Devolve o elemento (e os blocos de dentro) exatamente ao CSS original. */
export function settle(...els: Array<Element | null | undefined>) {
  for (const el of els) {
    if (!el) continue
    if (el instanceof HTMLElement) delete el.dataset.building
    el.querySelectorAll<HTMLElement>('[data-building]').forEach((node) => {
      delete node.dataset.building
    })
    el.querySelectorAll<HTMLElement>('[data-typed-char]').forEach((c) => {
      c.style.removeProperty('opacity')
    })
    const nodes = [el, ...Array.from(el.querySelectorAll('[data-build]'))]
    const transformed = nodes.filter((n) => n.matches(TRANSFORMED))
    const plain = nodes.filter((n) => !n.matches(TRANSFORMED))
    if (plain.length) gsap.set(plain, { clearProps: CLEAR_BASE })
    if (transformed.length) gsap.set(transformed, { clearProps: `${CLEAR_BASE},transform` })
  }
}

/* ------------------------------------------------------------------ */
/* Digitação: um único tween por texto                                 */
/* ------------------------------------------------------------------ */

type TypeOptions = {
  cps: number
  at?: gsap.Position
  travel?: number
  minDuration?: number
  maxDuration?: number
}

const caretPoint = (chars: HTMLElement[], index: number): Point => {
  let i = index
  while (i > 0 && !chars[i].textContent?.trim()) i--
  const r = chars[i].getBoundingClientRect()
  return { x: r.right + 1, y: r.top + r.height * 0.5 }
}

export function typeText(
  tl: gsap.core.Timeline,
  cursor: VirtualCursor,
  el: Element,
  { cps, at, travel = 0.32, minDuration = 0.3, maxDuration = 2.2 }: TypeOptions,
) {
  const chars = collectChars(el)
  if (!chars.length) return

  // Texto fora da tela/invisível (ex.: título sr-only no desktop): só revela.
  if (!isRendered(el)) {
    tl.add(() => chars.forEach((c) => c.style.removeProperty('opacity')), at)
    return
  }

  const anchor = chars.find((c) => c.textContent?.trim()) ?? chars[0]
  cursor.travel(
    tl,
    () => {
      const r = anchor.getBoundingClientRect()
      return { x: r.left - 1, y: r.top + r.height * 0.5 }
    },
    travel,
    at,
  )

  const state = { n: 0 }
  let shown = 0
  tl.to(
    state,
    {
      n: chars.length,
      duration: clamp(chars.length / cps, minDuration, maxDuration),
      ease: 'none',
      onUpdate: () => {
        const upTo = Math.min(chars.length, Math.floor(state.n))
        while (shown < upTo) chars[shown++].style.opacity = '1'
        if (shown > 0) {
          const p = caretPoint(chars, shown - 1)
          cursor.follow(p.x, p.y)
        }
      },
      onComplete: () => chars.forEach((c) => c.style.removeProperty('opacity')),
    },
    '>',
  )
}

/* ------------------------------------------------------------------ */
/* Moldura: arrasta a caixa e revela por clip-path                     */
/* ------------------------------------------------------------------ */

type FrameOptions = {
  cursor: VirtualCursor
  marquee: Marquee
  target: HTMLElement
  duration: number
  at?: gsap.Position
}

export function drawFrame(tl: gsap.core.Timeline, { cursor, marquee, target, duration, at }: FrameOptions) {
  const rectOf = () => target.getBoundingClientRect()

  cursor.travel(
    tl,
    () => {
      const r = rectOf()
      return { x: r.left, y: r.top }
    },
    0.4,
    at,
  )

  const prog = { p: 0 }

  tl.add(() => {
    prog.p = 0
    const r = rectOf()
    cursor.setMode('crosshair')
    marquee.set({ left: r.left, top: r.top, width: 0, height: 0 })
    marquee.show()
    gsap.set(target, { autoAlpha: 1 })
    target.style.clipPath = 'inset(0% 100% 100% 0%)'
  }, '>')

  tl.to(
    prog,
    {
      p: 1,
      duration,
      ease: 'power3.inOut',
      onUpdate: () => {
        // Relê o retângulo a cada frame: se o usuário rolar durante o arraste,
        // a caixa continua colada no alvo.
        const r = rectOf()
        const p = prog.p
        const w = r.width * p
        const h = r.height * p
        marquee.set({ left: r.left, top: r.top, width: w, height: h })
        const inset = ((1 - p) * 100).toFixed(2)
        target.style.clipPath = `inset(0% ${inset}% ${inset}% 0%)`
        cursor.follow(r.left + w, r.top + h)
      },
    },
    '>',
  )

  tl.add(() => {
    cursor.setMode('pointer')
    gsap.set(target, { clearProps: CLEAR_BASE })
  }, '>')

  marquee.hide(tl, '<')
}

/* ------------------------------------------------------------------ */
/* Pequenos gestos                                                     */
/* ------------------------------------------------------------------ */

/** Seleciona rapidamente uma área (pulso da caixa), sem revelar nada. */
export function flash(
  tl: gsap.core.Timeline,
  marquee: Marquee,
  getRect: () => Rect,
  pad = 4,
  at?: gsap.Position,
) {
  tl.add(() => {
    marquee.set(getRect(), pad)
    marquee.show()
  }, at)
  tl.to(marquee.el, { autoAlpha: 0, duration: 0.3, ease: 'power1.in' }, '>+0.1')
}

/** Entrada com leve "pop"; termina limpando tudo para o CSS original. */
export function popIn(
  tl: gsap.core.Timeline,
  targets: HTMLElement[],
  { at, stagger = 0.05, duration = 0.4 }: { at?: gsap.Position; stagger?: number; duration?: number } = {},
) {
  if (!targets.length) return
  tl.to(
    targets,
    {
      autoAlpha: 1,
      scale: 1,
      y: 0,
      duration,
      stagger,
      ease: 'back.out(1.7)',
      clearProps: 'opacity,visibility,transform',
    },
    at,
  )
}
