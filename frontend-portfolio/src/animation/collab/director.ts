import gsap from 'gsap'

export type Job = {
  /** Elemento observado: se já saiu da tela quando chegar a vez, o job vira "instantâneo". */
  el: HTMLElement | null
  /** Ignora a checagem de tela (abertura). */
  force?: boolean
  build?: (tl: gsap.core.Timeline) => void
  run?: (done: () => void, getTimeScale: () => number) => () => void
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
 * para trás são revelados sem animação, e quando há fila acumulada a próxima
 * coreografia roda um pouco mais rápido.
 */
export class Director {
  private queue: Job[] = []
  private running = false
  private disposed = false
  private currentKill: (() => void) | null = null
  private readonly onIdle?: () => void

  constructor(onIdle?: () => void) {
    this.onIdle = onIdle
  }

  enqueue(job: Job) {
    if (this.disposed) return
    this.queue.push(job)
    this.queue.sort(compareVisualOrder)
    this.pump()
  }

  hasPending() {
    return this.queue.length > 0
  }

  dispose() {
    this.disposed = true
    this.queue.length = 0
    this.currentKill?.()
    this.currentKill = null
  }

  private getTimeScale = () => Math.min(2.2, 1 + this.queue.length * 0.6)

  private pump() {
    if (this.running || this.disposed) return

    let job = this.queue.shift()
    while (job && !job.force && job.el && !inViewport(job.el)) {
      job.instant()
      job = this.queue.shift()
    }
    if (!job) {
      this.onIdle?.()
      return
    }

    this.running = true
    const finishJob = () => {
      this.running = false
      this.currentKill = null
      this.pump()
    }

    if (job.run) {
      this.currentKill = job.run(finishJob, this.getTimeScale)
      return
    }

    const tl = gsap.timeline({ onComplete: finishJob })
    job.build?.(tl)
    tl.timeScale(this.getTimeScale())
    this.currentKill = () => tl.kill()
  }
}
