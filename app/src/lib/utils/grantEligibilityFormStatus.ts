import type { GrantEligibility } from "@prisma/client"

export enum GrantEligibilityFormStatus {
  DRAFT = "Draft",
  SUBMITTED = "Submitted", 
  EXPIRED = "Expired",
  DELETED = "Deleted",
}

export function getGrantEligibilityFormStatus(form: GrantEligibility): GrantEligibilityFormStatus {
  if (form.deletedAt !== null) {
    return GrantEligibilityFormStatus.DELETED
  }

  if (form.submittedAt !== null) {
    return GrantEligibilityFormStatus.SUBMITTED
  }

  if (form.expiresAt && new Date(form.expiresAt) < new Date()) {
    return GrantEligibilityFormStatus.EXPIRED
  }

  return GrantEligibilityFormStatus.DRAFT
}

export function isFormActive(form: GrantEligibility): boolean {
  return getGrantEligibilityFormStatus(form) === GrantEligibilityFormStatus.DRAFT
}

export function groupFormsByStatus(forms: GrantEligibility[]) {
  const draft: GrantEligibility[] = []
  const submitted: GrantEligibility[] = []
  const expired: GrantEligibility[] = []
  
  forms.forEach(form => {
    const status = getGrantEligibilityFormStatus(form)
    
    switch (status) {
      case GrantEligibilityFormStatus.DRAFT:
        draft.push(form)
        break
      case GrantEligibilityFormStatus.SUBMITTED:
        submitted.push(form)
        break
      case GrantEligibilityFormStatus.EXPIRED:
        expired.push(form)
        break
      // Skip deleted forms
    }
  })

  return { draft, submitted, expired }
}