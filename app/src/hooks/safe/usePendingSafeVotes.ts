"use client"

import { useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ethers } from 'ethers'

import { EAS_CONTRACT_ADDRESS, EAS_VOTE_SCHEMA } from '@/lib/eas/clientSafe'
import { safeService } from '@/services/SafeService'

type PendingVote = {
  proposalId: string
  safeAddress: string
  safeTxHash: string
  submissionDate?: string
}

function extractProposalIdFromTxData(data?: string): string | null {
  if (!data) return null
  try {
    const iface = new ethers.Interface([
      'function attest((bytes32 schema, (address recipient, uint64 expirationTime, bool revocable, bytes32 refUID, bytes data) data))',
    ])
    const decoded = iface.decodeFunctionData('attest', data)
    const inner = decoded?.[0]?.data as any
    if (!inner) return null
    const { SchemaEncoder } = require('@ethereum-attestation-service/eas-sdk')
    const encoder = new SchemaEncoder(EAS_VOTE_SCHEMA)
    const decodedSchema = encoder.decodeData(inner)
    const proposal = decodedSchema.find((f: any) => f.name === 'proposalId')
    if (!proposal) return null
    const id = (proposal?.value?.value ?? '').toString()
    return id || null
  } catch (_e) {
    return null
  }
}

export function usePendingSafeVotes(safeAddress?: string | null) {
  const queryClient = useQueryClient()

  const { data: queuedTxs } = useQuery({
    queryKey: ['safe-queued', safeAddress],
    queryFn: async () => {
      if (!safeAddress) return [] as any[]
      const list = await safeService.getQueuedTransactionsForSafe(safeAddress)
      return (list || []).filter((tx: any) =>
        (tx?.to || '')?.toLowerCase() === EAS_CONTRACT_ADDRESS.toLowerCase(),
      )
    },
    enabled: !!safeAddress,
    refetchInterval: 15000,
  })

  const pendingVotes: PendingVote[] = useMemo(() => {
    return (queuedTxs || [])
      .map((tx: any) => {
        const proposalId = extractProposalIdFromTxData(tx?.data)
        if (!proposalId) return null
        return {
          proposalId,
          safeAddress: (tx?.safe || safeAddress) as string,
          safeTxHash: tx?.safeTxHash,
          submissionDate: tx?.submissionDate,
        } as PendingVote
      })
      .filter(Boolean) as PendingVote[]
  }, [queuedTxs, safeAddress])

  // Helper: poll a specific safeTxHash for execution
  const waitForExecution = async (safeTxHash: string) => {
    let tries = 0
    while (tries < 60) {
      const tx = await safeService.getTransactionByHash(safeTxHash)
      const executed = !!tx?.isExecuted
      if (executed) return true
      await new Promise((r) => setTimeout(r, 5000))
      tries += 1
    }
    return false
  }

  // Public API: observe one proposal and invalidate myVote when executed
  const observeProposal = async (proposalId: string) => {
    const item = pendingVotes.find((v) => v.proposalId === proposalId)
    if (!item) return
    const ok = await waitForExecution(item.safeTxHash)
    if (ok) {
      // Invalidate any my-vote queries for this proposal
      queryClient.invalidateQueries({ queryKey: ['my-vote', proposalId] })
    }
  }

  return {
    pendingVotes,
    observeProposal,
    waitForExecution,
  }
}


