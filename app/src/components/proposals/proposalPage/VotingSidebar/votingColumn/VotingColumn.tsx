"use client"
import {
  EAS,
  NO_EXPIRATION,
  SchemaEncoder,
} from "@ethereum-attestation-service/eas-sdk"
import { citizenCategory } from "@prisma/client"
import { useWallets } from "@privy-io/react-auth"
import { useSetActiveWallet } from "@privy-io/wagmi"
import { getChainId, switchChain } from "@wagmi/core"
import { Lock } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useMemo, useRef, useState } from "react"
import ReactCanvasConfetti from "react-canvas-confetti"
import { toast } from "sonner"

import { ProposalType, VoteType } from "@/components/proposals/proposal.types"
import VoterActions from "@/components/proposals/proposalPage/VotingSidebar/votingCard/VoterActions"
import CandidateCards from "@/components/proposals/proposalPage/VotingSidebar/votingColumn/CanidateCards"
import OverrideVoteCard from "@/components/proposals/proposalPage/VotingSidebar/votingColumn/OverrideVoteCard"
import StandardVoteCard from "@/components/proposals/proposalPage/VotingSidebar/votingColumn/StandardVoteCard"
import { Skeleton } from "@/components/ui/skeleton"
import { useCitizenQualification } from "@/hooks/citizen/useCitizenQualification"
import { useUserCitizen } from "@/hooks/citizen/useUserCitizen"
import useMyVote from "@/hooks/voting/useMyVote"
import { useEthersSigner } from "@/hooks/wagmi/useEthersSigner"
import { vote } from "@/lib/actions/votes"
import {
  CHAIN_ID,
  EAS_CONTRACT_ADDRESS,
  EAS_VOTE_SCHEMA,
  OFFCHAIN_VOTE_SCHEMA_ID,
} from "@/lib/eas/clientSafe"
import { ProposalData } from "@/lib/proposals"
import { truncateAddress } from "@/lib/utils/string"
import {
  getAgoraProposalLink,
  getVotingActions,
  mapValueToVoteType,
  mapVoteTypeToValue,
} from "@/lib/utils/voting"
import { isSmartContractWallet } from "@/lib/utils/walletDetection"
import { useAnalytics } from "@/providers/AnalyticsProvider"
import { privyWagmiConfig } from "@/providers/PrivyAuthProvider"

import { MyVote } from "../votingCard/MyVote"
import { CardText } from "../votingCard/VotingCard"

export interface CandidateCardProps {
  name: string
  image: {
    src: string
    alt?: string
  }
  organizations: string[]
  buttonLink: string
}

const VotingColumnSkeleton = () => (
  <div className="flex flex-col p-6 gap-y-4 border rounded-lg">
    <div className="flex flex-col text-center gap-y-2">
      <Skeleton className="h-6 w-3/4 mx-auto" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6 mx-auto" />
    </div>
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-4 w-1/2 mx-auto" />
  </div>
)

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
        <div className="transition-all duration-300 ease-in-out">
          <StandardVoteCard
            selectedVote={selectedVote}
            setSelectedVote={setSelectedVote}
          />
        </div>
      )
    case "OFFCHAIN_APPROVAL":
      return (
        <div className="transition-all duration-300 ease-in-out">
          <CandidateCards candidates={[]} />
        </div>
      )
    case "OFFCHAIN_OPTIMISTIC":
      return (
        <div className="transition-all duration-300 ease-in-out">
          <OverrideVoteCard
            selectedVote={selectedVote}
            setSelectedVote={setSelectedVote}
          />
        </div>
      )
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
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true)

  const [showConfetti, setShowConfetti] = useState(false)
  const [isSmartContract, setIsSmartContract] = useState<boolean>(false)
  const [isCheckingWallet, setIsCheckingWallet] = useState<boolean>(false)
  const [hasCheckedWallet, setHasCheckedWallet] = useState<boolean>(false)
  const brightColors = useMemo(
    () => [
      "#FF0000",
      "#FFD700",
      "#00FF00",
      "#00BFFF",
      "#FF00FF",
      "#FF8C00",
      "#39FF14",
    ],
    [],
  )

  const confettiRef = useRef<any>(null)
  const getInstance = (instance: any) => {
    confettiRef.current = instance
  }

  const handleVoteClick = (voteType: VoteType) => {
    setSelectedVote(voteType)
  }

  const {
    vote: myVote,
    invalidate: invalidateMyVote,
    isLoading: isVoteLoading,
  } = useMyVote(proposalData.id)

  const { data: session } = useSession()
  const { citizen, isLoading: isCitizenLoading } = useUserCitizen()
  const { data: citizenEligibility, isLoading: isEligibilityLoading } =
    useCitizenQualification()

  useEffect(() => {
    if (!isVoteLoading && !isCitizenLoading && !isEligibilityLoading) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [isVoteLoading, isCitizenLoading, isEligibilityLoading])

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

  useEffect(() => {
    setHasCheckedWallet(false)
    setIsSmartContract(false)
    setIsCheckingWallet(false)
  }, [citizen?.address])

  useEffect(() => {
    const checkWalletType = async () => {
      if (!signer || !citizen?.address) return

      setIsCheckingWallet(true)
      try {
        const isSmartContractDetected = await isSmartContractWallet(
          signer.provider,
          citizen.address,
        )
        setIsSmartContract(isSmartContractDetected)
      } catch (error) {
        console.warn("Error checking wallet type:", error)
        setIsSmartContract(false)
      } finally {
        setIsCheckingWallet(false)
        setHasCheckedWallet(true)
      }
    }

    if (signer && citizen?.address && !hasCheckedWallet && !isCheckingWallet) {
      checkWalletType()
    }
  }, [signer, citizen?.address, hasCheckedWallet, isCheckingWallet])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null
    if (
      showConfetti &&
      confettiRef.current &&
      typeof confettiRef.current.confetti === "function"
    ) {
      const segments = 20
      for (let i = 0; i < segments; i++) {
        const x = i / (segments - 1)
        confettiRef.current.confetti({
          particleCount: 150,
          angle: 90,
          spread: 200,
          startVelocity: 100,
          gravity: 0.35,
          ticks: 500,
          origin: { x, y: 0 },
          colors: brightColors,
        })
      }
      timeoutId = setTimeout(() => setShowConfetti(false), 8000)
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [showConfetti, brightColors])

  if (
    isInitialLoad ||
    isVoteLoading ||
    isCitizenLoading ||
    isEligibilityLoading
  ) {
    return <VotingColumnSkeleton />
  }

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

  const createMultisigWalletAttestation = async (choices: string[]) => {
    if (!signer) throw new Error("Signer not ready")
    if (!citizen?.address) {
      throw new Error("User citizen address not available")
    }

    const connectedChainId = getChainId(privyWagmiConfig)
    if (connectedChainId !== CHAIN_ID) {
      await switchChain(privyWagmiConfig, { chainId: CHAIN_ID })
    }

    const eas = new EAS(EAS_CONTRACT_ADDRESS)
    eas.connect(signer)

    const encoder = new SchemaEncoder(EAS_VOTE_SCHEMA)

    const args = {
      proposalId: proposalData.id,
      choices: JSON.stringify(choices),
    }
    const encodedData = encoder.encodeData([
      { name: "proposalId", value: args.proposalId, type: "uint256" },
      { name: "params", value: args.choices, type: "string" },
    ])

    const tx = await eas.attest({
      schema: OFFCHAIN_VOTE_SCHEMA_ID,
      data: {
        recipient: signer.address as `0x${string}`,
        expirationTime: BigInt(0),
        revocable: false,
        refUID: citizen.attestationId as `0x${string}`,
        data: encodedData,
      },
    })

    const receipt = await tx.wait()

    return {
      attestationId: receipt,
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

        let attestationId: string
        let signerAddress: string

        if (isSmartContract) {
          const attestationData = await createMultisigWalletAttestation(choices)
          signerAddress = attestationData.signerAddress
          attestationId = attestationData.attestationId
        } else {
          const attestationData = await createDelegatedAttestation(choices)
          signerAddress = attestationData.signerAddress

          attestationId = await vote(
            attestationData.data,
            attestationData.rawSignature.signature,
            signerAddress,
            citizen.attestationId,
          )
        }

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
        invalidateMyVote()
      }
    }

    // 1. Create and sign an attestation for the vote
    toast.promise(castAndRecordVote(), {
      loading: "Casting vote...",
      success: () => {
        setShowConfetti(true)
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
    <div className="flex flex-col p-6 gap-y-4 border rounded-lg transition-all duration-500 ease-in-out">
      <ReactCanvasConfetti
        style={{
          position: "fixed",
          pointerEvents: "none",
          width: "100vw",
          height: "100vh",
          top: 0,
          left: 0,
          zIndex: 9999,
        }}
        className="confetti-canvas"
        onInit={getInstance}
      />
      {/* Text on the top of the card */}
      <div className="transition-opacity duration-300 ease-in-out">
        <CardText
          proposalData={proposalData}
          isCitizen={!!citizen}
          vote={myVoteType}
          eligibility={citizenEligibility}
        />
      </div>

      {myVoteType && proposalData.proposalType === "OFFCHAIN_STANDARD" && (
        <div className="transition-all duration-300 ease-in-out animate-in slide-in-from-top-2">
          <MyVote voteType={myVoteType} />
        </div>
      )}

      {/* Actions */}
      {proposalData.status === "ACTIVE" && votingActions && !myVote && (
        <div className="flex flex-col items-center gap-y-2 transition-all duration-300 ease-in-out">
          {canVote && (
            <VotingChoices
              proposalType={proposalData.proposalType}
              selectedVote={selectedVote}
              setSelectedVote={handleVoteClick}
            />
          )}
          <div className="w-full transition-all duration-200 ease-in-out">
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
          </div>
          {addressMismatch && citizen && !myVote && !!session?.user?.id && (
            <div className="text-red-500 text-xs text-center transition-all duration-300 ease-in-out animate-in slide-in-from-bottom-2">
              You citizen wallet is not connected. Try signing out and signing
              in with your Citizen wallet:{" "}
              {citizen.address && truncateAddress(citizen.address)}
            </div>
          )}

          {isSmartContract &&
            !addressMismatch &&
            citizen &&
            !myVote &&
            !!session?.user?.id && (
              <div className="text-blue-500 text-xs text-center transition-all duration-300 ease-in-out animate-in slide-in-from-bottom-2 flex items-center justify-center gap-2">
                <Lock className="text-blue-500 w-4 h-4" />
                Smart contract wallet detected
              </div>
            )}

          {isCheckingWallet && (
            <div className="text-gray-500 text-xs text-center transition-all duration-300 ease-in-out">
              Checking wallet type...
            </div>
          )}
        </div>
      )}

      <div className="w-full flex items-center justify-center transition-opacity duration-300 ease-in-out">
        <a href={getAgoraProposalLink(proposalData.id)} target="_blank">
          <p className="text-sm text-center underline text-secondary-foreground hover:text-foreground/80 transition-colors duration-200">
            View results
          </p>
        </a>
      </div>
    </div>
  )
}

export default VotingColumn
