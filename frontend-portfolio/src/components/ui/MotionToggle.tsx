import { MotionIcon } from '../icons/PortfolioIcons'

type MotionToggleProps = {
  reducedMotion: boolean
  onToggle: () => void
  className?: string
}

export function MotionToggle({
  reducedMotion,
  onToggle,
  className = '',
}: MotionToggleProps) {
  const label = reducedMotion ? 'Ativar animações' : 'Desativar animações (movimento reduzido)'

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={reducedMotion}
      aria-label={label}
      title={label}
      className={`inline-flex size-10 cursor-pointer items-center justify-center rounded-md border shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        reducedMotion
          ? 'border-accent bg-accent-soft text-accent-light hover:bg-accent hover:text-on-accent'
          : 'border-line bg-surface text-ink hover:border-accent hover:bg-accent-soft hover:text-accent-light'
      } ${className}`.trim()}
    >
      <MotionIcon reduced={reducedMotion} />
    </button>
  )
}
