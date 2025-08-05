"use client"

import { DialogProps } from "@radix-ui/react-dialog"
import {
  Alignment,
  Fit,
  Layout,
  useRive,
  useStateMachineInput,
} from "@rive-app/react-canvas-lite"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import {
  ArrowRight,
  BugLine,
  CodeFill,
  FundsLine,
  ShiningLine,
} from "@/components/icons/remix"
import { Dialog, DialogDescription, DialogDrawer } from "@/components/ui/dialog"
import { useAnalytics } from "@/providers/AnalyticsProvider"

type DecisionNode =
  | {
      question: string
      options: { [option: string]: DecisionNode }
      title: string
    }
  | { result: GrantInfo[]; title?: string; question?: string }

type GrantInfo = {
  name: string
  icon: JSX.Element
  description: string
  href: string
}

const grantsInfo: Record<string, GrantInfo> = {
  auditGrants: {
    name: "Audit Grants",
    icon: <BugLine className="w-6 h-6" />,
    description: "For audit-ready apps looking to deploy on the Superchain.",
    href: "missions/audit-grants",
  },
  growthGrants: {
    name: "Growth Grants",
    icon: <FundsLine className="w-6 h-6" />,
    description:
      "For apps that have already deployed, looking to boost their TVL.",
    href: "missions/growth-grants",
  },
  retroFundingDevTooling: {
    name: "Retro Funding: Dev Tooling",
    icon: <ShiningLine className="w-6 h-6" />,
    description:
      "For tools that are already making an impact on the Superchain.",
    href: "missions/retro-funding-dev-tooling",
  },
  retroFundingOnchainBuilders: {
    name: "Retro Funding: Onchain Builders",
    icon: <ShiningLine className="w-6 h-6" />,
    description:
      "For apps that are already making an impact on the Superchain.",
    href: "missions/retro-funding-onchain-builders",
  },
  foundationMissions: {
    name: "Foundation Missions",
    icon: <CodeFill className="w-6 h-6" />,
    description:
      "Check out Foundation Missions if you're looking for a project.",
    href: "missions/foundation-missions",
  },
}

const auditGrantsSuggestion: DecisionNode = {
  title: "Since you're building something new,",
  question: "check out:",
  result: [grantsInfo.auditGrants],
}

const growthGrantsAndBuildersSuggestion: DecisionNode = {
  title: "Since you have an existing project,",
  question: "check out:",
  result: [grantsInfo.growthGrants, grantsInfo.retroFundingOnchainBuilders],
}

const devToolingSuggestion: DecisionNode = {
  title: "Since you have an existing project,",
  question: "check out:",
  result: [grantsInfo.retroFundingDevTooling],
}

const growthDevToolingAndOnChainBuildersSuggestion: DecisionNode = {
  title: "Okay!",
  question: "Several programs might work for your project:",
  result: [
    grantsInfo.growthGrants,
    grantsInfo.retroFundingDevTooling,
    grantsInfo.retroFundingOnchainBuilders,
  ],
}

const foundationMissionsSuggestion: DecisionNode = {
  title: "Alright!",
  question: "Since you’re looking for a project, check out:",
  result: [grantsInfo.foundationMissions],
}

const projectsGrantsTree: DecisionNode = {
  title: "Fantastic!",
  question: "What kind of project is it?",
  options: {
    "Onchain app": {
      title: "The future is onchain!",
      question: "What’s the main focus of your app?",
      options: {
        DeFi: auditGrantsSuggestion,
        "Gaming or NFTs": auditGrantsSuggestion,
        "Social or governance tools": auditGrantsSuggestion,
        "Something else": auditGrantsSuggestion,
      },
    },
    "Tooling or infrastructure": {
      title: "Help a builder out!",
      question: "What’s the main focus of your project?",
      options: {
        "Developer tools for building onchain apps": auditGrantsSuggestion,
        "Infrastructure to support chains": auditGrantsSuggestion,
        "Something else": auditGrantsSuggestion,
      },
    },
    "Something else": auditGrantsSuggestion,
  },
}

const existingProjectsGrantsTree: DecisionNode = {
  title: "Fantastic!",
  question: "What kind of project is it?",
  options: {
    "Onchain app": {
      title: "The future is onchain!",
      question: "What’s the main focus of your app?",
      options: {
        DeFi: growthGrantsAndBuildersSuggestion,
        "Gaming or NFTs": growthGrantsAndBuildersSuggestion,
        "Social or governance tools": growthGrantsAndBuildersSuggestion,
        "Something else": growthGrantsAndBuildersSuggestion,
      },
    },
    "Tooling or infrastructure": {
      title: "Help a builder out!",
      question: "What’s the main focus of your project?",
      options: {
        "Developer tools for building onchain apps": devToolingSuggestion,
        "Infrastructure to support chains": devToolingSuggestion,
        "Something else": devToolingSuggestion,
      },
    },
    "Something else": growthDevToolingAndOnChainBuildersSuggestion,
  },
}

const lookingForNewProjectsGrantsTree: DecisionNode = {
  title: "Take the red pill!",
  question: "What are you most interested in?",
  options: {
    "Developing onchain contracts": foundationMissionsSuggestion,
    "Backend and infrastructure": foundationMissionsSuggestion,
    "Non-technical work (ie Design and Support)": foundationMissionsSuggestion,
    "Something else": foundationMissionsSuggestion,
  },
}

// Main decision tree object
const decisionTree: DecisionNode = {
  title: "Sunny can help you find the right program.",
  question: "What are you building?",
  options: {
    "I’m building something new": {
      title: "Awesome!",
      question: "Are you working with a team?",
      options: {
        "I’m working with a team": projectsGrantsTree,
        "I’m a solo builder": projectsGrantsTree,
      },
    },
    "I have an existing project": {
      title: "Awesome!",
      question: "Are you working with a team?",
      options: {
        "I’m working with a team": existingProjectsGrantsTree,
        "I’m a solo builder": existingProjectsGrantsTree,
      },
    },
    "I’m looking for a project": {
      title: "Awesome!",
      question: "Are you working with a team?",
      options: {
        "I’m working with a team": lookingForNewProjectsGrantsTree,
        "I’m a solo builder": lookingForNewProjectsGrantsTree,
      },
    },
  },
}

// Type guard to check if a node is a question node
const isQuestionNode = (
  node: DecisionNode,
): node is {
  question: string
  options: { [option: string]: DecisionNode }
  title: string
} => {
  return "options" in node && node.options !== undefined
}

// Type guard to check if a node is a result node
const isResultNode = (
  node: DecisionNode,
): node is { result: GrantInfo[]; title?: string; question?: string } => {
  return "result" in node && node.result !== undefined
}

export const SunnyModal = ({ open, onOpenChange }: DialogProps) => {
  const [currentNode, setCurrentNode] = useState<DecisionNode>(decisionTree)
  const [navigationHistory, setNavigationHistory] = useState<DecisionNode[]>([])
  const [progress, setProgress] = useState(0)
  const [journeyPath, setJourneyPath] = useState<string[]>([])
  const [sessionId] = useState(
    () => `sunny_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
  )
  const { track } = useAnalytics()

  // Helper to compute remaining depth to a result node from any point in the tree
  const getBranchDepth = useCallback((node: DecisionNode): number => {
    if (isResultNode(node)) return 0
    return 1 + Math.max(...Object.values(node.options).map(getBranchDepth))
  }, [])

  // Calculate progress dynamically based on actual branch depth
  const calculateProgress = useCallback(
    (historyLength: number, node: DecisionNode): number => {
      if (isResultNode(node)) return 100
      const totalDepth = historyLength + getBranchDepth(node)
      return (historyLength / totalDepth) * 100
    },
    [getBranchDepth],
  )

  const { rive, RiveComponent } = useRive({
    src: "/assets/images/sunny-animation.riv",
    autoplay: true,
    stateMachines: "State Machine 1",
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.TopCenter,
    }),
  })

  const hoverInput = useStateMachineInput(rive, "State Machine 1", "hover")

  useEffect(() => {
    if (open) {
      setCurrentNode(decisionTree)
      setNavigationHistory([])
      setJourneyPath([])
      setProgress(calculateProgress(0, decisionTree))

      // Track journey start
      track("Sunny Guide Journey Start", {
        source: "sunny_modal",
        session_id: sessionId,
        category: "Sunny Guide",
      })
    }
  }, [calculateProgress, open, sessionId, track])

  const handleOptionClick = (optionKey: string, nextNode: DecisionNode) => {
    const newJourneyPath = [...journeyPath, optionKey]
    const newHistory = [...navigationHistory, currentNode]

    // Track the decision tree navigation with complete journey

    setJourneyPath(newJourneyPath)
    setNavigationHistory(newHistory)
    setCurrentNode(nextNode)
    setProgress(calculateProgress(newHistory.length, nextNode))

    // If this leads to a result, track journey completion
    if (isResultNode(nextNode)) {
      track("Sunny Guide Complete", {
        source: "sunny_modal",
        session_id: sessionId,
        final_result: nextNode.result.map((r) => r.name).join(", "),
        journey_path: newJourneyPath.join(" → "),
        journey_steps: newJourneyPath,
        total_steps: newJourneyPath.length,
        category: "Sunny Guide",
      })
    } else {
      track("Sunny Guide Navigation", {
        source: "sunny_modal",
        session_id: sessionId,
        current_question: currentNode.title || currentNode.question,
        selected_option: optionKey,
        next_node_type: isResultNode(nextNode) ? "result" : "question",
        navigation_depth: navigationHistory.length + 1,
        journey_path: newJourneyPath.join(" → "),
        journey_steps: newJourneyPath,
        category: "Sunny Guide",
      })
    }
  }

  const handleStartOver = () => {
    // Track when user starts over with journey context
    track("Decision Tree Reset", {
      source: "sunny_modal",
      session_id: sessionId,
      previous_depth: navigationHistory.length,
      previous_journey_path: journeyPath.join(" → "),
      previous_journey_steps: journeyPath,
      category: "Sunny Guide",
    })

    setCurrentNode(decisionTree)
    setNavigationHistory([])
    setJourneyPath([])
    setProgress(calculateProgress(0, decisionTree))
  }

  // Common header and progress bar component
  const renderHeader = () => (
    <>
      <div className="flex flex-col justify-start items-center gap-2">
        <div className="self-stretch text-center text-[#0f111a] text-xl font-semibold leading-7">
          {currentNode.title}
          <br />
          {currentNode.question}
        </div>
      </div>
      <div className="w-[100px] h-2 bg-[#f2f3f8] rounded-[144px] inline-flex justify-start items-center gap-2.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#ff5c6c] to-brand-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </>
  )

  const renderStartOver = () => {
    return (
      <div className="flex justify-center items-center gap-4">
        <button
          onClick={handleStartOver}
          className="px-4 py-2.5 rounded-md inline-flex justify-center items-center gap-2 hover:bg-[#F2F3F8] transition-colors"
        >
          <div className="justify-start text-secondary-foreground text-sm font-medium leading-tight">
            Start over
          </div>
        </button>
      </div>
    )
  }

  const renderWasThisHelpful = () => {
    const handleToast = (helpful: boolean) => {
      // Track feedback
      track("Sunny Guide Feedback", {
        source: "sunny_modal",
        helpful: helpful,
        final_result: isResultNode(currentNode)
          ? currentNode.result.map((r) => r.name).join(", ")
          : "unknown",
        navigation_depth: navigationHistory.length,
        journey_path: journeyPath.join(" → "),
        journey_steps: journeyPath,
        session_id: sessionId,
        category: "Sunny Guide",
      })

      toast("\u{1F64F} Thank you for your feedback", {
        style: {
          zIndex: 999,
        },
        position: "bottom-right",
        duration: 3000,
      })
    }

    return (
      <div className="inline-flex justify-center items-center gap-2 text-secondary-foreground">
        <div className="justify-start text-xs font-medium leading-none">
          Was this helpful?
        </div>
        <div className="flex justify-start items-start gap-1">
          <div
            className="w-10 px-2 py-1 bg-[#f2f3f8] rounded flex justify-center items-center gap-2 cursor-pointer"
            onClick={() => handleToast(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleToast(true)
            }}
          >
            <div className="justify-start text-xs font-medium leading-none">
              Yes
            </div>
          </div>
          <div
            className="w-10 px-2 py-1 bg-[#f2f3f8] rounded flex justify-center items-center gap-2 cursor-pointer"
            onClick={() => handleToast(false)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleToast(false)
            }}
          >
            <div className="justify-start text-xs font-medium leading-none">
              No
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- Result rendering continues below ---

  const renderContent = () => {
    if (isResultNode(currentNode)) {
      return (
        <>
          <div className="flex flex-col justify-start items-center gap-4">
            <div className="self-stretch flex flex-col justify-center items-start gap-2">
              {currentNode.result.map((program: GrantInfo) => (
                <Link
                  href={program.href}
                  key={program.name}
                  className="w-full p-6 rounded-xl border border-tertiary inline-flex flex-col justify-start items-start cursor-pointer hover:bg-[#F2F3F8] transition-colors group"
                  onClick={() => {
                    track("Grant Program Click", {
                      source: "sunny_modal",
                      session_id: sessionId,
                      program_name: program.name,
                      program_href: program.href,
                      navigation_depth: navigationHistory.length,
                      journey_path: journeyPath.join(" → "),
                      journey_steps: journeyPath,
                      category: "Sunny Guide",
                    })
                  }}
                >
                  <div className="self-stretch inline-flex justify-start items-center gap-4">
                    {program.icon}
                    <div className="flex-1 inline-flex flex-col text-base leading-normal">
                      <div className="text-[#0F111A] font-medium group-hover:underline">
                        {program.name}
                      </div>
                      <div className="text-secondary-foreground">
                        {program.description}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {renderStartOver()}
          </div>
          {renderWasThisHelpful()}
        </>
      )
    }

    if (isQuestionNode(currentNode)) {
      return (
        <div className="flex flex-col justify-start items-center gap-4">
          <div className="self-stretch flex flex-col justify-center items-start gap-2">
            {Object.entries(currentNode.options).map(
              ([optionKey, nextNode]) => (
                <button
                  key={optionKey}
                  onClick={() => handleOptionClick(optionKey, nextNode)}
                  className="self-stretch px-6 py-4 bg-contrast-foreground rounded-md outline outline-1 outline-offset-[-1px] outline-[#e0e2eb] inline-flex justify-between items-center hover:bg-[#f5f6fa] transition-colors cursor-pointer"
                >
                  <div className="justify-start text-[#0f111a] text-base font-medium leading-normal">
                    {optionKey}
                  </div>
                  <ArrowRight className="w-6 h-6" />
                </button>
              ),
            )}
          </div>
          {progress !== 0 && renderStartOver()}
        </div>
      )
    }

    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogDrawer>
        <DialogDescription className="p-6 md:py-8 md:px-14 gap-6 flex flex-col">
          <div className="flex flex-col justify-start items-center gap-4">
            <div
              data-has-face="True"
              className="w-[120px] h-[120px] md:w-[180px] md:h-[180px] mb-[-20px] md:mb-[-40px] mt-[-20px] md:mt-[-54px]"
            >
              <RiveComponent
                onMouseEnter={() => {
                  if (hoverInput) {
                    hoverInput.fire()
                  }
                }}
                className="w-full h-full"
              />
            </div>
            {renderHeader()}
          </div>

          {renderContent()}
        </DialogDescription>
      </DialogDrawer>
    </Dialog>
  )
}
