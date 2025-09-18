import { useState, useEffect } from "react"
import { checkPendingKYCVerification } from "@/lib/actions/userKyc"

interface UsePendingKYCVerificationReturn {
  hasPendingVerification: boolean
  pendingEmail: string | null
  isLoading: boolean
}

export function usePendingKYCVerification(): UsePendingKYCVerificationReturn {
  const [hasPendingVerification, setHasPendingVerification] = useState(false)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkPending = async () => {
      try {
        const result = await checkPendingKYCVerification()
        if (result.success) {
          setHasPendingVerification(result.hasPendingVerification ?? false)
          setPendingEmail(result.email ?? null)
        }
      } catch (error) {
        console.error("Error checking pending verification:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkPending()
  }, [])

  return {
    hasPendingVerification,
    pendingEmail,
    isLoading,
  }
}