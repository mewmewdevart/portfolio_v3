import gsap from 'gsap'

export type Point = { x: number; y: number }
export type Rect = Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>
export type CursorMode = 'pointer' | 'crosshair'

/**
 * Cursor virtual.
 *
 * Toda a movimentação passa por `point` (o alvo). Tweens do GSAP animam `point`
 * (viagens) ou o código escreve nele direto (seguir o texto / o arraste).
 * Um único ticker suaviza `current` até `point` com amortecimento exponencial,
 * então nunca existem dois tweens brigando pela mesma propriedade do elemento
 * e o movimento fica contínuo mesmo quando o alvo muda a cada frame.
 */
export class VirtualCursor {
  readonly el: HTMLElement
  readonly point: Point = { x: 0, y: 0 }

  private readonly current: Point = { x: 0, y: 0 }
  private readonly pointerEl: HTMLElement | null
  private readonly crosshairEl: HTMLElement | null
  private readonly stiffness: number
  private speed = 1
  private visible = false
  private ticking = false

  constructor(el: HTMLElement, stiffness = 20) {
    this.el = el
    this.stiffness = stiffness
    this.pointerEl = el.querySelector<HTMLElement>('[data-cursor-mode="pointer"]')
    this.crosshairEl = el.querySelector<HTMLElement>('[data-cursor-mode="crosshair"]')
    gsap.set(el, { autoAlpha: 0 })
    this.apply()
  }

  /** Aparece perto do ponto e fica visível (ou interrompe fadeOut se estiver saindo). */
  appear(p: Point) {
    gsap.killTweensOf(this.el)
    if (!this.visible) {
      this.visible = true
      this.point.x = this.current.x = p.x + 56
      this.point.y = this.current.y = p.y + 40
      this.apply()
    }
    gsap.to(this.el, { autoAlpha: 1, duration: 0.22, ease: 'power1.out', overwrite: 'auto' })
    this.startTicker()
  }

  /** Viagem suave até um ponto lido de forma preguiçosa (quando o tween começa). */
  travel(tl: gsap.core.Timeline, getPoint: () => Point, duration = 0.5, at?: gsap.Position) {
    tl.add(() => this.appear(getPoint()), at)
    tl.to(
      this.point,
      {
        x: () => getPoint().x,
        y: () => getPoint().y,
        duration,
        ease: 'power2.inOut',
      },
      '<',
    )
  }

  /** Move o alvo sem tween (usado dentro de onUpdate). */
  follow(x: number, y: number) {
    this.point.x = x
    this.point.y = y
  }

  setMode(mode: CursorMode) {
    if (this.pointerEl) this.pointerEl.style.opacity = mode === 'pointer' ? '1' : '0'
    if (this.crosshairEl) this.crosshairEl.style.opacity = mode === 'crosshair' ? '1' : '0'
  }

  setSpeed(scale: number) {
    this.speed = Math.max(1, scale)
  }

  fadeOut(tl?: gsap.core.Timeline, at?: gsap.Position) {
    const vars: gsap.TweenVars = {
      autoAlpha: 0,
      duration: 0.28,
      ease: 'power1.out',
      overwrite: 'auto',
      onComplete: () => this.vanish(),
    }
    if (tl) {
      tl.to(this.el, vars, at)
    } else {
      gsap.to(this.el, vars)
    }
  }

  dispose() {
    gsap.killTweensOf(this.el)
    this.vanish()
    this.setMode('pointer')
    gsap.set(this.el, { autoAlpha: 0, clearProps: 'transform' })
  }

  private vanish() {
    this.visible = false
    this.stopTicker()
  }

  private apply() {
    this.el.style.transform = `translate3d(${this.current.x.toFixed(2)}px, ${this.current.y.toFixed(2)}px, 0)`
  }

  private startTicker() {
    if (this.ticking) return
    this.ticking = true
    gsap.ticker.add(this.tick)
  }

  private stopTicker() {
    if (!this.ticking) return
    this.ticking = false
    gsap.ticker.remove(this.tick)
  }

  private tick = (_time: number, deltaMs: number) => {
    const dt = Math.min(deltaMs, 50) / 1000
    const k = 1 - Math.exp(-dt * this.stiffness * this.speed)
    this.current.x += (this.point.x - this.current.x) * k
    this.current.y += (this.point.y - this.current.y) * k
    this.apply()
  }
}

/** Caixa de seleção (marquee) com alças; só mexe em transform/width/height de um overlay fixo. */
export class Marquee {
  readonly el: HTMLElement
  private readonly dimEl: HTMLElement | null

  constructor(el: HTMLElement, dimEl: HTMLElement | null = null) {
    this.el = el
    this.dimEl = dimEl
    gsap.set(el, { autoAlpha: 0 })
  }

  set(r: Rect, pad = 0) {
    const s = this.el.style
    s.transform = `translate3d(${(r.left - pad).toFixed(2)}px, ${(r.top - pad).toFixed(2)}px, 0)`
    s.width = `${Math.max(0, r.width + pad * 2).toFixed(2)}px`
    s.height = `${Math.max(0, r.height + pad * 2).toFixed(2)}px`
    if (this.dimEl) {
      this.dimEl.textContent = `${Math.round(r.width)} × ${Math.round(r.height)}`
    }
  }

  show() {
    gsap.set(this.el, { autoAlpha: 1 })
  }

  hide(tl: gsap.core.Timeline, at?: gsap.Position, duration = 0.2) {
    tl.to(this.el, { autoAlpha: 0, duration, ease: 'power1.out' }, at)
  }

  dispose() {
    gsap.killTweensOf(this.el)
    gsap.set(this.el, { autoAlpha: 0, clearProps: 'transform,width,height' })
  }
}
