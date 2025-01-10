"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"

import ExternalLink from "../../../components/ExternalLink"
import { Sidebar } from "../../../components/missions/Sidebar"

import { VideoCallout } from "@/components/missions/VideoCallouts"
import { NewIn2025Callout } from "@/components/missions/NewIn2025Callout"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const projects = {
  "retro-funding-onchain-builders": {
    name: "Dev Tooling",
    description:
      "rewards toolchain software, such as compilers, libraries and debuggers, that support builders in developing onchain applications on the Superchain.",
    applyByDate: "Jan 25",
    startDate: "Feb 1",
    endDate: "Jun 30, 2025",
    eligibility: [
      {
        name: "Open Source",
        description:
          "Projects must have a public GitHub repository with a history of public commits.",
      },
      {
        name: "Ownership of GitHub repo",
        description:
          "A funding.json file linked to the GitHub repository must verify ownership in OP Atlas.",
        videoCallout: {
          name: "How to verify a GitHub repo in OP Atlas",
          link: "https://youtube.com",
        },
      },
    ],

    mainContent: <></>,
  },
} as any

export default function Mission({ params }: { params: { id: string } }) {
  const { name, description, applyByDate, startDate, endDate, eligibility } =
    projects[params.id]

  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
      {/* Main content */}
      <div className="mt-16 bg-background flex flex-col px-16 w-full max-w-5xl rounded-3xl z-10">
        <div className="mt-1 flex flex-1 gap-x-10">
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
              <Image
                src={"/assets/images/Frame 2485.png"}
                width={124}
                height={124}
                className="rounded-md w-full mb-5"
                alt="Sunny blobs"
              />

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

                <ol>
                  {eligibility.map((element: any, index: number) => {
                    return (
                      <>
                        <li>
                          <span className="font-bold pr-2">{index + "."}</span>
                          <span className="font-bold pr-1">
                            {element.name + ":"}
                          </span>
                          <span>{element.description}</span>
                        </li>
                        {element.videoCallout ? (
                          <ExternalLink href={element.videoCallout.link}>
                            <div className="mt-5">
                              <VideoCallout text={element.videoCallout.name} />
                            </div>
                          </ExternalLink>
                        ) : (
                          <></>
                        )}
                      </>
                    )
                  })}
                </ol>

                <p className="font-bold">For JavaScript and Rust Packages:</p>

                <ul className="list-disc pl-6">
                  <li>
                    <span>
                      {"Must be published on respective registries (e.g., "}
                    </span>

                    <ExternalLink href={"https://npmjs.org"}>
                      <span className="underline">npm</span>
                    </ExternalLink>
                    <span>{" or "}</span>
                    <ExternalLink href={"https://crates.io"}>
                      <span className="underline">crates.io</span>
                    </ExternalLink>
                    <span>
                      {
                        ") with the associated Github repo verified in OP Atlas."
                      }
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
              </div>

              <div className="flex flex-col gap-6">
                <p className="text-xl font-semibold">Rewards</p>
                <p className="font-light">
                  Your impact will be rewarded based on the following criteria:
                </p>

                <ol className="list-decimal pl-6">
                  <li>
                    <span>{`Importance of the tool in onchain application development`}</span>
                  </li>
                  <li>
                    <span>{`Features that support superchain interop adoption among builders`}</span>
                  </li>
                </ol>
                <p>
                  {
                    "Your impact will be measured via an evaluation algorithm powered by Github, NPM, Crate, and Onchain data. The evaluation algorithm will evolve throughout this Retro Funding Mission based on feedback from Optimism Citizens."
                  }
                </p>
              </div>
            </div>
          </div>
          <Sidebar
            className="ml-auto w-[290px]"
            applyByDate={applyByDate}
            startDate={startDate}
            projectsEnrolled={18}
          />
        </div>
      </div>
    </main>
  )
}
