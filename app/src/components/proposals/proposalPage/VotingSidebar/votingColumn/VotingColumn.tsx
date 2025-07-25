"use client"
import {
  EAS,
  NO_EXPIRATION,
  SchemaEncoder,
} from "@ethereum-attestation-service/eas-sdk"
import { useWallets } from "@privy-io/react-auth"
import { useSetActiveWallet } from "@privy-io/wagmi"
import { getChainId, switchChain } from "@wagmi/core"
import { Lock } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import {
  ProposalStatus,
  ProposalType,
  VoteType,
} from "@/components/proposals/proposal.types"
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
import { useConfetti } from "@/providers/LayoutProvider"
import { privyWagmiConfig } from "@/providers/PrivyAuthProvider"

import { MyVote } from "../votingCard/MyVote"
import { CardText } from "../votingCard/VotingCard"
import { CandidateResults } from "./CandidateResults"
import VotingQuestionnaire from "./VotingQuestionnaire"

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

// Update the VotingChoices component props and implementation
const VotingChoices = ({
  proposalType,
  selectedVotes,
  setSelectedVote,
  candidateIds,
}: {
  proposalType: string
  selectedVotes?: { voteType: VoteType; selections?: number[] }
  setSelectedVote: (vote: { voteType: VoteType; selections?: number[] }) => void // Updated type
  candidateIds: { name?: string; id: string }[]
}) => {
  switch (proposalType) {
    case "OFFCHAIN_STANDARD":
    case "HYBRID_STANDARD":
      return (
        <div className="transition-all duration-300 ease-in-out">
          <StandardVoteCard
            selectedVote={selectedVotes?.voteType}
            setSelectedVote={(voteType: VoteType) =>
              setSelectedVote({ voteType, selections: undefined })
            }
          />
        </div>
      )
    case "OFFCHAIN_APPROVAL":
    case "HYBRID_APPROVAL":
      return (
        <div className="transition-all duration-300 ease-in-out">
          <CandidateCards
            candidateIds={candidateIds}
            selectedVote={selectedVotes}
            setSelectedVote={setSelectedVote}
          />
        </div>
      )
    case "OFFCHAIN_OPTIMISTIC":
    case "HYBRID_OPTIMISTIC_TIERED":
    case "OFFCHAIN_OPTIMISTIC_TIERED":
      return (
        <div className="transition-all duration-300 ease-in-out">
          <OverrideVoteCard
            selectedVote={selectedVotes?.voteType}
            setSelectedVote={(voteType: VoteType) =>
              setSelectedVote({ voteType, selections: undefined })
            }
          />
        </div>
      )
    default:
      console.log("Unsupported VotingChoices proposal Type", { proposalType })
      return <>{proposalType} Not Yet Supported</>
  }
}

const VotingColumn = ({ proposalData }: { proposalData: ProposalData }) => {
  const [selectedVotes, setSelectedVotes] = useState<
    { voteType: VoteType; selections?: number[] } | undefined
  >(undefined)
  const [showVoteQuestionnaire, setShowVoteQuestionnaire] = useState(false)
  const [questionnaireWasCancelled, setQuestionnaireWasCancelled] =
    useState(true)
  const [questionnaireResolve, setQuestionnaireResolve] = useState<
    ((value: boolean) => void) | null
  >(null)
  // Track if the user has already submitted a vote through the questionnaire
  // This ensures that if something goes wrong during the voting process,
  // they won't be shown the questionnaire again on retry
  const [hasSubmittedVote, setHasSubmittedVote] = useState(false)

  function extractIdFromValue(value: any): { name?: string; id: string } {
    if (!value || typeof value.match !== "function") {
      return { id: value }
    }
    const urlMatch = value.match(/\[(.*?)\]\((.*?)\)/)
    if (urlMatch) {
      const name = urlMatch[1] // Extract just the name part
      const url = urlMatch[2]
      // Extract the last part of the URL (after the last slash)
      const urlParts = url.split("/")
      return { name, id: urlParts[urlParts.length - 1] }
    }
    return { id: value }
  }

  function extractCalldataFromChoice(choice: any): string {
    //TODO
    return "TODO"
  }

  const extractIdsFromArray = (arry: any): { name?: string; id: string }[] => {
    if (!Array.isArray(arry)) return []

    return arry.map((choice: any) => {
      // Extract URL from markdown format [text](url)
      if (choice?.description) {
        return extractIdFromValue(choice.description)
      }
      // Extract calldata from choices
      if (choice?.calldatas) {
        const calldata = extractCalldataFromChoice(choice)
        return { id: calldata }
      }
      try {
        return extractIdFromValue(choice)
      } catch (error) {
        console.warn("Error extracting id from choice:", error)
        return { id: choice?.toString() || String(choice) }
      }
    })
  }

  const extractIdsFromResults = (
    proposalData: ProposalData,
  ): { id: string; name?: string; value: number }[] => {
    const results = (proposalData.proposalResults as any)?.options
    if (!Array.isArray(results)) return []

    return results
      .filter((result: any) => result.isApproved === true)
      .map((result: any) => {
        // Extract URL from markdown format [text](url)
        const urlMatch = result.option.match(/\[(.*?)\]\((.*?)\)/)
        if (urlMatch) {
          const name = urlMatch[1] // Extract just the name part
          const url = urlMatch[2]
          // Extract the last part of the URL (after the last slash)
          const urlParts = url.split("/")
          const id = urlParts[urlParts.length - 1]
          return {
            id,
            name,
            value: result.weightedPercentage || 0,
          }
        }
        return {
          id: result.option,
          value: result.weightedPercentage || 0,
        }
      })
      .sort((a, b) => b.value - a.value)
  }

  const extractIds = (proposalData: ProposalData) => {
    const pData = proposalData.proposalData as any
    console.log("extractIds", { pData })
    if (
      pData?.options &&
      Array.isArray(pData.options) &&
      pData.options.length > 0
    ) {
      return extractIdsFromArray(pData.options)
    } else if (pData?.choices) {
      return extractIdsFromArray(pData.choices)
    }
    return []
  }

  const candidateIds = extractIds(proposalData)
  const resultIdsAndValues = extractIdsFromResults(proposalData)

  const [isVoting, setIsVoting] = useState<boolean>(false)
  const [addressMismatch, setAddressMismatch] = useState<boolean>(false)
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true)
  const [isSmartContract, setIsSmartContract] = useState<boolean>(false)
  const [isCheckingWallet, setIsCheckingWallet] = useState<boolean>(false)
  const [hasCheckedWallet, setHasCheckedWallet] = useState<boolean>(false)

  const setShowConfetti = useConfetti()
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

  const handleVoteClick = (vote: {
    voteType: VoteType
    selections?: number[]
  }) => {
    setSelectedVotes(vote)
  }

  const {
    vote: myVote,
    invalidate: invalidateMyVote,
    isLoading: isVoteLoading,
  } = useMyVote(proposalData.offchainProposalId)

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

  const { voteType: myVoteType, selections: myVoteSelections } = myVote?.vote
    ? mapValueToVoteType(proposalData.proposalType, myVote.vote) || {}
    : {}

  const votingActions = getVotingActions(
    !!session?.user?.id,
    !!citizen,
    !!citizenEligibility?.eligible,
  )

  const canVote =
    !!session?.user?.id &&
    !!citizen &&
    proposalData.status === ProposalStatus.ACTIVE &&
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

  if (
    isInitialLoad ||
    isVoteLoading ||
    isCitizenLoading ||
    isEligibilityLoading
  ) {
    return <VotingColumnSkeleton />
  }

  const createDelegatedAttestation = async (choices: string) => {
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
      proposalId: proposalData.offchainProposalId,
      choices: choices,
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

  const createMultisigWalletAttestation = async (choices: string) => {
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
      proposalId: proposalData.offchainProposalId,
      choices: choices,
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

  const handleQuestionnaire = () => {
    // If the user has already submitted a vote, skip the questionnaire
    if (hasSubmittedVote) {
      return Promise.resolve(true)
    }

    // Only show questionnaire for Approval type proposals (either hybrid or offchain)
    if (
      proposalData.proposalType !== "OFFCHAIN_APPROVAL" &&
      proposalData.proposalType !== "HYBRID_APPROVAL"
    ) {
      return Promise.resolve(true)
    }

    return new Promise<boolean>((resolve) => {
      // Store the resolve function so it can be called by the onCancel and onVoteSubmit handlers
      setQuestionnaireResolve(() => resolve)

      // Show the questionnaire dialog
      setShowVoteQuestionnaire(true)
    })
  }

  const handleCastVote = async () => {
    if (!selectedVotes) return

    const questionnaireComplete = await handleQuestionnaire()
    if (!questionnaireComplete) return

    const choices = mapVoteTypeToValue(
      proposalData.proposalType as ProposalType,
      selectedVotes,
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
          proposal_id: proposalData.offchainProposalId,
          choice: choices,
          wallet_address: signerAddress,
        })
      } catch (error) {
        // Collect context for the error
        const errorMessage =
          error instanceof Error ? error.message : `Unknown error: ${error}`

        const errorContext = {
          proposalData: proposalData,
          choice: choices,
          signer: signer,
          citizen: citizen,
          browser:
            typeof window !== "undefined" ? navigator?.userAgent : "unknown",
          chain_id:
            typeof window !== "undefined"
              ? window?.ethereum?.chainId
              : "unknown",
          ethereumWindow: window?.ethereum,
          wallet_provider: wallets?.[0]?.walletClientType || "unknown",
          connected_wallets: wallets?.map((w) => ({
            type: w?.walletClientType,
            address: w?.address,
          })),
          selected_vote: selectedVotes,
          timestamp: new Date().toISOString(),
          error: errorMessage,
        }

        console.error("Failed to cast vote:", errorContext)

        // Track vote error
        track("Citizen Voting Vote Error", {
          proposal_id: proposalData.offchainProposalId,
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

          if (!newActiveWallet) {
            throw new Error(
              `Your governance wallet is not connected. Please sign out, and sign back in using ${citizen.address}.`,
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
        return "Vote cast and recorded!"
      },
      error: (error) => {
        return error.message
      },
    })
  }

  return (
    <>
      {/* Text on the top of the card */}
      <div className="w-full transition-opacity duration-300 border rounded-t-lg ease-in-out">
        <CardText
          proposalData={proposalData}
          isCitizen={!!citizen}
          vote={myVoteType}
          eligibility={citizenEligibility}
        />
      </div>
      {/* If vote is concluded, and passed, show the results*/}
      {(proposalData.proposalType === "OFFCHAIN_APPROVAL" ||
        proposalData.proposalType === "HYBRID_APPROVAL") &&
      (proposalData.status === ProposalStatus.QUEUED ||
        proposalData.status === ProposalStatus.EXECUTED ||
        proposalData.status === ProposalStatus.SUCCEEDED) ? (
        <div className="border-x border-b py-4">
          <CandidateResults results={resultIdsAndValues} />
        </div>
      ) : (
        <></>
      )}

      <div className="w-[304px] flex flex-col rounded-b-lg border-x border-b py-6 px-4 duration-300 ease-in-out">
        <div className="w-[272px] gap-2">
          {myVoteType &&
            proposalData.status === ProposalStatus.ACTIVE &&
            (proposalData.proposalType === "OFFCHAIN_STANDARD" ||
              proposalData.proposalType === "HYBRID_STANDARD") && (
              <div className="transition-all duration-300 ease-in-out animate-in slide-in-from-top-2 mb-4">
                <MyVote voteType={myVoteType} />
              </div>
            )}

          {myVoteType &&
            proposalData.status === ProposalStatus.ACTIVE &&
            (proposalData.proposalType === "OFFCHAIN_APPROVAL" ||
              proposalData.proposalType === "HYBRID_APPROVAL") && (
              <div className="transition-all duration-300 ease-in-out animate-in slide-in-from-top-2 ">
                <CandidateCards
                  candidateIds={candidateIds}
                  selectedVote={{
                    voteType: myVoteType,
                    selections:
                      myVoteSelections && myVoteSelections[0]
                        ? (myVoteSelections[0] as unknown as number[])
                        : undefined,
                  }}
                  setSelectedVote={() => {}}
                  votingDisabled={true}
                />
              </div>
            )}
        </div>

        {/* Actions */}
        {proposalData.status === ProposalStatus.ACTIVE &&
          votingActions &&
          !myVote && (
            <div className="flex flex-col items-center gap-y-2 mb-4 transition-all duration-300 ease-in-out">
              {(canVote || proposalData.proposalType.includes("APPROVAL")) && (
                <VotingChoices
                  proposalType={proposalData.proposalType}
                  selectedVotes={selectedVotes}
                  setSelectedVote={handleVoteClick}
                  candidateIds={candidateIds}
                />
              )}
              <div className="w-full gap-2 transition-all duration-200 ease-in-out">
                <VoterActions
                  proposalId={proposalData.offchainProposalId}
                  // This is a wonky way to overwrite the call to make an external call.
                  cardActionList={votingActions.cardActionList.map((action) => {
                    // If this is a vote action, replace its action function with handleCastVote
                    // and determine if it should be disabled based on selectedVotes or address mismatch
                    return {
                      ...action,
                      action: handleCastVote,
                      disabled:
                        canVote &&
                        (addressMismatch ||
                          !selectedVotes?.voteType ||
                          (selectedVotes.voteType === "Approval" &&
                            !(
                              selectedVotes?.selections &&
                              selectedVotes?.selections.length > 0
                            ))),
                      loading: isVoting,
                    }
                  })}
                />
              </div>
              {addressMismatch && citizen && !myVote && !!session?.user?.id && (
                <div className="text-red-500 text-xs text-center transition-all duration-300 ease-in-out animate-in slide-in-from-bottom-2">
                  You citizen wallet is not connected. Try signing out and
                  signing in with your Citizen wallet:{" "}
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

        <div className="w-full flex flex-col gap-2 items-center justify-center">
          <a href={getAgoraProposalLink(proposalData.id)} target="_blank">
            <p className="text-sm text-center underline text-secondary-foreground hover:text-foreground/80 transition-colors duration-200">
              View results
            </p>
          </a>
        </div>
        <VotingQuestionnaire
          open={showVoteQuestionnaire}
          onCancel={() => {
            setShowVoteQuestionnaire(false)
            setQuestionnaireWasCancelled(true) // User cancelled
            if (questionnaireResolve) {
              questionnaireResolve(false)
              setQuestionnaireResolve(null)
            }
          }}
          onVoteSubmit={(vote) => {
            track("Citizen Voting Questionnaire Submitted", { vote })
            setShowVoteQuestionnaire(false)
            setQuestionnaireWasCancelled(false) // User submitted
            setHasSubmittedVote(true) // Mark that the user has submitted a vote
            if (questionnaireResolve) {
              questionnaireResolve(true)
              setQuestionnaireResolve(null)
            }
          }}
        />
      </div>
    </>
  )
}

export default VotingColumn
