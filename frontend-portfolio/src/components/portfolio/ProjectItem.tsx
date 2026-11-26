import type { Project } from '../../config/portfolio'
import { ArrowUpRightIcon } from '../icons/PortfolioIcons'
import { TypedText } from '../ui/TypedText'
import { TechTagList } from './TechTagList'

type ProjectItemProps = {
  project: Project
}

export function ProjectItem({ project }: ProjectItemProps) {
  return (
    <li data-build="project-item" className="transition-opacity">
      <div className="group relative grid gap-4 pb-1 transition-all sm:grid-cols-8 sm:gap-8">
        <div
          aria-hidden="true"
          className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-surface lg:group-hover:shadow-[inset_0_0_0_1px_var(--palette-border)]"
        />
        <div className="z-10 sm:col-span-2 sm:pt-1">
          <div
            data-build="project-badge"
            className="flex aspect-video w-32 items-center justify-center rounded border-2 border-line bg-surface-elevated text-sm font-bold uppercase tracking-widest text-accent-light transition-colors group-hover:border-accent sm:w-full"
          >
            {project.badge}
          </div>
        </div>
        <div className="z-10 sm:col-span-6">
          <h3 className="font-semibold leading-snug text-ink">
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={project.title}
              className="group/link inline-flex items-baseline gap-1 text-ink transition-colors hover:text-accent-light focus-visible:text-accent-light"
            >
              <span className="absolute -inset-x-4 -inset-y-4 hidden rounded md:-inset-x-6 lg:block" />
              <span data-build="project-title">
                <TypedText text={project.title} group={`project-title-${project.badge}`} />
              </span>
              <span data-build="project-arrow" className="inline-flex">
                <ArrowUpRightIcon className="inline-block size-4 shrink-0 translate-y-px transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 group-focus-visible/link:-translate-y-0.5 group-focus-visible/link:translate-x-0.5" />
              </span>
            </a>
          </h3>
          <p
            data-build="project-desc"
            aria-label={project.description}
            className="mt-2 text-sm leading-relaxed text-ink-secondary"
          >
            <TypedText text={project.description} group={`project-desc-${project.badge}`} />
          </p>
          <TechTagList
            tags={project.tags}
            label="Tecnologias do projeto"
          />
        </div>
      </div>
    </li>
  )
}
