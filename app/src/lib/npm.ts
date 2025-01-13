export async function getNpmPackage(name: string) {
  try {
    const url = `https://registry.npmjs.org/${encodeURIComponent(name)}`
    const response = await fetch(url)
    const pkg = await response.json()
    return pkg
  } catch (error: unknown) {
    return null
  }
}
