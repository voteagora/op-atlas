export function chunkArray<T>(array: T[], size: number): T[][] {
  if (size <= 0) {
    return [array]
  }

  const chunks: T[][] = []
  for (let index = 0; index < array.length; index += size) {
    chunks.push(array.slice(index, index + size))
  }

  return chunks
}
