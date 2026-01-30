// Utility function to fix broken numbered lists where blank lines break the list
// In markdown, blank lines between numbered items break them into separate paragraphs
// Only fixes items that end with ":" or ":**" (header-style items with no content)
// e.g., "1. **Item 1:**\n\n2. **Item 2:**" should be "1. **Item 1:**\n2. **Item 2:**"
export const fixBrokenNumberedLists = (text: string): string => {
  // Remove extra blank lines between numbered list items that end with a colon
  // This is safe because items ending with ":" are clearly incomplete/header-style
  // Apply multiple times to handle consecutive items
  let result = text
  let prev = ""
  while (result !== prev) {
    prev = result
    // Match: numbered item ending with colon (possibly in bold), blank lines, next numbered item
    result = result.replace(
      /^(\d+\.\s+.*?:\*{0,2})(\n\s*\n+)(\d+\.\s+)/gm,
      "$1\n$3"
    )
  }
  return result
}

// Utility function to strip markdown from text
export const stripMarkdown = (text: string): string => {
  return (
    text
      // Remove headers
      .replace(/^#{1,6}\s+/gm, "")
      // Remove bold/italic
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/__(.*?)__/g, "$1")
      .replace(/_(.*?)_/g, "$1")
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`([^`]+)`/g, "$1")
      // Remove links but keep text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // Remove images
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
      // Remove strikethrough
      .replace(/~~(.*?)~~/g, "$1")
      // Remove blockquotes
      .replace(/^>\s+/gm, "")
      // Remove list markers
      .replace(/^[\s]*[-*+]\s+/gm, "")
      .replace(/^[\s]*\d+\.\s+/gm, "")
      // Clean up extra whitespace
      .replace(/\n\s*\n/g, "\n")
      .trim()
  )
}
