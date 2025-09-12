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

export async function impersonateUser(page: Page, scenario: string, prodUserId?: string): Promise<boolean> {
  const data: { scenario?: string; prodUserId?: string; impersonatedBy: string } = {
    impersonatedBy: "Playwright Test"
  }
  if (prodUserId) {
    data.prodUserId = prodUserId
  } else if (scenario) {
    data.scenario = scenario
  } else {
    throw new Error("Either prodUserId or scenario must be provided for impersonation.")
  }

  const response = await page.request.post("/api/test-auth/user-impersonate", { data })
  
  if (!response.ok()) {
    throw new Error(`Impersonation failed: ${response.status()}`)
  }
  
  const result = await response.json()
  if (!result.success) {
    throw new Error(`Impersonation failed: ${result.error || 'Unknown error'}`)
  }
  if (!result.user.isImpersonated) {
    throw new Error('User was not properly impersonated')
  }
  console.log(`Impersonated user: ${result.user.id} (original: ${result.user.originalUserId})`)
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
    // Check if we can access user-specific pages (simpler verification)
    await page.goto("/profile")
    await page.waitForLoadState("domcontentloaded")
    
    // Look for any user-specific content or navigation
    const hasUserContent = await page.locator("body").textContent()
    
    // If we can access profile page without redirect to signin, we're likely authenticated
    return hasUserContent !== null && !hasUserContent.includes("Sign in")
  } catch {
    return false
  }
}
