
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).slice(0, 4);
}

export function generateTemporaryUsername(id: string): string {
  const suffix = simpleHash(id);
  return `optimist-${suffix}`;
}
