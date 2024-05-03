export function isValidFundingFile(contents: string, projectId: string) {
  try {
    const parsed = JSON.parse(contents)
    return parsed.opRetro && parsed.opRetro.projectId === projectId
  } catch (error) {
    return false
  }
}
