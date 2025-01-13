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

const projects = {
  "retro-funding-dev-tooling": {
    name: "Dev Tooling",
    description:
      "rewards toolchain software, such as compilers, libraries and debuggers, that support builders in developing onchain applications on the Superchain.",
    imageUrl: "/assets/images/Frame 2485.png",
    applyByDate: "Jan 25",
    startDate: "Feb 1",
    endDate: "Jun 30, 2025",
    eligibility: (
      <>
        <ol className="list-decimal pl-6">
          <li>
            <span className="font-bold pr-1">{"Open Source:"}</span>
            <span>
              {
                "Projects must have a public GitHub repository with a history of public commits."
              }
            </span>
          </li>
          <li>
            <span className="font-bold pr-1">
              {"Ownership of GitHub repo:"}
            </span>
            <span>
              {
                "A funding.json file linked to the GitHub repository must verify ownership in OP Atlas."
              }
            </span>
          </li>
        </ol>

        <ExternalLink href="https://youtube.com">
          <div className="mt-2">
            <VideoCallout text="How to verify a GitHub repo in OP Atlas" />
          </div>
        </ExternalLink>

        <p className="font-bold">For JavaScript and Rust Packages:</p>

        <ul className="list-disc pl-6">
          <li>
            <span>{"Must be published on respective registries (e.g., "}</span>

            <ExternalLink href={"https://npmjs.org"}>
              <span className="underline">npm</span>
            </ExternalLink>
            <span>{" or "}</span>
            <ExternalLink href={"https://crates.io"}>
              <span className="underline">crates.io</span>
            </ExternalLink>
            <span>
              {") with the associated Github repo verified in OP Atlas."}
            </span>
          </li>
          <li>
            {
              "Must be imported by at least three verified Superchain builder projects contributing 0.01 ETH in L2 gas fees within the past 6 months."
            }
          </li>
        </ul>

        <p className="font-bold">For Other Open Source Toolchains:</p>

        <ul className="list-disc pl-6">
          <li>
            {
              "Must have at least one release on GitHub within the past 6 months."
            }
          </li>
          <li>
            {
              "Must show engagement from 10+ trusted developers (e.g., stars, forks, issues, or pull requests), verified using reputation algorithms like OpenRank."
            }
          </li>
        </ul>

        <p>
          {
            "To add your project to OP Atlas, first sign in or sign up using Farcaster. From your signed in dashboard, choose “Add project” and proceed with project setup. A project can’t be considered eligible until it’s setup is complete."
          }
        </p>

        <ExternalLink href={"https://youtube.com"}>
          <VideoCallout text="How to add a project in OP Atlas" />
        </ExternalLink>
      </>
    ),
    rewards: {
      measurement:
        "Your impact will be measured via an evaluation algorithm powered by Github, NPM, Crate, and Onchain data. The evaluation algorithm will evolve throughout this Retro Funding Mission based on feedback from Optimism Citizens.",
      criteria: [
        "Adoption of Dev Tool by onchain builders",
        `Importance of the tool in onchain application development`,
        "Features that support superchain interop adoption among builders",
      ],
    },
  },
  "retro-funding-onchain-builders": {
    name: "Onchain Builders",
    description:
      "rewards projects that drive cross-chain asset transfers, enabled through interop, by growing the Superchain across eligible OP Chains.",
    imageUrl: "/assets/images/Frame 2486.png",
    applyByDate: "Jan 25",
    startDate: "Feb 1",
    endDate: "Jun 30, 2025",
    eligibility: (
      <>
        <ol>
          <li>
            <span className="pr-1">1.</span>
            <span className="font-bold pr-1">{"Onchain deployment:"}</span>
            <span>
              {
                "Your project must have a verified contract on one of the following OP Chains: Base, Ink, Lisk, Mode, OP Mainnet, Sonium, Unichain, Worldchain, Zora."
              }
            </span>
          </li>
          <li>
            <span className="pr-1">2.</span>
            <span className="font-bold pr-1">{"Contract verification:"}</span>
            <span>
              {
                "To verify ownership of a contract, the deployer address of the contract must sign a message in the “Contracts” step of project setup in OP Atlas."
              }
            </span>

            <ExternalLink href="https://youtube.com">
              <div className="mt-6 mb-6">
                <VideoCallout text="How to verify onchain contracts in OP Atlas" />
              </div>
            </ExternalLink>
          </li>

          <li>
            <span className="pr-1">3.</span>
            <span className="font-bold pr-1">{"Contract attribution:"}</span>
            <span>
              {
                "Contracts deployed by factories are attributed to the factory deployer. Contracts must have a single project owner applying for Retro Funding; overlapping claims are not allowed."
              }
            </span>
          </li>

          <li>
            <span className="pr-1">4.</span>
            <span className="font-bold pr-1">{"Transaction thresholds:"}</span>
            <span>
              {
                "Projects must meet the following minimum activity requirements over the Retro Funding eligibility period:"
              }
            </span>
            <ul className="list-disc pl-10">
              <li>At least 1000 transactions</li>
              <li>At least 420 qualified addresses</li>
              <li>10 distinct days of onchain activity</li>
            </ul>

            <div className="mt-6 mb-6">
              <p>
                Additional criteria for{" "}
                <span className="font-bold">DeFi projects:</span>
              </p>
            </div>
          </li>

          <li>
            <span className="pr-1">5.</span>
            <span className="font-bold pr-1">
              {"TVL and Adaptor Requirement:"}
            </span>
            <span>{"DeFi projects must have a "}</span>
            <ExternalLink className="underline" href={"https://defillama.com/"}>
              <span>DefiLlama</span>
            </ExternalLink>
            <span>
              {
                " adaptor and an average Total Value Locked (TVL) of at least $1M during the eligibility period. A link to the adaptor must be provided in in the “Repos & Links” step of project setup in OP Atlas."
              }
            </span>

            <ExternalLink href="https://youtube.com">
              <div className="mt-6 mb-6">
                <DocumentCallout text="How to build an adapter" />
              </div>
            </ExternalLink>

            <div className="mt-6 mb-6">
              <p>
                Additional criteria for{" "}
                <span className="font-bold">Account abstraction:</span>
              </p>
            </div>
          </li>

          <li>
            <span className="pr-1">6.</span>
            <span className="font-bold pr-1">
              {"Operator Registry Requirement:"}
            </span>
            <span>
              {
                "The project must be included in the operator registry maintained by "
              }
            </span>
            <ExternalLink
              className="underline"
              href="https://www.bundlebear.com/"
            >
              <span className="">BundleBear</span>
            </ExternalLink>
            <span>
              {
                " .The address(es) verified in the application must also be present in the registry."
              }
            </span>

            <div className="mt-6 mb-6">
              <p>
                {
                  "To add your project to OP Atlas, first sign in or sign up using Farcaster. From your signed in dashboard, choose “Add project” and proceed with project setup. A project can’t be considered eligible until it’s setup is complete."
                }
              </p>
            </div>

            <ExternalLink href="https://youtube.com">
              <div className="mt-6 mb-6">
                <VideoCallout text="How to add a project in OP Atlas" />
              </div>
            </ExternalLink>
          </li>
        </ol>
      </>
    ),

    rewards: {
      measurement:
        "Your impact will be measured via an evaluation algorithm powered by onchain data. The evaluation algorithm will evolve throughout this Retro Funding Mission based on feedback from Optimism Citizens.",
      criteria: [
        "Growth in Superchain adoption",
        `High-quality onchain value (e.g., TVL)`,
        "Interoperability support and adoption",
      ],
    },
  },
} as any

export default function Mission({ params }: { params: { id: string } }) {
  if (projects[params.id] === undefined) notFound()

  const {
    name,
    description,
    imageUrl,
    applyByDate,
    startDate,
    endDate,
    eligibility,
    rewards,
  } = projects[params.id]

  //get live project data from somewhere
  //const { units, opRewarded, projectsEnrolled} = db.getProjectData(params.id);

  const userProjectCount = 1
  const units = "240"
  const opRewarded = "76,000"
  const projectsEnrolled = 77
  const avgOpRewardPerProject = "1,250"
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
                    {startDate + " - " + endDate}
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
                {imageUrl && (
                  <Image
                    src={imageUrl}
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
                  <span className="">{description}</span>
                </div>

                <ul className="list-disc pl-6">
                  <li>
                    <span className="font-bold ">{"Timeline:"}</span>
                    <span className="">
                      {` The program will take place from ${
                        startDate + " - " + endDate
                      }`}
                    </span>
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

                  {eligibility}
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

          <Sidebar
            className="ml-auto w-[290px]"
            applyByDate={applyByDate}
            startDate={startDate}
            projectsEnrolled={18}
            units="5"
            opRewarded="25,400"
            avgOpRewardPerProject="450"
            userProjectCount={1}
          >
            <Apply
              applyByDate={applyByDate}
              startDate={startDate}
              userProjectCount={userProjectCount}
            />
            <ProjectsEnrolled
              projectsEnrolled={projectsEnrolled}
              units={units}
              opRewarded={opRewarded}
              avgOpRewardPerProject={avgOpRewardPerProject}
            />
          </Sidebar>
        </div>
      </div>
    </main>
  )
}
