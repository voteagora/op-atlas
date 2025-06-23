"use client"
import {
  EAS,
  NO_EXPIRATION,
  SchemaEncoder,
} from "@ethereum-attestation-service/eas-sdk"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "sonner"

import { mapVoteTypeToValue } from "@/app/proposals/utils/votingUtils"
import {
  OffchainVote,
  ProposalType,
  VoteType,
  VotingColumnProps,
} from "@/components/proposals/proposal.types"
import VotingActions from "@/components/proposals/proposalPage/VotingSidebar/VotingActions"
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
} from "@/lib/eas/clientSafe"
import {
  switchChain,
  getChainId,
  switchAccount,
  getConnections,
} from "@wagmi/core"
import { privyWagmiConfig } from "@/providers/PrivyAuthProvider"

const CHAIN_ID = process.env.NEXT_PUBLIC_ENV === "dev" ? 11155111 : 10

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
  const [isVoting, setIsVoting] = useState<boolean>(false)
  const [addressMismatch, setAddressMismatch] = useState<boolean>(false)

  const handleVoteClick = (voteType: VoteType) => {
    setSelectedVote(voteType === selectedVote ? null : voteType)
  }

  const signer = useEthersSigner({ chainId: CHAIN_ID })
  const router = useRouter()

  // Check if the current signer address matches the expected citizen address
  useEffect(() => {
    if (signer && userCitizen?.address) {
      const mismatch =
        signer.address?.toLowerCase() !== userCitizen.address.toLowerCase()
      setAddressMismatch(mismatch)
    }
  }, [signer, signer?.address, userCitizen?.address])

  // Function to prompt user to switch to the correct account
  const promptAccountSwitch = async (expectedAddress: string) => {
    try {
      // Attempt to switch account using wagmi
      const connections = getConnections(privyWagmiConfig)
      await switchAccount(privyWagmiConfig, {
        connector: connections[0]?.connector,
      })

      // The useEthersSigner hook should automatically update with the new account
      // We'll check the address match in the useEffect above
    } catch (error) {
      console.error("Failed to switch account:", error)
      toast.error(
        `Please manually switch to account ${expectedAddress} in your wallet`,
      )
      throw new Error(`Please switch to account ${expectedAddress} to continue`)
    }
  }

  const createDelegatedAttestation = async (choices: any) => {
    if (!signer) throw new Error("Signer not ready")
    if (!userCitizen?.address) {
      throw new Error("User citizen address not available")
    }

    // Check if current signer matches expected address
    if (signer.address?.toLowerCase() !== userCitizen.address.toLowerCase()) {
      await promptAccountSwitch(userCitizen.address)
      // After switching, we need to wait for the signer to update
      // This might require a re-render, so we'll throw an error to stop execution
      throw new Error("Account switched. Please try voting again.")
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
      proposalId: proposalId,
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
      refUID: userCitizen.attestationId! as `0x${string}`,
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

    const choices = mapVoteTypeToValue(
      proposalType as ProposalType,
      selectedVote,
    )
    setIsVoting(true)

    const castAndRecordVote = async () => {
      try {
        // Sign the attestation with the correct user wallet
        const { data, rawSignature, signerAddress } =
          await createDelegatedAttestation(choices)

        // 2. Send signature to server to relay onchain
        const attestationId = await vote(
          data,
          rawSignature.signature,
          signerAddress,
          userCitizen!.attestationId!,
        )

        // build an offchain vote object for the DB
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

        // 3. Record vote in the database
        await postOffchainVote(offchainVote)
      } catch (error) {
        console.error("Failed to cast vote:", error)
        throw new Error("Failed to cast vote.")
      } finally {
        setIsVoting(false)
      }
    }

    // 1. Create and sign an attestation for the vote
    toast.promise(castAndRecordVote(), {
      loading: "Casting Vote...",
      success: () => {
        return "Vote Cast and Recorded!"
      },
      error: (error) => {
        return error.message
      },
    })
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
        <>
          <VotingActions
            // This is a wonky way to overwrite the call to make an external call.
            cardActionList={votingActions.cardActionList.map((action) => {
              // If this is a vote action, replace its action function with handleCastVote
              // and determine if it should be disabled based on selectedVote or address mismatch
              if (action.actionType === "Vote") {
                return {
                  ...action,
                  action: handleCastVote,
                  disabled: !selectedVote || addressMismatch,
                  loading: isVoting,
                }
              }
              // Otherwise, return the original action unchanged
              return action
            })}
          />
          {addressMismatch && (
            <div className="text-red-500 text-sm text-center mt-2">
              You must connect your citizen wallet to vote.
            </div>
          )}
        </>
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
