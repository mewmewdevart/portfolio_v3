import gsap from 'gsap'

export type JobHandle = {
  kill: () => void
  setTimeScale?: (scale: number) => void
}

export type Job = {
  /** Elemento observado: se já saiu da tela quando chegar a vez, o job vira "instantâneo". */
  el: HTMLElement | null
  /** Ignora a checagem de tela (abertura). */
  force?: boolean
  build?: (tl: gsap.core.Timeline) => void
  run?: (done: () => void, getTimeScale: () => number) => JobHandle | (() => void)
  /** Estado final sem animação. */
  instant: () => void
}

const inViewport = (el: HTMLElement) => {
  const r = el.getBoundingClientRect()
  return r.bottom > 0 && r.top < window.innerHeight * 0.95
}

const compareVisualOrder = (a: Job, b: Job) => {
  if (a.force && !b.force) return -1
  if (!a.force && b.force) return 1
  if (!a.el || !b.el) return 0
  const ra = a.el.getBoundingClientRect()
  const rb = b.el.getBoundingClientRect()
  const bandA = Math.round(ra.top / 24)
  const bandB = Math.round(rb.top / 24)
  if (bandA !== bandB) return bandA - bandB
  return ra.left - rb.left
}

/**
 * Fila única: só um bloco usa os cursores por vez, na ordem visual de leitura
 * (cima para baixo, esquerda para a direita). Blocos que o usuário já deixou
 * para trás são revelados sem animação, e quando o usuário rola rápido para baixo
 * ou acumula fila, a animação atual acelera para acompanhar sem atraso.
 */
export class Director {
  private queue: Job[] = []
  private running = false
  private disposed = false
  private activeJob: Job | null = null
  private currentHandle: JobHandle | null = null
  private readonly onIdle?: () => void
  private readonly onScaleChange?: (scale: number) => void

  constructor(options?: { onIdle?: () => void; onScaleChange?: (scale: number) => void }) {
    this.onIdle = options?.onIdle
    this.onScaleChange = options?.onScaleChange
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', this.onScroll, { passive: true })
    }
  }

  enqueue(job: Job) {
    if (this.disposed) return
    this.queue.push(job)
    this.queue.sort(compareVisualOrder)
    this.syncSpeed()
    this.pump()
  }

  hasPending() {
    return this.queue.length > 0
  }

  dispose() {
    this.disposed = true
    this.queue.length = 0
    this.currentHandle?.kill()
    this.currentHandle = null
    this.activeJob = null
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.onScroll)
    }
  }

  private onScroll = () => {
    if (!this.running || this.disposed) return
    this.syncSpeed()
  }

  private computeTimeScale = () => {
    const queueBoost = 1 + this.queue.length * 0.85
    let scrollBoost = 1

    if (this.activeJob) {
      const scrollY = window.scrollY
      if (this.activeJob.force && scrollY > 80) {
        scrollBoost = 2.6 + Math.min(2.4, scrollY / 220)
      } else if (this.activeJob.el) {
        const rect = this.activeJob.el.getBoundingClientRect()
        if (rect.top < 24) {
          scrollBoost = 2.4 + Math.min(2.6, Math.abs(rect.top) / 140)
        }
      }
    }

    return Math.min(5, Math.max(queueBoost, scrollBoost))
  }

  private syncSpeed() {
    if (!this.running) return
    const scale = this.computeTimeScale()
    this.currentHandle?.setTimeScale?.(scale)
    this.onScaleChange?.(scale)
  }

  private pump() {
    if (this.running || this.disposed) return

    let job = this.queue.shift()
    while (job && !job.force && job.el && !inViewport(job.el)) {
      job.instant()
      job = this.queue.shift()
    }
    if (!job) {
      this.onScaleChange?.(1)
      this.onIdle?.()
      return
    }

    this.running = true
    this.activeJob = job

    const finishJob = () => {
      this.running = false
      this.activeJob = null
      this.currentHandle = null
      this.pump()
    }

    const initialScale = this.computeTimeScale()
    this.onScaleChange?.(initialScale)

    if (job.run) {
      const res = job.run(finishJob, this.computeTimeScale)
      this.currentHandle = typeof res === 'function' ? { kill: res } : res
      this.syncSpeed()
      return
    }

    const tl = gsap.timeline({ onComplete: finishJob })
    job.build?.(tl)
    tl.timeScale(initialScale)
    this.currentHandle = {
      kill: () => tl.kill(),
      setTimeScale: (scale) => tl.timeScale(scale),
    }
  }
}
