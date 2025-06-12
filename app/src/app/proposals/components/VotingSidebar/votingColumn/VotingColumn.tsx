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
import { ZeroHash } from "ethers"
import { useEthersSigner } from "@/hooks/wagmi/useEthersSigner"

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

  const signer = useEthersSigner({ chainId: 11155420 })

  const createDelegatedAttestation = async (voteType: VoteType) => {
    if (!signer) throw new Error("Signer not ready")
    const eas = new EAS(EAS_CONTRACT_ADDRESS)
    eas.connect(signer.provider!)
    const delegated = await eas.getDelegated()
    const VOTE_SCHEMA =
      "address Contract," +
      "uint256 Id," +
      "address Proposer," +
      "string Description," +
      "string[] Choices," +
      "uint8 Proposal_type_id," +
      "uint256 Start_block," +
      "uint256 End_block," +
      "string Proposal_type," +
      "uint256[] Tiers," +
      "uint256 Onchain_proposalid"

    const encoder = new SchemaEncoder(VOTE_SCHEMA)

    const args = {
      contract: "0x368723068b6C762b416e5A7d506a605E8b816C22",
      id: "42740012529150791772311325945937601588484139798594959324533215350132958331528",
      proposer: "0x648BFC4dB7e43e799a84d0f607aF0b4298F932DB",
      description:
        "# Jeff - Hybrid + Basic + June 12 9:26 AM ET No on-chain transactions.",
      choices: ["0"],
      proposalTypeId: 0,
      startBlock: "28966158",
      endBlock: "29095758",
      proposalType: "STANDARD",
      tiers: [],
      onChainProposalId:
        "112542233745806009107871466048611490894875302937505011175151532497811941558355",
    }
    const encodedData = encoder.encodeData([
      { name: "Contract", value: args.contract, type: "address" },
      { name: "Id", value: args.id, type: "uint256" },
      { name: "Proposer", value: args.proposer, type: "address" },
      { name: "Description", value: args.description, type: "string" },
      { name: "Choices", value: args.choices, type: "string[]" },
      { name: "Proposal_type_id", value: args.proposalTypeId, type: "uint8" },
      { name: "Start_block", value: args.startBlock, type: "uint256" },
      { name: "End_block", value: args.endBlock, type: "uint256" },
      { name: "Proposal_type", value: args.proposalType, type: "string" },
      { name: "Tiers", value: args.tiers, type: "uint256[]" },
      {
        name: "Onchain_proposalid",
        value: args.onChainProposalId,
        type: "uint256",
      },
    ])

    const nonce = await eas.getNonce(signer.address)

    const delegateRequest = {
      schema:
        "0xb16fa048b0d597f5a821747eba64efa4762ee5143e9a80600d0005386edfc995",
      recipient: signer.address as `0x${string}`,
      expirationTime: NO_EXPIRATION,
      revocable: true,
      refUID: ZeroHash,
      data: encodedData,
      value: BigInt(0),
      nonce,
      deadline: NO_EXPIRATION,
    }
    return await delegated.signDelegatedAttestation(delegateRequest, signer)
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
