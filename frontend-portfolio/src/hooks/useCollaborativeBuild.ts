import { useLayoutEffect, useRef, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Director, type Job, type JobHandle } from '../animation/collab/director'
import { Marquee, VirtualCursor } from '../animation/collab/cursor'
import {
  centerOf,
  drawFrame,
  flash,
  hideChars,
  layoutRect,
  popIn,
  settle,
  typeText,
  unionRect,
} from '../animation/collab/primitives'
import {
  runCollabTasks,
  sortReadingOrder,
  type CollabTask,
  type CursorActor,
} from '../animation/collab/scheduler'
import type { CollaborativeCursorRefs } from '../components/ui/CollaborativeCursors'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

const isRendered = (el: Element | null): el is HTMLElement => {
  if (!el) return false
  const r = el.getBoundingClientRect()
  return r.width > 4 && r.height > 4
}

/**
 * Edição colaborativa simulada: cursor "IA" e cursor "Larissa".
 *
 * Regras de sincronização:
 *  - Abertura em 2 etapas: primeiro a IA desenha a borda do viewport; depois
 *    a IA cria a imagem enquanto Larissa inicia o conteúdo interno.
 *  - Quando um cursor termina sua tarefa, ele consulta a fila ordenada
 *    (da esquerda para a direita, de cima para baixo) e pega o próximo item
 *    disponível — se o outro cursor já estiver atuando nele, pula para o seguinte.
 *  - Blocos abaixo da dobra entram em fila única (`Director`) conforme o usuário rola.
 */
export function useCollaborativeBuild(
  rootRef: RefObject<HTMLElement | null>,
  cursorRefs: CollaborativeCursorRefs,
  reducedMotion = false,
) {
  const { aiCursorRef, larissaCursorRef, aiBoxRef, aiDimRef, larissaBoxRef } = cursorRefs
  const introDoneRef = useRef(false)
  const builtElsRef = useRef(new WeakSet<HTMLElement>())

  useLayoutEffect(() => {
    const root = rootRef.current
    const aiEl = aiCursorRef.current
    const larEl = larissaCursorRef.current
    const aiBoxEl = aiBoxRef.current
    const larBoxEl = larissaBoxRef.current
    if (!root || !aiEl || !larEl || !aiBoxEl || !larBoxEl) return

    const builtEls = builtElsRef.current
    const markSettled = (...els: Array<Element | null | undefined>) => {
      for (const el of els) {
        if (!el) continue
        if (el instanceof HTMLElement) builtEls.add(el)
        el.querySelectorAll<HTMLElement>('[data-build]').forEach((child) => {
          builtEls.add(child)
        })
      }
    }

    if (reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      introDoneRef.current = true
      gsap.set([aiEl, larEl, aiBoxEl, larBoxEl], {
        autoAlpha: 0,
        clearProps: 'transform,width,height',
      })
      settle(root)
      markSettled(root)
      return
    }

    let ai: VirtualCursor | null = null
    let lar: VirtualCursor | null = null
    let aiBox: Marquee | null = null
    let larBox: Marquee | null = null

    const director = new Director({
      onIdle: () => {
        ai?.fadeOut()
        lar?.fadeOut()
      },
      onScaleChange: (scale) => {
        ai?.setSpeed(scale)
        lar?.setSpeed(scale)
      },
    })

    const ctx = gsap.context(() => {
      ai = new VirtualCursor(aiEl)
      lar = new VirtualCursor(larEl)
      aiBox = new Marquee(aiBoxEl, aiDimRef.current)
      larBox = new Marquee(larBoxEl)
      ai.setMode('pointer')

      const actors: { ai: CursorActor; lar: CursorActor } = {
        ai: { role: 'ai', cursor: ai, marquee: aiBox },
        lar: { role: 'lar', cursor: lar, marquee: larBox },
      }

      const one = <T extends HTMLElement>(sel: string, scope: ParentNode = root) =>
        scope.querySelector<T>(sel)
      const all = <T extends HTMLElement>(sel: string, scope: ParentNode = root) =>
        Array.from(scope.querySelectorAll<T>(sel))

      const borderEl = one('[data-build="border"]')
      const portraitEl = one('[data-build="portrait"]')
      const headerEl = one('[data-build="header"]')
      const aboutSection = one('[data-build="about-section"]')
      const footerEl = one('[data-build="footer"]')
      const navItems = all('[data-build="nav-item"]')
      const socialItems = all('[data-build="social-item"]')
      const experienceItems = all('[data-build="experience-item"]')
      const projectItems = all('[data-build="project-item"]')
      const ctaLinks = all('[data-build="cta-link"]')
      const headings = all('[data-build="section-heading"]')

      /* ----- estado inicial: oculta apenas o que ainda não foi construído ----- */
      const hideIfUnbuilt = (el: HTMLElement | null) => {
        if (!el || builtEls.has(el)) return
        hideChars(el)
        gsap.set(el, { autoAlpha: 0 })
      }

      if (!introDoneRef.current) {
        hideChars(root)
        gsap.set([borderEl, portraitEl, footerEl, ...ctaLinks].filter(Boolean), { autoAlpha: 0 })
        gsap.set(socialItems, { autoAlpha: 0, scale: 0.6 })
        gsap.set(all('[data-build="nav-line"]'), { scaleX: 0, transformOrigin: 'left center' })
        gsap.set(all('[data-build="tech-tag"]'), { autoAlpha: 0, scale: 0.8 })
        gsap.set(all('[data-build="project-arrow"]'), { autoAlpha: 0, scale: 0.5 })
        gsap.set(all('[data-build="project-badge"]'), { autoAlpha: 0 })
        ;[...experienceItems, ...projectItems, ...navItems, ...socialItems, ...ctaLinks].forEach(
          (el) => {
            el.dataset.building = 'true'
          },
        )
      } else {
        // Caso o usuário tenha desativado e reativado animações, garante estado limpo sem replay da abertura.
        settle(borderEl, portraitEl, headerEl, aboutSection)
        ;[...experienceItems, ...projectItems, ...ctaLinks].forEach((el) => {
          if (builtEls.has(el)) settle(el)
          else {
            el.dataset.building = 'true'
            hideIfUnbuilt(el)
          }
        })
        if (footerEl && builtEls.has(footerEl)) settle(footerEl)
      }

      const makeTagsTask = (tags: HTMLElement[]): CollabTask | null => {
        const tagsBox = tags[0]?.closest('ul') ?? null
        if (!tags.length || !tagsBox) return null
        return {
          el: tagsBox,
          run: (tl, actor) => {
            actor.cursor.travel(tl, () => centerOf(tagsBox, 0.1, 0.5), 0.36)
            flash(tl, actor.marquee, () => unionRect([tagsBox]), 4, '>')
            popIn(tl, tags, { at: '<', stagger: 0.05 })
          },
        }
      }

      // Cada elemento é registrado uma vez: entra na fila quando o usuário o alcança.
      const register = (el: HTMLElement, job: Omit<Job, 'el'>) => {
        if (builtEls.has(el)) {
          settle(el)
          return
        }
        let fired = false
        const fire = () => {
          if (fired || builtEls.has(el)) return
          fired = true
          director.enqueue({
            el,
            ...job,
            instant: () => {
              job.instant()
              markSettled(el)
            },
          })
        }
        if (el.getBoundingClientRect().top < window.innerHeight * 0.88) {
          fire()
          return
        }
        ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: fire })
      }

      /* ================================================================ */
      /* Abertura: IA cria a borda; depois IA e Larissa colaboram         */
      /* em ordem de leitura (esquerda -> direita, cima -> baixo)         */
      /* ================================================================ */
      const portraitRect = portraitEl?.getBoundingClientRect()
      const portraitAboveFold =
        !!portraitRect && portraitRect.top < window.innerHeight * 0.98 && portraitRect.bottom > 0

      if (!introDoneRef.current) {
        director.enqueue({
          el: null,
          force: true,
          instant: () => {
            introDoneRef.current = true
            settle(borderEl, portraitEl, headerEl, aboutSection)
            markSettled(borderEl, portraitEl, headerEl, aboutSection)
          },
          run: (done, getTimeScale) => {
          let cancelled = false
          let collabHandle: JobHandle | null = null
          let currentScale = getTimeScale()

          const borderTl = gsap.timeline({
            onComplete: () => {
              if (cancelled) return
              settle(borderEl)

              const leftTasks: CollabTask[] = []
              const rightTasks: CollabTask[] = []

              const nameEl = headerEl ? one('[data-build="hero-name"]', headerEl) : null
              const roleEl = headerEl ? one('[data-build="hero-role"]', headerEl) : null
              const taglineEl = headerEl ? one('[data-build="hero-tagline"]', headerEl) : null

              if (nameEl) {
                leftTasks.push({
                  el: nameEl,
                  run: (tl, actor) => typeText(tl, actor.cursor, nameEl, { cps: 38 }),
                })
              }
              if (roleEl) {
                leftTasks.push({
                  el: roleEl,
                  run: (tl, actor) => typeText(tl, actor.cursor, roleEl, { cps: 55 }),
                })
              }
              if (taglineEl) {
                leftTasks.push({
                  el: taglineEl,
                  run: (tl, actor) => typeText(tl, actor.cursor, taglineEl, { cps: 95 }),
                })
              }

              sortReadingOrder(navItems.map((el) => ({ el }))).forEach(({ el: item }) => {
                if (!isRendered(item)) {
                  settle(item)
                  markSettled(item)
                  return
                }
                const line = one('[data-build="nav-line"]', item)
                leftTasks.push({
                  el: item,
                  run: (tl, actor) => {
                    actor.cursor.travel(
                      tl,
                      () => {
                        const r = item.getBoundingClientRect()
                        return { x: r.left, y: r.top + r.height * 0.5 }
                      },
                      0.22,
                    )
                    if (line) {
                      tl.to(
                        line,
                        { scaleX: 1, duration: 0.22, ease: 'power3.out', clearProps: 'transform' },
                        '<+0.04',
                      )
                    }
                    typeText(tl, actor.cursor, item, { cps: 60, at: '>-0.08', travel: 0.14 })
                  },
                })
              })

              sortReadingOrder(socialItems.map((el) => ({ el }))).forEach(({ el: icon }) => {
                leftTasks.push({
                  el: icon,
                  run: (tl, actor) => {
                    actor.cursor.travel(tl, () => centerOf(icon, 0.6, 0.6), 0.22)
                    flash(tl, actor.marquee, () => layoutRect(icon), 3, '>-0.02')
                    popIn(tl, [icon], { at: '<', duration: 0.32 })
                  },
                })
              })

              const aboutHeading = aboutSection
                ? one('[data-build="section-heading"]', aboutSection)
                : null
              if (aboutHeading) {
                if (isRendered(aboutHeading)) {
                  rightTasks.push({
                    el: aboutHeading,
                    run: (tl, actor) => typeText(tl, actor.cursor, aboutHeading, { cps: 45 }),
                  })
                } else {
                  settle(aboutHeading)
                }
              }

              const aboutParagraphs = aboutSection
                ? all('[data-build="about-paragraph"]', aboutSection)
                : []
              sortReadingOrder(aboutParagraphs.map((el) => ({ el }))).forEach(({ el: p }) => {
                rightTasks.push({
                  el: p,
                  run: (tl, actor) => typeText(tl, actor.cursor, p, { cps: 220 }),
                })
              })

              const isTwoColumn =
                !!headerEl &&
                !!aboutSection &&
                aboutSection.getBoundingClientRect().left > headerEl.getBoundingClientRect().right - 24

              const orderedContentTasks = isTwoColumn
                ? [...sortReadingOrder(leftTasks), ...sortReadingOrder(rightTasks)]
                : sortReadingOrder([...leftTasks, ...rightTasks])

              const stage2Tasks: CollabTask[] = []
              if (portraitEl && portraitAboveFold) {
                stage2Tasks.push({
                  el: portraitEl,
                  only: 'ai',
                  run: (tl, actor) =>
                    drawFrame(tl, {
                      cursor: actor.cursor,
                      marquee: actor.marquee,
                      target: portraitEl,
                      duration: 0.85,
                    }),
                })
              }
              stage2Tasks.push(...orderedContentTasks)

              collabHandle = runCollabTasks(stage2Tasks, actors, {
                larDelay: portraitAboveFold ? 0.35 : 0,
                getTimeScale: () => currentScale,
                onDone: () => {
                  introDoneRef.current = true
                  settle(borderEl, portraitEl, headerEl, aboutSection)
                  markSettled(borderEl, portraitEl, headerEl, aboutSection)
                  done()
                },
              })
            },
          })

          if (borderEl) {
            drawFrame(borderTl, {
              cursor: actors.ai.cursor,
              marquee: actors.ai.marquee,
              target: borderEl,
              duration: 1.05,
              at: 0.2,
            })
          }
          borderTl.timeScale(currentScale)

          return {
            setTimeScale: (scale) => {
              currentScale = scale
              borderTl.timeScale(scale)
              collabHandle?.setTimeScale?.(scale)
            },
            kill: () => {
              cancelled = true
              borderTl.kill()
              collabHandle?.kill()
            },
          }
        },
        })
      }

      const finishNode = (el: Element) => {
        settle(el)
        markSettled(el)
      }

      // Mobile: a imagem fica abaixo da dobra -> IA a desenha quando o usuário chega nela.
      if (portraitEl && !portraitAboveFold) {
        register(portraitEl, {
          instant: () => finishNode(portraitEl),
          build: (tl) => {
            drawFrame(tl, {
              cursor: actors.ai.cursor,
              marquee: actors.ai.marquee,
              target: portraitEl,
              duration: 0.8,
            })
            tl.add(() => finishNode(portraitEl))
          },
        })
      }

      /* ================================================================ */
      /* Ao rolar: cada bloco é construído em ordem de leitura             */
      /* ================================================================ */
      const registerHeading = (heading: HTMLElement) => {
        if (!isRendered(heading)) {
          finishNode(heading)
          return
        }
        register(heading, {
          instant: () => finishNode(heading),
          build: (tl) => {
            typeText(tl, actors.lar.cursor, heading, { cps: 45 })
            tl.add(() => finishNode(heading))
          },
        })
      }

      const registerExperience = (item: HTMLElement) => {
        register(item, {
          instant: () => finishNode(item),
          run: (done, getTimeScale) => {
            const period = one('[data-build="exp-period"]', item)
            const title = one('[data-build="exp-title"]', item)
            const desc = one('[data-build="exp-desc"]', item)
            const tags = all('[data-build="tech-tag"]', item)

            const rawTasks: CollabTask[] = []
            if (period) {
              rawTasks.push({
                el: period,
                run: (tl, actor) => typeText(tl, actor.cursor, period, { cps: 55 }),
              })
            }
            if (title) {
              rawTasks.push({
                el: title,
                run: (tl, actor) => typeText(tl, actor.cursor, title, { cps: 60 }),
              })
            }
            if (desc) {
              rawTasks.push({
                el: desc,
                run: (tl, actor) => typeText(tl, actor.cursor, desc, { cps: 200 }),
              })
            }
            const tagsTask = makeTagsTask(tags)
            if (tagsTask) rawTasks.push(tagsTask)

            const sorted = sortReadingOrder(rawTasks)
            return runCollabTasks(sorted, actors, {
              larDelay: 0.1,
              getTimeScale,
              onDone: () => {
                finishNode(item)
                done()
              },
            })
          },
        })
      }

      const registerProject = (item: HTMLElement) => {
        register(item, {
          instant: () => finishNode(item),
          run: (done, getTimeScale) => {
            const badge = one('[data-build="project-badge"]', item)
            const title = one('[data-build="project-title"]', item)
            const arrow = one('[data-build="project-arrow"]', item)
            const desc = one('[data-build="project-desc"]', item)
            const tags = all('[data-build="tech-tag"]', item)

            const rawTasks: CollabTask[] = []
            if (badge) {
              rawTasks.push({
                el: badge,
                only: 'ai',
                run: (tl, actor) =>
                  drawFrame(tl, {
                    cursor: actor.cursor,
                    marquee: actor.marquee,
                    target: badge,
                    duration: 0.55,
                  }),
              })
            }
            if (title) {
              rawTasks.push({
                el: title,
                run: (tl, actor) => {
                  typeText(tl, actor.cursor, title, { cps: 60 })
                  if (arrow) popIn(tl, [arrow], { at: '>-0.05', duration: 0.3 })
                },
              })
            }
            if (desc) {
              rawTasks.push({
                el: desc,
                run: (tl, actor) => typeText(tl, actor.cursor, desc, { cps: 200 }),
              })
            }
            const tagsTask = makeTagsTask(tags)
            if (tagsTask) rawTasks.push(tagsTask)

            const sorted = sortReadingOrder(rawTasks)
            return runCollabTasks(sorted, actors, {
              larDelay: badge ? 0.2 : 0,
              getTimeScale,
              onDone: () => {
                finishNode(item)
                done()
              },
            })
          },
        })
      }

      const registerCta = (link: HTMLElement) => {
        register(link, {
          instant: () => finishNode(link),
          build: (tl) => {
            actors.lar.cursor.travel(
              tl,
              () => {
                const r = link.getBoundingClientRect()
                return { x: r.left, y: r.top + r.height * 0.5 }
              },
              0.42,
              0,
            )
            flash(tl, actors.lar.marquee, () => link.getBoundingClientRect(), 6, '>')
            tl.to(
              link,
              { autoAlpha: 1, duration: 0.38, ease: 'power2.out', clearProps: 'opacity,visibility' },
              '<+0.05',
            )
            tl.add(() => finishNode(link))
          },
        })
      }

      // Ordem do documento: experiência -> projetos -> rodapé.
      const experienceSection = one('#experience')
      const projectsSection = one('#projects')
      const inSection = (section: HTMLElement | null, el: HTMLElement) => !!section?.contains(el)

      const sectionHeadingsFor = (section: HTMLElement | null) =>
        headings.filter((h) => inSection(section, h))
      const ctasFor = (section: HTMLElement | null) => ctaLinks.filter((c) => inSection(section, c))

      sectionHeadingsFor(experienceSection).forEach(registerHeading)
      experienceItems.forEach(registerExperience)
      ctasFor(experienceSection).forEach(registerCta)

      sectionHeadingsFor(projectsSection).forEach(registerHeading)
      projectItems.forEach(registerProject)
      ctasFor(projectsSection).forEach(registerCta)

      if (footerEl) {
        register(footerEl, {
          instant: () => finishNode(footerEl),
          build: (tl) => {
            tl.to(footerEl, {
              autoAlpha: 1,
              duration: 0.45,
              ease: 'power2.out',
              clearProps: 'opacity,visibility',
              onComplete: () => finishNode(footerEl),
            })
          },
        })
      }
    }, root)

    const blockUnbuiltClick = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest('[data-building="true"]')) {
        event.preventDefault()
      }
    }
    root.addEventListener('click', blockUnbuiltClick, true)

    return () => {
      root.removeEventListener('click', blockUnbuiltClick, true)
      director.dispose()
      ai?.dispose()
      lar?.dispose()
      aiBox?.dispose()
      larBox?.dispose()
      ctx.revert()
    }
  }, [rootRef, aiCursorRef, larissaCursorRef, aiBoxRef, aiDimRef, larissaBoxRef, reducedMotion])
}
