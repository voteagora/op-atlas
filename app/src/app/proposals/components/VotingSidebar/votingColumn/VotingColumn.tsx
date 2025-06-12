"use client"
import VotingActions, {
  CardActionsProps,
} from "@/app/proposals/components/VotingSidebar/VotingActions"
import StandardVoteCard from "@/app/proposals/components/VotingSidebar/votingColumn/StandardVoteCard"
import CandidateCards from "@/app/proposals/components/VotingSidebar/votingColumn/CanidateCards"
import OverrideVoteCard from "@/app/proposals/components/VotingSidebar/votingColumn/OverrideVoteCard"
import { useState } from "react"
import { postCitizenProposalVote } from "@/db/citizens"
import { createVoteAttestationCall } from "@/lib/api/eas/voteAttestation"
import {
  EAS,
  NO_EXPIRATION,
  SchemaEncoder,
} from "@ethereum-attestation-service/eas-sdk"
import { useAccount, useWalletClient } from "wagmi"

// Optimism address
const EAS_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_ENV === "dev"
    ? "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"
    : "0x4200000000000000000000000000000000000021"

// Vote type enum
export enum VoteType {
  For = "For",
  Abstain = "Abstain",
  Against = "Against",
  Veto = "Veto",
}

export interface CandidateCardProps {
  name: string
  image: {
    src: string
    alt?: string
  }
  organizations: string[]
  buttonLink: string
}

const ColumnCard = ({
  proposalType,
  options,
  signedIn,
  citizen,
  currentlyActive,
  voted,
  selectedVote,
  setSelectedVote,
}: {
  proposalType: string
  options?: CandidateCardProps[]
  signedIn?: boolean
  citizen?: boolean
  title?: string
  currentlyActive?: boolean
  voted?: boolean
  selectedVote?: VoteType | null
  setSelectedVote?: (vote: VoteType) => void
}) => {
  switch (proposalType) {
    case "STANDARD":
      // If the user is not signed-in we do not want to show the card
      if (!signedIn || !currentlyActive || voted || !citizen) {
        return <></>
      }
      return (
        <StandardVoteCard
          selectedVote={selectedVote!}
          setSelectedVote={setSelectedVote!}
        />
      )
    case "APPROVAL":
      return <CandidateCards candidates={options!} />
    case "OFFCHAIN_OPTIMISTIC":
      return <OverrideVoteCard />
    default:
      return <>TODO</>
  }
}

export interface VotingColumnProps {
  proposalType: string
  options?: CandidateCardProps[]
  votingActions?: CardActionsProps
  currentlyActive?: boolean
  userSignedIn?: boolean
  userCitizen?: boolean
  userVoted?: boolean
  resultsLink: string
}

const VotingColumn = ({
  proposalType,
  options,
  votingActions,
  currentlyActive,
  userSignedIn,
  userCitizen,
  userVoted,
  resultsLink,
}: VotingColumnProps) => {
  const [selectedVote, setSelectedVote] = useState<VoteType | null>(null)
  const handleVoteClick = (voteType: VoteType) => {
    setSelectedVote(voteType === selectedVote ? null : voteType)
  }

  const { data: walletClient } = useWalletClient()

  const { address } = useAccount()

  const createDelegatedAttestation = async (voteType: VoteType) => {
    const eas = new EAS(EAS_CONTRACT_ADDRESS)

    const schemaEncoder = new SchemaEncoder("uint256 eventId, uint8 voteIndex")
    const encodedData = schemaEncoder.encodeData([
      { name: "eventId", value: 1, type: "uint256" },
      { name: "voteIndex", value: 1, type: "uint8" },
    ])

    if (!walletClient) {
      throw new Error("Wallet client not available")
    }

    const delegated = await eas.getDelegated()

    return await delegated.signDelegatedAttestation(
      {
        schema:
          "0xb16fa048b0d597f5a821747eba64efa4762ee5143e9a80600d0005386edfc995",
        recipient: address as `0x${string}`,
        expirationTime: NO_EXPIRATION, // Unix timestamp of when attestation expires (0 for no expiration)
        revocable: true,
        refUID:
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        data: encodedData,
        deadline: NO_EXPIRATION, // Unix timestamp of when signature expires (0 for no expiration)
        value: BigInt("0"),
      },
      walletClient,
    )
  }

  const handleCastVote = async () => {
    if (!selectedVote) return

    try {
      // 1. Create and sign an attestation for the vote
      const delegatedAttestation = await createDelegatedAttestation(
        selectedVote,
      )
      // 2. Send signature to server to relay onchain
      await createVoteAttestationCall(delegatedAttestation.signature)
      // 3. Record vote in database
      await postCitizenProposalVote(selectedVote)
      // Add success handling if needed
    } catch (error) {
      console.error("Failed to cast vote:", error)
      // Add user-facing error handling (e.g., toast notification)
    }
  }

  return (
    <div className="w-[19rem] pr-[1rem] pb-[1.5rem] pl-[1rem] gap-[var(--dimensions-8)] border-l border-b border-r rounded-b-[12px]">
      <div className="w-[272px] gap-[16px] flex flex-col ">
        <ColumnCard
          proposalType={proposalType}
          options={options}
          signedIn={userSignedIn}
          currentlyActive={currentlyActive}
          citizen={userCitizen}
          voted={userVoted}
          selectedVote={selectedVote}
          setSelectedVote={handleVoteClick}
        />
      </div>
      {currentlyActive && votingActions && (
        <VotingActions
          // This is a wonky way to overwrite the call to make an external call.
          cardActionList={votingActions.cardActionList.map((action) => {
            // If this is a vote action, replace its action function with handleCastVote
            // and determine if it should be disabled based on selectedVote
            if (action.actionType === "Vote") {
              return {
                ...action,
                action: handleCastVote,
                disabled: !selectedVote,
              }
            }
            // Otherwise, return the original action unchanged
            return action
          })}
        />
      )}

      {!currentlyActive && (
        <div className="w-full flex items-center justify-center gap-2.5">
          <a href={resultsLink} target="_blank">
            <p className="font-inter font-normal text-sm leading-5 tracking-normal text-center underline decoration-solid decoration-0">
              View results
            </p>
          </a>
        </div>
      )}
    </div>
  )
}

export default VotingColumn
