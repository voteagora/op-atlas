"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { Button } from "@/components/common/Button"

type Props = {
  roleId: number
  applicationId: number
  voteStartAt?: string | null
  voteEndAt?: string | null
  context: string
}

function withinWindow(voteStartAt?: string | null, voteEndAt?: string | null) {
  const now = Date.now()
  const start = voteStartAt ? new Date(voteStartAt).getTime() : undefined
  const end = voteEndAt ? new Date(voteEndAt).getTime() : undefined
  if (start && now < start) return false
  if (end && now > end) return false
  return true
}

export function ApprovalButton({
  applicationId,
  voteStartAt,
  voteEndAt,
  context,
}: Props) {
  const [isTop100, setIsTop100] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const allowed = useMemo(
    () => withinWindow(voteStartAt, voteEndAt),
    [voteStartAt, voteEndAt],
  )

  useEffect(() => {
    let mounted = true
    fetch("/api/sc/top100", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => {
        if (mounted) setIsTop100(Boolean(j?.top100))
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const onApprove = useCallback(async () => {
    try {
      setSubmitting(true)
      const res = await fetch("/api/sc/endorsements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context, nomineeApplicationId: applicationId }),
      })
      if (!res.ok) {
        throw new Error(await res.text())
      }
    } finally {
      setSubmitting(false)
    }
  }, [applicationId, context])

  if (loading) return null
  if (!isTop100 || !allowed) return null

  return (
    <Button onClick={onApprove} disabled={submitting}>
      {submitting ? "Approving..." : "Approve"}
    </Button>
  )
}


