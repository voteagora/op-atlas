"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"

import ExternalLink from "../../../components/ExternalLink"
import { Sidebar } from "../../../components/missions/Sidebar"

import {
  DocumentCallout,
  VideoCallout,
} from "@/components/missions/VideoCallouts"
import { NewIn2025Callout } from "@/components/missions/NewIn2025Callout"
import { notFound } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Apply } from "@/components/missions/Apply"
import { ProjectsEnrolled } from "@/components/missions/ProjectsEnrolled"
import React from "react"
import { Eligibility } from "@/components/missions/Eligibility"
import { FUNDING_ROUNDS } from "@/lib/mocks"
import { format } from "date-fns"

// const rounds = {
//   "retro-funding-dev-tooling": {
//     name: "Dev Tooling",
//     description:
//       "rewards toolchain software, such as compilers, libraries and debuggers, that support builders in developing onchain applications on the Superchain.",
//     imageUrl: "/assets/images/Frame 2485.png",
//     applyByDate: "Jan 25",
//     startDate: "Feb 1",
//     endDate: "Jun 30, 2025",
//     eligibility: {
//       criteria: [
//         {
//           name: "Open Source",
//           description:
//             "Projects must have a public GitHub repository with a history of public commits.",
//         },
//         {
//           name: "Ownership of GitHub repo",
//           description:
//             "A funding.json file linked to the GitHub repository must verify ownership in OP Atlas.",
//           videoLink: {
//             text: "How to verify a GitHub repo in OP Atlas",
//             link: "https://youtube.com",
//           },
//         },
//       ],
//       contextSpecificCriteria: [
//         {
//           name: "For JavaScript and Rust Packages",
//           criteria: [
//             {
//               text: "Must be published on respective registries (e.g., npm or crates.io) with the associated Github repo verified in OP Atlas.",
//               links: {
//                 npm: "https://www.npmjs.com",
//                 "crates.io": "https://crates.io",
//               },
//             },
//             {
//               text: "Must be imported by at least three verified Superchain builder projects contributing 0.01 ETH in L2 gas fees within the past 6 months.",
//             },
//           ],
//         },
//         {
//           name: "For Other Open Source Toolchains",
//           criteria: [
//             {
//               text: "Must have at least one release on GitHub within the past 6 months.",
//             },
//             {
//               text: "Must show engagement from 10+ trusted developers (e.g., stars, forks, issues, or pull requests), verified using reputation algorithms like OpenRank.",
//             },
//           ],
//         },
//       ],
//     },

//     rewards: {
//       measurement:
//         "Your impact will be measured via an evaluation algorithm powered by Github, NPM, Crate, and Onchain data. The evaluation algorithm will evolve throughout this Retro Funding Mission based on feedback from Optimism Citizens.",
//       criteria: [
//         "Adoption of Dev Tool by onchain builders",
//         `Importance of the tool in onchain application development`,
//         "Features that support superchain interop adoption among builders",
//       ],
//     },
//   },
//   "retro-funding-onchain-builders": {
//     name: "Onchain Builders",
//     description:
//       "rewards projects that drive cross-chain asset transfers, enabled through interop, by growing the Superchain across eligible OP Chains.",
//     imageUrl: "/assets/images/Frame 2486.png",
//     applyByDate: "Jan 25",
//     startDate: "Feb 1",
//     endDate: "Jun 30, 2025",
//     eligibility: {
//       criteria: [
//         {
//           name: "Onchain deployment",
//           description:
//             "Your project must have a verified contract on one of the following OP Chains: Base, Ink, Lisk, Mode, OP Mainnet, Sonium, Unichain, Worldchain, Zora.",
//         },
//         {
//           name: "Contract verification",
//           description:
//             "To verify ownership of a contract, the deployer address of the contract must sign a message in the “Contracts” step of project setup in OP Atlas.",
//           videoLink: {
//             text: "How to verify onchain contracts in OP Atlas",
//             link: "https://youtube.com",
//           },
//         },
//         {
//           name: "Contract attribution",
//           description:
//             "Contracts deployed by factories are attributed to the factory deployer. Contracts must have a single project owner applying for Retro Funding; overlapping claims are not allowed.",
//         },
//         {
//           name: "Transaction thresholds",
//           description:
//             "Projects must meet the following minimum activity requirements over the Retro Funding eligibility period:",
//           criteria: [
//             "At least 1000 transactions",
//             "At least 420 qualified addresses",
//             "10 distinct days of onchain activity",
//           ],
//         },
//         {
//           category: "DeFi projects",
//           name: "TVL and Adaptor Requirement",
//           description:
//             "DeFi projects must have a DeFiLlama adaptor and an average Total Value Locked (TVL) of at least $1M during the eligibility period. A link to the adaptor must be provided in in the “Repos & Links” step of project setup in OP Atlas.",
//           videoLink: {
//             text: "How to build an adapter",
//             link: "https://youtube.com",
//           },
//           links: {
//             "DeFiLlama adaptor": "https://defillama.com/",
//           },
//         },
//         {
//           category: "Account abstraction",
//           name: "Operator Registry Requirement",
//           description:
//             "The project must be included in the operator registry maintained by BundleBear. The address(es) verified in the application must also be present in the registry.",
//           links: {
//             BundleBear: "https://bundlebear.com/",
//           },
//         },
//       ],
//     },
//     rewards: {
//       measurement:
//         "Your impact will be measured via an evaluation algorithm powered by onchain data. The evaluation algorithm will evolve throughout this Retro Funding Mission based on feedback from Optimism Citizens.",
//       criteria: [
//         "Growth in Superchain adoption",
//         `High-quality onchain value (e.g., TVL)`,
//         "Interoperability support and adoption",
//       ],
//     },
//   },
// } as any

export default function Mission({ params }: { params: { id: string } }) {
  const foundRound = FUNDING_ROUNDS.find((page) => page.pageName === params.id)
  if (foundRound === undefined) notFound()

  // if (rounds[params.id] === undefined) notFound()

  const {
    name,
    details,
    iconUrl,
    applyBy,
    startsAt,
    endsAt,
    eligibility,
    rewards,
  } = foundRound

  //get live project data from somewhere
  //const { units, opRewarded, projectsEnrolled} = db.getProjectData(params.id);

  const userAppliedProjects: any[] = [
    {
      icon: "/assets/icons/uniswap.png",
      name: "Purrmissionless Staking",
      status: "Pending",
    },
    {
      icon: "/assets/icons/uniswap.png",
      name: "Purrmissionless Staking",
      status: "Active",
    },
  ]

  const enrolledProjects = [
    {
      opReward: 500,
      icon: "/assets/icons/uniswap.png",
    },
    {
      opReward: 3000,
      icon: "/assets/icons/uniswap.png",
    },
  ]

  const userProjectCount = 1
  const units = "240"
  const totalOpReward = enrolledProjects.reduce(
    (total, item) => total + item.opReward,
    0,
  )
  const avgOpRewardPerProject = totalOpReward / enrolledProjects.length
  //get user data from somewhere
  //const userProjectsCount = db.getUserProjectCount(session.id);

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
      {/* Main content */}
      <div className="mt-16 bg-background flex flex-col px-16 w-full max-w-5xl rounded-3xl z-10">
        <div className="mt-1 flex flex-1 gap-x-10">
          <div className="flex flex-1 flex-col">
            <div className="flex flex-col flex-1 gap-y-12">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/">
                      Retro Funding Missions
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{name}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              <div className="flex flex-col">
                <h2 className="text-4xl mb-2">{name}</h2>
                <div className="flex gap-2 mb-6 items-center">
                  <p className="font-light text-gray-700">
                    <span>{format(startsAt, "MMM d")}</span>
                    {endsAt && (
                      <span>{" - " + format(endsAt, "MMM d, yyyy")}</span>
                    )}
                  </p>
                  <div className="w-[1px] bg-gray-300 h-full"></div>
                  <Image
                    src={"/assets/icons/triangular-flag-full.png"}
                    width={1}
                    height={1}
                    alt="Sunny blobs"
                    className="h-3 w-3"
                  />

                  <p className="font-light text-gray-700">
                    Open for applications
                  </p>
                </div>
                {iconUrl && (
                  <Image
                    src={iconUrl}
                    width={124}
                    height={124}
                    className="rounded-md w-full mb-5"
                    alt="Sunny blobs"
                  />
                )}

                <div className="mb-5">
                  <span className="font-semibold ">
                    {`Retro Funding: ${name}`}
                  </span>{" "}
                  <span className="">{details}</span>
                </div>

                <ul className="list-disc pl-6">
                  <li>
                    <span className="font-bold ">{"Timeline:"}</span>
                    <span className="">
                      {` The program will take place from `}
                    </span>
                    <span>{format(startsAt, "MMM d")}</span>
                    {endsAt && (
                      <span>{" - " + format(endsAt, "MMM d, yyyy")}</span>
                    )}
                    .
                  </li>
                  <li>
                    <span className="font-semibold ">
                      {"Application period:"}
                    </span>
                    <span className="">
                      {
                        " Applications are rolling, with new applications being reviewed at the end of each month. Apply by the monthly application deadline, and your project will be evaluated for rewards starting the following month."
                      }
                    </span>
                  </li>
                  <li>
                    <span className="font-semibold ">
                      {"Eligibility and rewards:"}
                    </span>
                    <span className="">{" See details below."}</span>
                  </li>
                  <li>
                    <span className="font-semibold ">{"Grant delivery:"}</span>
                    <span className="">
                      {" Rewards are delivered monthly, starting in March."}
                    </span>
                  </li>
                  <li>
                    <span className="font-semibold ">{"Budget:"}</span>
                    <span className="">{" Budget: Up to 8M OP"}</span>
                  </li>
                </ul>

                <div className="mb-10">
                  <NewIn2025Callout />
                </div>

                <div className="flex flex-col gap-6 mb-10">
                  <p className="text-xl font-semibold">Eligibility</p>
                  <p className="font-light">
                    Applications must meet these criteria:
                  </p>

                  <Eligibility eligibility={eligibility} />
                  {/* {renderEligibilityCriteria(eligibility)} */}

                  <p>
                    {
                      "To add your project to OP Atlas, first sign in or sign up using Farcaster. From your signed in dashboard, choose “Add project” and proceed with project setup. A project can’t be considered eligible until it’s setup is complete."
                    }
                  </p>

                  <ExternalLink href={"https://youtube.com"}>
                    <VideoCallout text="How to add a project in OP Atlas" />
                  </ExternalLink>
                  {/* {eligibility} */}
                </div>

                <div className="flex flex-col gap-6">
                  <p className="text-xl font-semibold">Rewards</p>
                  <p className="font-light">
                    Your impact will be rewarded based on the following
                    criteria:
                  </p>

                  <ol className="list-decimal pl-6">
                    {rewards.criteria.map((element: any, index: number) => {
                      return <li key={"rewards" + index}>{element}</li>
                    })}
                  </ol>
                  {rewards.measurement}
                </div>
              </div>
            </div>

            {name === "Dev Tooling" ? (
              <div className="">
                <div className="bg-secondary h-[2px] mt-5 mb-5" />
                <div>
                  <span className="font-bold pr-1">Learn More</span>
                  <span>
                    in the{" "}
                    <ExternalLink
                      href="https://gov.optimism.io/t/season-7-retro-funding-missions/9295"
                      className="underline"
                    >
                      Collective Governance Forum: Retro Funding Mission: Dev
                      Tooling
                    </ExternalLink>
                  </span>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>

          <Sidebar className="ml-auto w-[290px]">
            <Apply
              applyByDate={applyBy?.toString()}
              startDate={startsAt.toString()}
              userProjectCount={userProjectCount}
              userAppliedProjects={userAppliedProjects}
            />
            {enrolledProjects.length > 0 ? (
              <ProjectsEnrolled
                units={units}
                opRewarded={totalOpReward}
                avgOpRewardPerProject={avgOpRewardPerProject}
                projects={enrolledProjects}
              />
            ) : (
              <></>
            )}
          </Sidebar>
        </div>
      </div>
    </main>
  )
}
