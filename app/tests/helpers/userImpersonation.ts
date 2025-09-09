/**
 * User Impersonation Test Helpers
 */

import { Page } from "@playwright/test"

export async function isUserImpersonationAvailable(page: Page): Promise<boolean> {
  try {
    const response = await page.request.get("/api/test-auth/user-impersonate?action=status")
    if (!response.ok()) return false
    
    const result = await response.json()
    return result.available === true
  } catch {
    return false
  }
}

export async function discoverUsers(page: Page, scenario: string): Promise<any[]> {
  const response = await page.request.get(`/api/test-auth/user-impersonate?action=discover&scenario=${scenario}`)
  
  if (!response.ok()) {
    throw new Error(`Discovery failed: ${response.status()}`)
  }
  
  const result = await response.json()
  return result.users || []
}

export async function impersonateUser(page: Page, scenario: string): Promise<boolean> {
  const response = await page.request.post("/api/test-auth/user-impersonate", {
    data: { 
      scenario,
      impersonatedBy: "test-system"
    }
  })
  
  if (!response.ok()) {
    throw new Error(`Impersonation failed: ${response.status()}`)
  }
  
  const result = await response.json()
  return result.success === true
}

export async function getUserImpersonationStats(page: Page): Promise<any> {
  const response = await page.request.get("/api/test-auth/user-impersonate?action=stats")
  
  if (!response.ok()) {
    throw new Error(`Stats failed: ${response.status()}`)
  }
  
  const result = await response.json()
  return result.stats
}

export async function verifyImpersonation(page: Page): Promise<boolean> {
  try {
    // Check if we're on a page that shows user data
    await page.goto("/profile")
    await page.waitForLoadState("domcontentloaded")
    
    // Look for user-specific elements
    const hasUserData = await page.locator("main").isVisible()
    return hasUserData
  } catch {
    return false
  }
}
