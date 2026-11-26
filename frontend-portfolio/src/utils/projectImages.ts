const ASSET_IMAGES = import.meta.glob<string>('../assets/images/**/*', {
  eager: true,
  import: 'default',
})

export function resolveProjectImage(imagePath?: string): string | undefined {
  if (!imagePath) return undefined
  const key = imagePath.replace(/^(?:\.\.?\/|\/?src\/)+assets\/images\//, '../assets/images/')
  return ASSET_IMAGES[key] ?? imagePath
}
