export type SectionId = 'about' | 'experience' | 'projects'

export type NavItem = {
  id: SectionId
  label: string
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'about', label: 'Sobre mim' },
  { id: 'experience', label: 'Experiencia' },
  { id: 'projects', label: 'Projetos' },
]
