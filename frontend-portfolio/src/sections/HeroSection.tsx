import { CharacterPortrait } from '../components/character/CharacterPortrait'

/**
 * Seção principal com a personagem posicionada no canto inferior direito.
 */
export function HeroSection() {
  return (
    <section className="relative min-h-svh w-full overflow-hidden">
      <CharacterPortrait className="absolute right-0 bottom-0 translate-y-[12%] w-[min(100%,34rem)] md:w-[min(100%,52rem)] 3xl:w-[min(100%,62rem)]" />
    </section>
  )
}
