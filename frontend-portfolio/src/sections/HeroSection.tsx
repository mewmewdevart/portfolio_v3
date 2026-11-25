import { CharacterPortrait } from '../components/character/CharacterPortrait'
import { ArrowUpRightIcon, SocialIcon } from '../components/icons/PortfolioIcons'
import { ExperienceItem } from '../components/portfolio/ExperienceItem'
import { ProjectItem } from '../components/portfolio/ProjectItem'
import { NAV_ITEMS, type SectionId } from '../config/navigation'
import {
  ABOUT_PARAGRAPHS,
  EXPERIENCES,
  PROFILE,
  PROJECTS,
  SOCIAL_LINKS,
} from '../config/portfolio'
import { useActiveSection } from '../hooks/useActiveSection'

const SECTION_IDS: SectionId[] = NAV_ITEMS.map((item) => item.id)

export function HeroSection() {
  const [activeSection, setActiveSection] = useActiveSection(SECTION_IDS)

  return (
    <div className="relative min-h-svh w-full">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-4 z-20 border-6 border-accent shadow-[0_0_0_4rem_var(--color-bg-primary)] md:inset-8"
      />

      <div className="relative z-10 mx-auto max-w-screen-xl px-10 pt-12 pb-16 sm:px-14 md:px-20 lg:flex lg:justify-between lg:gap-8 lg:px-24 lg:py-0">
        <header className="lg:sticky lg:top-0 lg:flex lg:max-h-screen lg:w-[46%] lg:flex-col lg:justify-start lg:pt-16 lg:pb-12 xl:pt-20">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-[2.5rem] sm:leading-[1.1]">
              {PROFILE.name}
            </h1>
            <h2 className="mt-2 text-lg font-medium tracking-tight text-ink sm:text-xl">
              {PROFILE.role}
            </h2>
            <p className="mt-2.5 max-w-xs text-sm leading-relaxed text-ink/75">
              {PROFILE.tagline}
            </p>

            <nav aria-label="Navegação da página" className="mt-6 lg:mt-8">
              <ul className="w-max space-y-0.5">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeSection === item.id
                  return (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        onClick={() => setActiveSection(item.id)}
                        className="group flex items-center py-1.5 focus-visible:outline-none"
                      >
                        <span
                          aria-hidden="true"
                          className={`mr-4 transition-all duration-200 motion-reduce:transition-none ${
                            isActive
                              ? 'h-[3px] w-16 bg-accent'
                              : 'h-[2px] w-8 bg-accent/65 group-hover:w-16 group-hover:bg-accent group-focus-visible:w-16 group-focus-visible:bg-accent'
                          }`}
                        />
                        <span
                          className={`text-xs font-bold uppercase tracking-widest transition-colors ${
                            isActive
                              ? 'text-ink'
                              : 'text-ink/60 group-hover:text-ink group-focus-visible:text-ink'
                          }`}
                        >
                          {item.label}
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
                    href={link.href}
                    target={link.id === 'email' ? undefined : '_blank'}
                    rel={link.id === 'email' ? undefined : 'noreferrer noopener'}
                    aria-label={link.label}
                    title={link.label}
                    className="inline-flex size-9 items-center justify-center rounded-sm bg-accent/15 text-accent transition-colors hover:bg-accent hover:text-surface focus-visible:bg-accent focus-visible:text-surface"
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
            aria-label="Sobre mim"
            className="mb-16 scroll-mt-16 md:mb-24 lg:mb-32 lg:scroll-mt-24"
          >
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-accent lg:sr-only">
              Sobre mim
            </h2>
            <div className="space-y-4 text-[0.95rem] leading-[1.65] text-ink/85">
              {ABOUT_PARAGRAPHS.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section
            id="experience"
            aria-label="Experiencia"
            className="mb-16 scroll-mt-16 md:mb-24 lg:mb-32 lg:scroll-mt-24"
          >
            <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-accent lg:sr-only">
              Experiencia
            </h2>
            <ol className="space-y-12 lg:[&:has(>li:hover)>li:not(:hover)]:opacity-55">
              {EXPERIENCES.map((experience) => (
                <ExperienceItem
                  key={`${experience.company}-${experience.period}`}
                  experience={experience}
                />
              ))}
            </ol>
            <div className="mt-10">
              <a
                href={PROFILE.resumeHref}
                className="group inline-flex items-center gap-1.5 font-semibold leading-tight text-ink transition-colors hover:text-accent focus-visible:text-accent"
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
            <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-accent lg:sr-only">
              Projetos
            </h2>
            <ul className="space-y-12 lg:[&:has(>li:hover)>li:not(:hover)]:opacity-55">
              {PROJECTS.map((project) => (
                <ProjectItem key={project.title} project={project} />
              ))}
            </ul>
            <div className="mt-10">
              <a
                href={PROFILE.projectsArchiveHref}
                target="_blank"
                rel="noreferrer noopener"
                className="group inline-flex items-center gap-1.5 font-semibold leading-tight text-ink transition-colors hover:text-accent focus-visible:text-accent"
              >
                <span>{PROFILE.projectsArchiveLabel}</span>
                <ArrowUpRightIcon className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-focus-visible:-translate-y-0.5 group-focus-visible:translate-x-0.5" />
              </a>
            </div>
          </section>

          <footer className="max-w-md pb-8 text-xs leading-relaxed text-ink/60 sm:pb-0">
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
          className="relative z-30 -mx-4 translate-y-[12%] w-[min(100%,24rem)] lg:fixed lg:left-0 lg:bottom-0 lg:mx-0 lg:w-[clamp(8rem,var(--portrait-max-by-height),25rem)] xl:w-[clamp(8rem,var(--portrait-max-by-height),29rem)] 3xl:w-[clamp(8rem,var(--portrait-max-by-height),37rem)]"
        />
      </div>
    </div>
  )
}
