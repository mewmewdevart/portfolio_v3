import gsap from 'gsap'
import type { Marquee, VirtualCursor } from './cursor'
import type { JobHandle } from './director'
import { settle } from './primitives'

export type CursorRole = 'ai' | 'lar'

export type CursorActor = {
  role: CursorRole
  cursor: VirtualCursor
  marquee: Marquee
}

export type CollabTask = {
  el: HTMLElement
  /** Restringe a tarefa a um cursor específico (ex.: moldura/imagem só com IA). */
  only?: CursorRole
  /** Monta a animação deste item usando o cursor atribuído. */
  run: (tl: gsap.core.Timeline, actor: CursorActor) => void
}

/** Ordena elementos na ordem de leitura: de cima para baixo, da esquerda para a direita. */
export function sortReadingOrder<T extends { el: HTMLElement }>(items: T[], bandPx = 28): T[] {
  return [...items].sort((a, b) => {
    const ra = a.el.getBoundingClientRect()
    const rb = b.el.getBoundingClientRect()
    const bandA = Math.floor(ra.top / bandPx)
    const bandB = Math.floor(rb.top / bandPx)
    if (bandA !== bandB) return bandA - bandB
    return ra.left - rb.left
  })
}

type WorkerState = {
  actor: CursorActor
  busy: boolean
  enabled: boolean
  tl: gsap.core.Timeline | null
}

/**
 * Despachante dinâmico para os dois cursores (`IA` e `Larissa`).
 *
 * Ambos consomem a mesma lista ordenada (esquerda -> direita, cima -> baixo).
 * Quando um cursor termina sua tarefa, ele percorre a lista do início e pega
 * o primeiro item ainda pendente — se o outro cursor já estiver atuando nele,
 * pula automaticamente para o próximo.
 */
export function runCollabTasks(
  tasks: CollabTask[],
  actors: { ai: CursorActor; lar: CursorActor },
  options: {
    larDelay?: number
    aiDelay?: number
    getTimeScale?: () => number
    onDone: () => void
  },
): JobHandle {
  const states: Array<'pending' | 'active' | 'done'> = tasks.map(() => 'pending')
  const { larDelay = 0, aiDelay = 0, getTimeScale = () => 1, onDone } = options

  let disposed = false
  let completed = false
  let currentScale = getTimeScale()

  const workers: Record<CursorRole, WorkerState> = {
    ai: { actor: actors.ai, busy: false, enabled: aiDelay <= 0, tl: null },
    lar: { actor: actors.lar, busy: false, enabled: larDelay <= 0, tl: null },
  }

  const delayedCalls: gsap.core.Tween[] = []

  const checkDone = () => {
    if (completed || disposed) return
    if (!workers.ai.busy && !workers.lar.busy && states.every((s) => s === 'done')) {
      completed = true
      onDone()
    }
  }

  const pumpWorker = (role: CursorRole) => {
    const worker = workers[role]
    if (disposed || !worker.enabled || worker.busy) return

    const nextIndex = states.findIndex(
      (state, idx) => state === 'pending' && (!tasks[idx].only || tasks[idx].only === role),
    )

    if (nextIndex === -1) {
      checkDone()
      return
    }

    const task = tasks[nextIndex]
    states[nextIndex] = 'active'
    worker.busy = true

    const tl = gsap.timeline({
      onComplete: () => {
        if (disposed) return
        states[nextIndex] = 'done'
        settle(task.el)
        worker.busy = false
        worker.tl = null
        pumpAll()
      },
    })

    worker.tl = tl
    task.run(tl, worker.actor)
    tl.timeScale(currentScale)
  }

  const pumpAll = () => {
    if (disposed) return
    pumpWorker('ai')
    pumpWorker('lar')
    checkDone()
  }

  if (aiDelay > 0) {
    const d = gsap.delayedCall(aiDelay, () => {
      workers.ai.enabled = true
      pumpAll()
    })
    d.timeScale(currentScale)
    delayedCalls.push(d)
  }

  if (larDelay > 0) {
    const d = gsap.delayedCall(larDelay, () => {
      workers.lar.enabled = true
      pumpAll()
    })
    d.timeScale(currentScale)
    delayedCalls.push(d)
  }

  pumpAll()

  return {
    setTimeScale: (scale: number) => {
      currentScale = scale
      delayedCalls.forEach((d) => d.timeScale(scale))
      workers.ai.tl?.timeScale(scale)
      workers.lar.tl?.timeScale(scale)
    },
    kill: () => {
      disposed = true
      delayedCalls.forEach((d) => d.kill())
      workers.ai.tl?.kill()
      workers.lar.tl?.kill()
    },
  }
}
