export type Experience = {
  period: string
  role: string
  company: string
  companyUrl?: string
  description: string
  tags: string[]
}

export type Project = {
  title: string
  url: string
  description: string
  tags: string[]
  badge: string
}

export type SocialLink = {
  id: 'github' | 'linkedin' | 'instagram' | 'email'
  label: string
  href: string
}

export const PROFILE = {
  name: 'Larissa C. Benedito',
  role: 'Lorem Ipsum Dolor Sit Amet',
  tagline: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  resumeLabel: 'Ver currículo completo',
  resumeHref: '#experience',
  projectsArchiveLabel: 'Ver repositórios no GitHub',
  projectsArchiveHref: 'https://github.com/mewmewdevart',
} as const

export const SOCIAL_LINKS: SocialLink[] = [
  {
    id: 'github',
    label: 'GitHub',
    href: 'https://github.com/mewmewdevart',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com',
  },
  {
    id: 'email',
    label: 'E-mail',
    href: 'mailto:contato@exemplo.com',
  },
]

export const ABOUT_PARAGRAPHS: string[] = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam vestibulum pellentesque aliquet. Maecenas sapien ex, convallis eget vestibulum vitae, egestas ut ex. Donec quis augue enim. Etiam elit sem, pellentesque sed sollicitudin vel, iaculis eget risus. Morbi suscipit sapien sed mauris efficitur, eget vehicula justo efficitur.',
  'Aenean ac mauris vel nibh mollis ultricies sed suscipit massa. Nulla quam nibh, viverra at sollicitudin eu, viverra non urna. Ut ut porta justo. Aliquam urna mauris, luctus sed convallis at, faucibus non ipsum. Duis tristique lacinia erat, ut imperdiet tortor elementum nec. Cras malesuada eu tellus at finibus.',
  'Pellentesque in dolor massa. Phasellus vehicula sit amet tellus id gravida. In eget dolor convallis elit euismod iaculis. Donec a nisl eget quam commodo luctus. Nam mattis ac nulla nec posuere. Maecenas id mattis dolor. Quisque luctus diam sit amet lorem ultricies lacinia.',
]

export const EXPERIENCES: Experience[] = [
  {
    period: '20XX — Presente',
    role: 'Lorem Ipsum Dolor',
    company: 'Consectetur Adipiscing',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas porttitor lectus ante, sit amet convallis ante pharetra ac. Mauris pretium purus id euismod interdum. Pellentesque tincidunt, diam eu laoreet lacinia, ex elit ultrices lorem, eu dignissim lacus urna eu ante.',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'JavaScript', 'CSS'],
  },
  {
    period: '20XX — 20XX',
    role: 'Lorem Ipsum Engineer',
    company: 'Dolor Sit Amet',
    description:
      'Fusce eleifend ligula velit, in dignissim metus suscipit quis. Suspendisse aliquet diam a bibendum facilisis. Vivamus efficitur nisi non lectus sollicitudin, ut tempor turpis placerat. Integer nec odio praesent libero.',
    tags: ['HTML', 'CSS', 'GSAP', 'Figma', 'Vite'],
  },
]

export const PROJECTS: Project[] = [
  {
    title: 'Lorem Ipsum Dolor',
    url: 'https://github.com/mewmewdevart/portfolio_v3',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet.',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'GSAP'],
    badge: '01',
  },
  {
    title: 'Consectetur Adipiscing',
    url: 'https://github.com/mewmewdevart/portfolio_v3',
    description:
      'Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent.',
    tags: ['JavaScript', 'CSS', 'GSAP', 'Vite'],
    badge: '02',
  },
  {
    title: 'Maecenas Porttitor',
    url: 'https://github.com/mewmewdevart',
    description:
      'Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis.',
    tags: ['React', 'Tailwind CSS', 'TypeScript', 'UI'],
    badge: '03',
  },
]
