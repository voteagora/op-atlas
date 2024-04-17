import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function titlecase(str: string) {
  return str.charAt(0).toLocaleUpperCase() + str.slice(1)
}

export function isValidGitHubRepoUrl(url: string) {
  // Regular expression to match GitHub repository URLs
  const githubRepoRegex =
    /^(https?:\/\/)?(www\.)?github\.com\/([a-zA-Z0-9-]+)\/([a-zA-Z0-9-]+)$/

  // Test the URL against the regex
  return githubRepoRegex.test(url)
}

export const copyTextToClipBoard = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url)
  } catch (error) {
    throw new Error("Failed to copy text to clipboard")
  }
}

const LAST_SIGN_IN_LOCALSTORAGE_KEY = "op_atlas_last_signed_in"
export function isFirstTimeUser(): boolean {
  return !Boolean(localStorage.getItem(LAST_SIGN_IN_LOCALSTORAGE_KEY))
}

export function saveLogInDate() {
  localStorage.setItem(LAST_SIGN_IN_LOCALSTORAGE_KEY, Date.now().toString())
}
