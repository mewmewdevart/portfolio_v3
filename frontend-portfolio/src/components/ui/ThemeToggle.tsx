import { MoonIcon, SunIcon } from '../icons/PortfolioIcons'

type ThemeToggleProps = {
  isDark: boolean
  onToggle: () => void
  className?: string
}

export function ThemeToggle({
  isDark,
  onToggle,
  className = '',
}: ThemeToggleProps) {
  const label = isDark ? 'Desativar modo escuro' : 'Ativar modo escuro'

  return (
    <button
      type="button"
      data-build="theme-toggle"
      onClick={onToggle}
      aria-pressed={isDark}
      aria-label={label}
      title={label}
      className={`inline-flex size-10 cursor-pointer items-center justify-center rounded-md border border-line bg-surface text-ink shadow-xs transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className}`.trim()}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
