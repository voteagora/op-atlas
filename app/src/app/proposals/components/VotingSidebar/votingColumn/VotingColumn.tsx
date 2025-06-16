"use client"
import {
  EAS,
  NO_EXPIRATION,
  SchemaEncoder,
} from "@ethereum-attestation-service/eas-sdk"
import { ZeroHash } from "ethers"
import { useState } from "react"

import VotingActions, {
  CardActionsProps,
} from "@/app/proposals/components/VotingSidebar/VotingActions"
import CandidateCards from "@/app/proposals/components/VotingSidebar/votingColumn/CanidateCards"
import OverrideVoteCard from "@/app/proposals/components/VotingSidebar/votingColumn/OverrideVoteCard"
import StandardVoteCard from "@/app/proposals/components/VotingSidebar/votingColumn/StandardVoteCard"
import { Citizen, OffchainVote, VoteType } from "@/app/proposals/proposal.types"
import { postOffchainVote, upsertOffchainVote } from "@/db/votes"
import { useEthersSigner } from "@/hooks/wagmi/useEthersSigner"
import { vote } from "@/lib/actions/votes"

// Optimism address
const EAS_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_ENV === "dev"
    ? "0xC2679fBD37d54388Ce493F1DB75320D236e1815e"
    : "0x4200000000000000000000000000000000000021"

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
    case "OFFCHAIN_STANDARD":
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
      return <>{proposalType} Not Yet Supported</>
  }
}

export interface VotingColumnProps {
  proposalType: string
  proposalId: string
  options?: CandidateCardProps[]
  votingActions?: CardActionsProps
  currentlyActive?: boolean
  userSignedIn?: boolean
  userCitizen?: Citizen
  userVoted?: boolean
  resultsLink: string
}

const VotingColumn = ({
  proposalType,
  proposalId,
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

  const signer = useEthersSigner({ chainId: 11155111 })

  const createDelegatedAttestation = async (voteType: VoteType) => {
    if (!signer) throw new Error("Signer not ready")
    const eas = new EAS(EAS_CONTRACT_ADDRESS)
    eas.connect(signer.provider!)
    const delegated = await eas.getDelegated()
    const VOTE_SCHEMA = "uint256 proposalId,string params"

    const encoder = new SchemaEncoder(VOTE_SCHEMA)

    let choices: string[]

    switch (voteType) {
      case VoteType.For:
        choices = ["0"]
        break
      case VoteType.Abstain:
        choices = ["1"]
        break
      case VoteType.Against:
        choices = ["2"]
        break
      default:
        choices = []
        break
    }

    const args = {
      proposalId: proposalId,
      choices: JSON.stringify(choices),
    }
    const encodedData = encoder.encodeData([
      { name: "proposalId", value: args.proposalId, type: "uint256" },
      { name: "params", value: args.choices, type: "string" },
    ])

    const nonce = await eas.getNonce(signer.address)

    const delegateRequest = {
      schema:
        "0xe55f129f30d55bd712c8355141474f886a9d38f218d94b0d63a00e73c6d65a09",
      recipient: signer.address as `0x${string}`,
      expirationTime: NO_EXPIRATION,
      revocable: false,
      refUID: ZeroHash,
      data: encodedData,
      value: BigInt(0),
      nonce,
      deadline: NO_EXPIRATION,
    }
    return {
      data: encodedData,
      rawSignature: await delegated.signDelegatedAttestation(
        delegateRequest,
        signer,
      ),
      signerAddress: signer.address,
    }
  }

  const handleCastVote = async () => {
    if (!selectedVote) return

    try {
      // 1. Create and sign an attestation for the vote
      const { data, rawSignature, signerAddress } =
        await createDelegatedAttestation(selectedVote)
      // 2. Send signature to server to relay onchain
      const attestationId = await vote(
        data,
        rawSignature.signature,
        signerAddress,
      )

      //TODO move somewhere else
      let choices: string[]
      switch (selectedVote) {
        case VoteType.For:
          choices = ["0"]
          break
        case VoteType.Abstain:
          choices = ["1"]
          break
        case VoteType.Against:
          choices = ["2"]
          break
        default:
          choices = []
          break
      }

      console.log("citizenId", userCitizen?.id)

      // build an offhchain vote object for the DB
      const offchainVote: OffchainVote = {
        attestationId: attestationId,
        voterAddress: signerAddress,
        proposalId: proposalId,
        vote: choices,
        citizenId: userCitizen!.id,
        citizenType: userCitizen!.type,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      // 3. Record vote in database
      await postOffchainVote(offchainVote)
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
          citizen={!!userCitizen}
          voted={userVoted}
          selectedVote={selectedVote}
          setSelectedVote={handleVoteClick}
        />
      </div>
      {currentlyActive && votingActions && !userVoted && (
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

      {!currentlyActive ||
        (userVoted && (
          <div className="w-full flex items-center justify-center gap-2.5">
            <a href={resultsLink} target="_blank">
              <p className="font-inter font-normal text-sm leading-5 tracking-normal text-center underline decoration-solid decoration-0">
                View results
              </p>
            </a>
          </div>
        ))}
    </div>
  )
}

export default VotingColumn
