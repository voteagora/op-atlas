"use client"

import { Alignment, Fit, Layout, useRive } from "@rive-app/react-canvas-lite"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"

interface GrantEligibilitySuccessProps {
  projectId?: string
  organizationId?: string
}

export default function GrantEligibilitySuccess({ 
  projectId, 
  organizationId 
}: GrantEligibilitySuccessProps) {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  
  const { RiveComponent } = useRive({
    src: "/assets/images/sunny-animation.riv",
    autoplay: true,
    stateMachines: "State Machine 1",
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
    automaticallyHandleEvents: true,
  })

  const handleCheckStatus = () => {
    setIsNavigating(true)
    if (projectId) {
      router.push(`/projects/${projectId}/grant-address`)
    } else if (organizationId) {
      router.push(`/profile/organizations/${organizationId}/grant-address`)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center px-4 overflow-hidden">
      <div className="max-w-[712px] w-full flex flex-col items-center justify-center text-center">
        {/* Animated Sun Character */}
        <div className="w-48 h-48">
          <RiveComponent className="w-full h-full" />
        </div>

        {/* Success Message */}
        <div className="space-y-6">
          <h1 className="text-base text-secondary-foreground">
            Form submitted successfully!
          </h1>
          
          <p className="font-semibold max-w-xl mx-auto text-xl">
            An email has been sent to each person declared in the grant eligibility 
            form. To receive your grant, they must complete KYC/KYB via the link 
            provided.
          </p>

          
          <p className="text-secondary-foreground">
            Emails will come from <a className="ml-1 underline" href="mailto:compliance@optimism.io">compliance@optimism.io</a>. Please ensure everyone has taken action and 
            allow 48 hours for your status to update.
          </p>
        </div>

        {/* Check Status Button */}
        <button
          type="button"
          onClick={handleCheckStatus}
          disabled={isNavigating}
          className="inline-flex items-center justify-center gap-2 py-3 px-4 mt-12 rounded-md bg-destructive text-white hover:bg-destructive/90 transition-colors disabled:opacity-50"
        >
          {isNavigating && <Loader2 className="animate-spin" size={16} />}
          Check status
        </button>
      </div>
    </div>
  )
}
