import { CharacterPortrait } from '../components/character/CharacterPortrait'

export function HeroSection() {
  return (
    <section className="relative min-h-svh w-full overflow-hidden">
      <div className='border-8 border-indigo-600 h-fit'>
        <CharacterPortrait
          flipped
          className="absolute left-0 bottom-0 translate-y-[12%] w-[min(100%,34rem)] md:w-[min(100%,42rem)] 3xl:w-[min(100%,52rem)]"
        />
      </div>
    </section>
  )
}
