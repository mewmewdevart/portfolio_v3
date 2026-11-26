type TechTagListProps = {
  tags: string[]
  label: string
}

export function TechTagList({ tags, label }: TechTagListProps) {
  return (
    <ul aria-label={label} className="mt-4 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li key={tag}>
          <span
            data-build="tech-tag"
            className="inline-flex items-center rounded-sm bg-accent-soft px-3 py-1 text-xs font-medium text-accent-light"
          >
            {tag}
          </span>
        </li>
      ))}
    </ul>
  )
}
