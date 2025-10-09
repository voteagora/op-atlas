/**
 * Safe Context Wrapper Component
 * Provides page-level restrictions and overlays for Safe wallet context
 */

"use client"

import { AlertTriangle, Wallet } from "lucide-react"
import { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { useWallet } from "@/hooks/useWallet"
import type { FeatureFlag } from "@/types/safe"

interface SafeContextWrapperProps {
  children: ReactNode
  restrictedFeature?: FeatureFlag
  customMessage?: string
  showOverlay?: boolean
  allowSwitchBack?: boolean
}

/**
 * Wrapper component that can restrict access to features based on wallet context
 * Shows an overlay when the feature is not available in the current wallet context
 */
export const SafeContextWrapper = ({
  children,
  restrictedFeature,
  customMessage,
  showOverlay = true,
  allowSwitchBack = true,
}: SafeContextWrapperProps) => {
  const {
    currentContext,
    isFeatureEnabled,
    switchToEOA,
    signerWallet,
    selectedSafeWallet,
  } = useWallet()

  // If no restriction is specified, always show children
  if (!restrictedFeature) {
    return <>{children}</>
  }

  // If feature is enabled in current context, show children normally
  if (isFeatureEnabled(restrictedFeature)) {
    return <>{children}</>
  }

  // Feature is disabled in current context
  const getFeatureDisplayName = (feature: FeatureFlag): string => {
    const featureNames: Record<FeatureFlag, string> = {
      PROFILE_EDITING: "Profile Editing",
      VOTING: "Voting",
    }
    return featureNames[feature] || feature
  }

  const featureDisplayName = getFeatureDisplayName(restrictedFeature)
  const currentWalletDisplay =
    currentContext === "SAFE"
      ? `${selectedSafeWallet?.address.slice(
          0,
          6,
        )}...${selectedSafeWallet?.address.slice(-4)}`
      : `${signerWallet?.address.slice(0, 6)}...${signerWallet?.address.slice(
          -4,
        )}`

  if (!showOverlay) {
    // Just hide the children without showing overlay
    return null
  }

  return (
    <div className="relative">
      {/* Original content with reduced opacity */}
      <div className="opacity-20 pointer-events-none">{children}</div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
        <div className="bg-card p-8 rounded-lg border shadow-lg max-w-md mx-4">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            <h3 className="text-lg font-normal">Feature Not Available</h3>
          </div>

          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              {customMessage || (
                <>
                  <strong>{featureDisplayName}</strong> is not available when
                  using Safe wallet context.
                </>
              )}
            </p>

            <div className="bg-muted p-3 rounded">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4" />
                <span className="font-normal">Current Wallet Context</span>
              </div>
              <div className="text-xs">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-mono">
                    {currentContext === "SAFE" ? "Safe Wallet" : "EOA Signer"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Address:</span>
                  <span className="font-mono">{currentWalletDisplay}</span>
                </div>
              </div>
            </div>

            {currentContext === "SAFE" && allowSwitchBack && (
              <p className="text-xs">
                Switch back to your signer wallet to access this feature.
              </p>
            )}
          </div>

          {currentContext === "SAFE" && allowSwitchBack && (
            <div className="flex gap-3 mt-6">
              <Button onClick={switchToEOA} className="flex-1" size="sm">
                Switch to Signer Wallet
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Convenience wrapper for common use cases
interface RestrictedPageProps {
  children: ReactNode
  feature: FeatureFlag
  title?: string
  description?: string
}

export const RestrictedPage = ({
  children,
  feature,
  title = "Feature Restricted",
  description,
}: RestrictedPageProps) => {
  return (
    <SafeContextWrapper
      restrictedFeature={feature}
      customMessage={description}
      showOverlay={true}
      allowSwitchBack={true}
    >
      <div className="min-h-screen">{children}</div>
    </SafeContextWrapper>
  )
}
