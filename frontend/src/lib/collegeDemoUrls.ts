/** Build a DNS-style slug for demo URLs (not a real host). */
export function collegeSlugForDemoUrl(name: string): string {
  const s = name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
  return (s.slice(0, 32) || 'school').toLowerCase()
}

export function canvasDemoLoginUrl(collegeName: string): string {
  const slug = collegeSlugForDemoUrl(collegeName)
  return `https://canvas.${slug}.edu/login`
}

export function blackboardDemoLoginUrl(collegeName: string): string {
  const slug = collegeSlugForDemoUrl(collegeName)
  return `https://learn.${slug}.edu/webapps/login`
}

export function collegePortalDemoUrl(collegeName: string): string {
  const slug = collegeSlugForDemoUrl(collegeName)
  return `https://portal.${slug}.edu`
}
