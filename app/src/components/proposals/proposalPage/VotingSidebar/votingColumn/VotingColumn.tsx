"use client"
import {
  EAS,
  NO_EXPIRATION,
  SchemaEncoder,
} from "@ethereum-attestation-service/eas-sdk"
import { getChainId, switchChain } from "@wagmi/core"
import { useState } from "react"
import { toast } from "sonner"

import {
  getAgoraProposalLink,
  getVotingActions,
  mapValueToVoteType,
  mapVoteTypeToValue,
} from "@/lib/utils/voting"
import {
  OffchainVote,
  ProposalType,
  VoteType,
} from "@/components/proposals/proposal.types"
import VoterActions from "@/components/proposals/proposalPage/VotingSidebar/votingCard/VoterActions"
import CandidateCards from "@/components/proposals/proposalPage/VotingSidebar/votingColumn/CanidateCards"
import OverrideVoteCard from "@/components/proposals/proposalPage/VotingSidebar/votingColumn/OverrideVoteCard"
import StandardVoteCard from "@/components/proposals/proposalPage/VotingSidebar/votingColumn/StandardVoteCard"
import { postOffchainVote } from "@/db/votes"
import { useEthersSigner } from "@/hooks/wagmi/useEthersSigner"
import { vote } from "@/lib/actions/votes"
import {
  EAS_CONTRACT_ADDRESS,
  EAS_VOTE_SCHEMA,
  OFFCHAIN_VOTE_SCHEMA_ID,
  CHAIN_ID,
} from "@/lib/eas/clientSafe"
import { useAnalytics } from "@/providers/AnalyticsProvider"
import { privyWagmiConfig } from "@/providers/PrivyAuthProvider"
import { useWallets } from "@privy-io/react-auth"
import { useSetActiveWallet } from "@privy-io/wagmi"
import { ProposalData } from "@/lib/proposals"
import { useSession } from "next-auth/react"
import { useUserCitizen } from "@/hooks/citizen/useUserCitizen"
import { useCitizenQualification } from "@/hooks/citizen/useCitizenQualification"
import { citizenCategory } from "@prisma/client"
import { CardText } from "../votingCard/VotingCard"
import useMyVote from "@/hooks/voting/useMyVote"
import { MyVote } from "../votingCard/MyVote"
import { truncateAddress } from "@/lib/utils/string"

export interface CandidateCardProps {
  name: string
  image: {
    src: string
    alt?: string
  }
  organizations: string[]
  buttonLink: string
}

const VotingChoices = ({
  proposalType,
  selectedVote,
  setSelectedVote,
}: {
  proposalType: string
  selectedVote?: VoteType
  setSelectedVote: (vote: VoteType) => void
}) => {
  switch (proposalType) {
    case "OFFCHAIN_STANDARD":
      return (
        <StandardVoteCard
          selectedVote={selectedVote}
          setSelectedVote={setSelectedVote}
        />
      )
    case "APPROVAL":
      return <CandidateCards candidates={[]} />
    case "OFFCHAIN_OPTIMISTIC":
      return <OverrideVoteCard />
    default:
      return <>{proposalType} Not Yet Supported</>
  }
}

const VotingColumn = ({ proposalData }: { proposalData: ProposalData }) => {
  const [selectedVote, setSelectedVote] = useState<VoteType | undefined>(
    undefined,
  )
  const [isVoting, setIsVoting] = useState<boolean>(false)
  const [addressMismatch, setAddressMismatch] = useState<boolean>(false)
  const handleVoteClick = (voteType: VoteType) => {
    setSelectedVote(voteType)
  }

  const { vote: myVote, invalidate: invalidateMyVote } = useMyVote(
    proposalData.id,
  )

  const { data: session } = useSession()
  const { citizen } = useUserCitizen()
  const { data: citizenEligibility } = useCitizenQualification()

  const myVoteType = myVote?.vote
    ? mapValueToVoteType(proposalData.proposalType, myVote.vote)
    : undefined

  const votingActions = getVotingActions(
    !!session?.user?.id,
    !!citizen,
    !!citizenEligibility?.eligible,
  )

  const canVote =
    !!session?.user?.id &&
    !!citizen &&
    proposalData.status === "ACTIVE" &&
    !myVote

  const { wallets } = useWallets()
  const signer = useEthersSigner({ chainId: CHAIN_ID })
  const { setActiveWallet } = useSetActiveWallet()
  const { track } = useAnalytics()

  const createDelegatedAttestation = async (choices: string[]) => {
    if (!signer) throw new Error("Signer not ready")
    if (!citizen?.address) {
      throw new Error("User citizen address not available")
    }
    const connectedChainId = getChainId(privyWagmiConfig)
    if (connectedChainId !== CHAIN_ID) {
      await switchChain(privyWagmiConfig, { chainId: CHAIN_ID })
    }

    const eas = new EAS(EAS_CONTRACT_ADDRESS)
    eas.connect(signer.provider!)
    const delegated = await eas.getDelegated()

    const encoder = new SchemaEncoder(EAS_VOTE_SCHEMA)

    const args = {
      proposalId: proposalData.id,
      choices: JSON.stringify(choices),
    }
    const encodedData = encoder.encodeData([
      { name: "proposalId", value: args.proposalId, type: "uint256" },
      { name: "params", value: args.choices, type: "string" },
    ])

    const nonce = await eas.getNonce(signer.address as `0x${string}`)

    const delegateRequest = {
      schema: OFFCHAIN_VOTE_SCHEMA_ID,
      recipient: signer.address as `0x${string}`,
      expirationTime: NO_EXPIRATION,
      revocable: false,
      refUID: citizen.attestationId as `0x${string}`,
      data: encodedData,
      value: BigInt(0),
      nonce,
      deadline: NO_EXPIRATION,
    }

    const rawSignature = await delegated.signDelegatedAttestation(
      delegateRequest,
      signer,
    )

    return {
      data: encodedData,
      rawSignature: rawSignature,
      signerAddress: signer.address as `0x${string}`,
    }
  }

  const validateAddress = () => {
    const newActiveWallet = wallets.find(
      (wallet) => wallet.address === citizen?.address,
    )
    if (!newActiveWallet) {
      setAddressMismatch(true)
      throw new Error("Citizen wallet not found. Try reconnecting.")
    } else {
      setAddressMismatch(false)
      return newActiveWallet
    }
  }

  const handleCastVote = async () => {
    if (!selectedVote) return

    const choices = mapVoteTypeToValue(
      proposalData.proposalType as ProposalType,
      selectedVote,
    )
    setIsVoting(true)

    const castAndRecordVote = async () => {
      if (!citizen?.attestationId) {
        throw new Error("User is not a registered citizen")
      }

      try {
        const newActiveWallet = validateAddress()
        if (newActiveWallet) {
          await setActiveWallet(newActiveWallet)
        }

        if (signer!.address !== citizen!.address) {
          throw new Error("Signer address does not match citizen address")
        }

        // Sign the attestation with the correct user wallet
        const { data, rawSignature, signerAddress } =
          await createDelegatedAttestation(choices)

        // 2. Send signature to server to relay onchain
        const attestationId = await vote(
          data,
          rawSignature.signature,
          signerAddress,
          citizen.attestationId,
        )

        // build an offchain vote object for the DB
        const offchainVote: OffchainVote = {
          attestationId: attestationId,
          voterAddress: signerAddress,
          proposalId: proposalData.id,
          vote: choices,
          citizenId: citizen.id,
          citizenType: citizen.type as citizenCategory,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        // 3. Record vote in the database
        await postOffchainVote(offchainVote)

        // Track successful vote submission
        track("Citizen Voting Vote Submitted", {
          proposal_id: proposalData.id,
          choice: choices,
          wallet_address: signerAddress,
        })
      } catch (error) {
        console.error("Failed to cast vote:", error)

        // Track vote error
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error"
        track("Citizen Voting Vote Error", {
          proposal_id: proposalData.id,
          error: errorMessage,
        })

        if (
          error instanceof Error &&
          error.message === "Signer address does not match citizen address"
        ) {
          const newActiveWallet = wallets.find(
            (wallet) =>
              wallet.address?.toLowerCase() === citizen.address?.toLowerCase(),
          )

          console.log({ newActiveWallet, wallets })
          if (!newActiveWallet) {
            throw new Error(
              `Citizen wallet is not connected. Try disconnecting and signing in with your Citizen wallet. ${citizen.address}`,
            )
          } else {
            setActiveWallet(newActiveWallet)
            // Prompt a retry
            throw new Error("Something went wrong. Please try again.")
          }
        } else if (
          error instanceof Error &&
          error.message
            .toLowerCase()
            .includes("User rejected the request.".toLowerCase())
        ) {
          throw new Error("User rejected signature")
        }
        throw new Error(`Failed to cast vote: ${error}`)
      } finally {
        setIsVoting(false)
      }
    }

    // 1. Create and sign an attestation for the vote
    toast.promise(castAndRecordVote(), {
      loading: "Casting Vote...",
      success: () => {
        // Update voted status to true
        invalidateMyVote()
        return "Vote Cast and Recorded!"
      },
      error: (error) => {
        return error.message
      },
    })
  }

  return (
    <div className="flex flex-col p-6 gap-y-4 border rounded-lg">
      {/* Text on the top of the card */}
      <CardText
        proposalData={proposalData}
        isCitizen={!!citizen}
        vote={myVoteType}
        eligibility={citizenEligibility}
      />
      {myVoteType && <MyVote voteType={myVoteType} />}
      {/* Actions */}
      {proposalData.status === "ACTIVE" && votingActions && !myVote && (
        <div className="flex flex-col items-center gap-y-2">
          {canVote && (
            <VotingChoices
              proposalType={proposalData.proposalType}
              selectedVote={selectedVote}
              setSelectedVote={handleVoteClick}
            />
          )}
          <VoterActions
            proposalId={proposalData.id}
            // This is a wonky way to overwrite the call to make an external call.
            cardActionList={votingActions.cardActionList.map((action) => {
              // If this is a vote action, replace its action function with handleCastVote
              // and determine if it should be disabled based on selectedVote or address mismatch
              return {
                ...action,
                action: handleCastVote,
                disabled: canVote && (addressMismatch || !selectedVote),
                loading: isVoting,
              }
            })}
          />
          {addressMismatch && citizen && !myVote && !!session?.user?.id && (
            <div className="text-red-500 text-xs text-center">
              You citizen wallet is not connected. Try signing out and signing
              in with your Citizen wallet:{" "}
              {citizen.address && truncateAddress(citizen.address)}
            </div>
          )}
        </div>
      )}
      <div className="w-full flex items-center justify-center">
        <a href={getAgoraProposalLink(proposalData.id)} target="_blank">
          <p className="text-sm text-center underline">View results</p>
        </a>
      </div>
    </div>
  )
}

export default VotingColumn
