import { useRef } from 'react'
import { CharacterPortrait } from '../components/character/CharacterPortrait'
import { ArrowUpRightIcon, SocialIcon } from '../components/icons/PortfolioIcons'
import { ExperienceItem } from '../components/portfolio/ExperienceItem'
import { ProjectItem } from '../components/portfolio/ProjectItem'
import { CollaborativeCursors } from '../components/ui/CollaborativeCursors'
import { MotionToggle } from '../components/ui/MotionToggle'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { TypedText } from '../components/ui/TypedText'
import { NAV_ITEMS, type SectionId } from '../config/navigation'
import {
  ABOUT_PARAGRAPHS,
  EXPERIENCES,
  PROFILE,
  PROJECTS,
  SOCIAL_LINKS,
} from '../config/portfolio'
import { useActiveSection } from '../hooks/useActiveSection'
import { useCollaborativeBuild } from '../hooks/useCollaborativeBuild'
import { useReducedMotion } from '../hooks/useReducedMotion'
import { useTheme } from '../hooks/useTheme'

const SECTION_IDS: SectionId[] = NAV_ITEMS.map((item) => item.id)

const MOBILE_STICKY_HEADING_CLASS =
  'sticky top-[calc(var(--frame-inset-top)+var(--frame-border-width))] z-10 -ml-[calc(var(--frame-inset-left)+1.75rem)] -mr-[calc(var(--frame-inset-right)+1.75rem)] mb-4 bg-canvas/85 py-3.5 pl-[calc(var(--frame-inset-left)+1.75rem)] pr-[calc(var(--frame-inset-right)+6rem)] text-xs font-bold uppercase tracking-widest text-accent-light backdrop-blur-md sm:-ml-14 sm:-mr-20 sm:pl-14 sm:pr-24 md:-ml-20 md:-mr-24 md:pl-20 md:pr-28 lg:static lg:m-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none lg:sr-only'

export function HeroSection() {
  const [activeSection, setActiveSection] = useActiveSection(SECTION_IDS)
  const { isDark, toggleTheme } = useTheme()
  const { reducedMotion, toggleReducedMotion } = useReducedMotion()

  const rootRef = useRef<HTMLDivElement>(null)
  const aiCursorRef = useRef<HTMLDivElement>(null)
  const larissaCursorRef = useRef<HTMLDivElement>(null)
  const aiBoxRef = useRef<HTMLDivElement>(null)
  const aiDimRef = useRef<HTMLSpanElement>(null)
  const larissaBoxRef = useRef<HTMLDivElement>(null)

  useCollaborativeBuild(
    rootRef,
    {
      aiCursorRef,
      larissaCursorRef,
      aiBoxRef,
      aiDimRef,
      larissaBoxRef,
    },
    reducedMotion,
  )

  return (
    <div ref={rootRef} className="relative min-h-svh w-full bg-canvas">
      <CollaborativeCursors
        aiCursorRef={aiCursorRef}
        larissaCursorRef={larissaCursorRef}
        aiBoxRef={aiBoxRef}
        aiDimRef={aiDimRef}
        larissaBoxRef={larissaBoxRef}
      />

      <div
        aria-hidden="true"
        className="viewport-frame-inset viewport-frame-fill pointer-events-none z-20"
      />
      <div
        data-build="border"
        aria-hidden="true"
        className="viewport-frame-inset viewport-frame-border pointer-events-none z-20"
      />

      <div className="fixed top-[calc(var(--frame-inset-top)+0.85rem)] right-[calc(var(--frame-inset-right)+0.85rem)] z-30 flex items-center gap-2">
        <MotionToggle
          reducedMotion={reducedMotion}
          onToggle={toggleReducedMotion}
        />
        <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
      </div>

      <div className="relative z-10 mx-auto max-w-screen-xl pt-[calc(var(--frame-inset-top)+4.25rem)] pr-[calc(var(--frame-inset-right)+1.75rem)] pb-[calc(var(--frame-inset-bottom)+3rem)] pl-[calc(var(--frame-inset-left)+1.75rem)] sm:px-14 sm:pt-20 sm:pr-20 md:px-20 md:pr-24 lg:flex lg:justify-between lg:gap-8 lg:px-24 lg:py-0">
        <header
          data-build="header"
          className="lg:sticky lg:top-0 lg:flex lg:max-h-screen lg:w-[46%] lg:flex-col lg:justify-start lg:pt-16 lg:pb-12 xl:pt-20"
        >
          <div>
            <h1
              data-build="hero-name"
              aria-label={PROFILE.name}
              className="text-4xl font-bold tracking-tight text-ink sm:text-[2.5rem] sm:leading-[1.1]"
            >
              <TypedText text={PROFILE.name} group="hero-name" />
            </h1>
            <h2
              data-build="hero-role"
              aria-label={PROFILE.role}
              className="mt-2 text-lg font-medium tracking-tight text-ink-secondary sm:text-xl"
            >
              <TypedText text={PROFILE.role} group="hero-role" />
            </h2>
            <p
              data-build="hero-tagline"
              aria-label={PROFILE.tagline}
              className="mt-2.5 max-w-xs text-sm leading-relaxed text-ink-muted"
            >
              <TypedText text={PROFILE.tagline} group="hero-tagline" />
            </p>

            <nav aria-label="Navegação da página" className="mt-6 hidden lg:mt-8 lg:block">
              <ul className="w-max space-y-0.5">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeSection === item.id
                  return (
                    <li key={item.id}>
                      <a
                        data-build="nav-item"
                        href={`#${item.id}`}
                        aria-label={item.label}
                        onClick={() => setActiveSection(item.id)}
                        className="group flex items-center py-1.5 focus-visible:outline-none"
                      >
                        <span
                          data-build="nav-line"
                          aria-hidden="true"
                          className={`mr-4 transition-[width,height,background-color] duration-200 motion-reduce:transition-none ${
                            isActive
                              ? 'h-[3px] w-16 bg-accent'
                              : 'h-[2px] w-8 bg-line group-not-data-[building=true]:group-hover:w-16 group-not-data-[building=true]:group-hover:bg-accent group-focus-visible:w-16 group-focus-visible:bg-accent'
                          }`}
                        />
                        <span
                          className={`text-xs font-bold uppercase tracking-widest transition-colors ${
                            isActive
                              ? 'text-ink'
                              : 'text-ink-muted group-not-data-[building=true]:group-hover:text-ink group-focus-visible:text-ink'
                          }`}
                        >
                          <TypedText text={item.label} group={`nav-${item.id}`} />
                        </span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <ul
              aria-label="Redes sociais"
              className="mt-5 flex items-center gap-4 lg:mt-6"
            >
              {SOCIAL_LINKS.map((link) => (
                <li key={link.id}>
                  <a
                    data-build="social-item"
                    href={link.href}
                    target={link.id === 'email' ? undefined : '_blank'}
                    rel={link.id === 'email' ? undefined : 'noreferrer noopener'}
                    aria-label={link.label}
                    title={link.label}
                    className="inline-flex size-9 items-center justify-center rounded-sm border border-line bg-accent-soft text-accent-light transition-colors hover:border-accent hover:bg-accent hover:text-on-accent focus-visible:border-accent focus-visible:bg-accent focus-visible:text-on-accent data-[building=true]:border-line! data-[building=true]:bg-accent-soft! data-[building=true]:text-accent-light!"
                  >
                    <SocialIcon id={link.id} className="size-4.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </header>

        <div className="pt-12 lg:w-[54%] lg:py-16 xl:py-20">
          <section
            id="about"
            data-build="about-section"
            aria-label="Sobre mim"
            className="mb-16 scroll-mt-16 md:mb-24 lg:mb-32 lg:scroll-mt-24"
          >
            <h2
              data-build="section-heading"
              aria-label="Sobre mim"
              className={`${MOBILE_STICKY_HEADING_CLASS} lg:mb-4`}
            >
              <TypedText text="Sobre mim" group="about-heading" />
            </h2>
            <div className="space-y-4 text-[0.95rem] leading-[1.65] text-ink-secondary">
              {ABOUT_PARAGRAPHS.map((paragraph, index) => (
                <p key={paragraph} data-build="about-paragraph" aria-label={paragraph}>
                  <TypedText text={paragraph} group={`about-${index}`} />
                </p>
              ))}
            </div>
          </section>

          <section
            id="experience"
            aria-label="Experiencia"
            className="mb-16 scroll-mt-16 md:mb-24 lg:mb-32 lg:scroll-mt-24"
          >
            <h2
              data-build="section-heading"
              aria-label="Experiencia"
              className={`${MOBILE_STICKY_HEADING_CLASS} lg:mb-6`}
            >
              <TypedText text="Experiencia" group="experience-heading" />
            </h2>
            <ol className="space-y-12 lg:[&:has(>li:not([data-building='true']):hover)>li:not([data-building='true']):not(:hover)]:opacity-55">
              {EXPERIENCES.map((experience) => (
                <ExperienceItem
                  key={`${experience.company}-${experience.period}`}
                  experience={experience}
                />
              ))}
            </ol>
            <div className="mt-10">
              <a
                data-build="cta-link"
                href={PROFILE.resumeHref}
                className="group inline-flex items-center gap-1.5 font-semibold leading-tight text-ink transition-colors hover:text-accent-light focus-visible:text-accent-light data-[building=true]:text-ink!"
              >
                <span>{PROFILE.resumeLabel}</span>
                <ArrowUpRightIcon className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-focus-visible:-translate-y-0.5 group-focus-visible:translate-x-0.5" />
              </a>
            </div>
          </section>

          <section
            id="projects"
            aria-label="Projetos"
            className="mb-16 scroll-mt-16 md:mb-24 lg:mb-32 lg:scroll-mt-24"
          >
            <h2
              data-build="section-heading"
              aria-label="Projetos"
              className={`${MOBILE_STICKY_HEADING_CLASS} lg:mb-6`}
            >
              <TypedText text="Projetos" group="projects-heading" />
            </h2>
            <ul className="space-y-12 lg:[&:has(>li:not([data-building='true']):hover)>li:not([data-building='true']):not(:hover)]:opacity-55">
              {PROJECTS.map((project) => (
                <ProjectItem key={project.title} project={project} />
              ))}
            </ul>
            <div className="mt-10">
              <a
                data-build="cta-link"
                href={PROFILE.projectsArchiveHref}
                target="_blank"
                rel="noreferrer noopener"
                className="group inline-flex items-center gap-1.5 font-semibold leading-tight text-ink transition-colors hover:text-accent-light focus-visible:text-accent-light data-[building=true]:text-ink!"
              >
                <span>{PROFILE.projectsArchiveLabel}</span>
                <ArrowUpRightIcon className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-focus-visible:-translate-y-0.5 group-focus-visible:translate-x-0.5" />
              </a>
            </div>
          </section>

          <footer
            data-build="footer"
            className="max-w-md pb-8 text-xs leading-relaxed text-ink-muted sm:pb-0"
          >
            <p>
              Desenvolvido por {PROFILE.name} com React, TypeScript, Tailwind CSS
              e GSAP.
            </p>
          </footer>
        </div>
      </div>

      <div className="relative z-30 overflow-hidden lg:overflow-visible">
        <CharacterPortrait
          flipped
          reducedMotion={reducedMotion}
          className="relative z-30 -mx-4 translate-y-[12%] w-[min(100%,24rem)] lg:fixed lg:left-0 lg:bottom-0 lg:mx-0 lg:w-[clamp(8rem,var(--portrait-max-by-height),25rem)] xl:w-[clamp(8rem,var(--portrait-max-by-height),29rem)] 3xl:w-[clamp(8rem,var(--portrait-max-by-height),37rem)]"
        />
      </div>
    </div>
  )
}
