import type { Experience } from '../../config/portfolio'
import { TypedText } from '../ui/TypedText'
import { TechTagList } from './TechTagList'

type ExperienceItemProps = {
  experience: Experience
}

export function ExperienceItem({ experience }: ExperienceItemProps) {
  const titleText = `${experience.role} · ${experience.company}`

  return (
    <li data-build="experience-item" className="transition-opacity">
      <div className="group relative grid gap-3 pb-1 transition-all sm:grid-cols-8 sm:gap-8">
        <div
          aria-hidden="true"
          className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-surface lg:group-hover:shadow-[inset_0_0_0_1px_var(--palette-border)]"
        />
        <header
          data-build="exp-period"
          className="z-10 text-xs font-semibold uppercase tracking-wide text-ink-muted sm:col-span-2 sm:pt-1"
        >
          <TypedText
            text={experience.period}
            group={`exp-period-${experience.company}`}
          />
        </header>
        <div className="z-10 sm:col-span-6">
          <h3 data-build="exp-title" className="font-semibold leading-snug text-ink">
            <TypedText text={titleText} group={`exp-title-${experience.company}`} />
          </h3>
          <p
            data-build="exp-desc"
            className="mt-2 text-sm leading-relaxed text-ink-secondary"
          >
            <TypedText
              text={experience.description}
              group={`exp-desc-${experience.company}`}
            />
          </p>
          <TechTagList
            tags={experience.tags}
            label="Tecnologias utilizadas"
          />
        </div>
      </div>
    </li>
  )
}
