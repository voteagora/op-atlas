"use client"

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
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

export function usePendingSafeVotesForOwner(ownerAddress?: string | null) {
  const { data } = useQuery({
    queryKey: ['safe-queued-owner', ownerAddress],
    queryFn: async () => {
      if (!ownerAddress) return [] as any[]
      const safes = await safeService.getSafeWalletsForSigner(ownerAddress)
      const results: any[] = []
      for (const s of safes) {
        const queued = await safeService.getQueuedTransactionsForSafe(s.address)
        for (const tx of queued) {
          if ((tx?.to || '').toLowerCase() === EAS_CONTRACT_ADDRESS.toLowerCase()) {
            results.push({ ...tx, __safe: s.address })
          }
        }
      }
      return results
    },
    enabled: !!ownerAddress,
    refetchInterval: 5000,
  })

  const pendingVotes: PendingVote[] = useMemo(() => {
    return (data || [])
      .map((tx: any) => {
        const proposalId = extractProposalIdFromTxData(tx?.data)
        if (!proposalId) return null
        return {
          proposalId,
          safeAddress: tx.__safe as string,
          safeTxHash: tx.safeTxHash,
          submissionDate: tx.submissionDate,
        } as PendingVote
      })
      .filter(Boolean) as PendingVote[]
  }, [data])

  return { pendingVotes }
}


