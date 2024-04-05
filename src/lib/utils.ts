import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function isValidGitHubRepoUrl(url: string) {
  // Regular expression to match GitHub repository URLs
  const githubRepoRegex =
    /^(https?:\/\/)?(www\.)?github\.com\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9-]+)$/

  // Test the URL against the regex
  return githubRepoRegex.test(url)
}
