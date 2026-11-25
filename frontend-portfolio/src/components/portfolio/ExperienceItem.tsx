import type { Experience } from '../../config/portfolio'
import { TechTagList } from './TechTagList'

type ExperienceItemProps = {
  experience: Experience
}

export function ExperienceItem({ experience }: ExperienceItemProps) {
  return (
    <li className="transition-opacity">
      <div className="group relative grid gap-3 pb-1 transition-all sm:grid-cols-8 sm:gap-8">
        <div
          aria-hidden="true"
          className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-accent/6"
        />
        <header className="z-10 text-xs font-semibold uppercase tracking-wide text-ink/60 sm:col-span-2 sm:pt-1">
          {experience.period}
        </header>
        <div className="z-10 sm:col-span-6">
          <h3 className="font-semibold leading-snug text-ink">
            <span>{experience.role}</span>
            <span aria-hidden="true"> · </span>
            <span>{experience.company}</span>
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink/80">
            {experience.description}
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
