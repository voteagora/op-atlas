"use client"

import { Project } from "@prisma/client"
import { useSession } from "next-auth/react"

import { FUNDING_ROUNDS } from "@/lib/mocks"
import { ProjectWithDetails, UserWithAddresses } from "@/lib/types"
import Image from "next/image"
// import Account
// import { Account } from "../common/Account"
// import { FeedbackButton } from "../common/FeedbackButton"
import ExternalLink from "../../../components/ExternalLink"
import { Sidebar } from "../../../components/missions/Sidebar"

import { AxeIcon } from "lucide-react"

export default function Mission({ params }: { params: { id: string } }) {
  return (
    <main className="flex flex-col flex-1 h-full items-center pb-12 relative">
      {/* Main content */}
      <div className="mt-16 bg-background flex flex-col px-16 w-full max-w-5xl rounded-3xl z-10">
        <div className="mt-1 flex flex-1 gap-x-10">
          <div className="flex flex-col flex-1 gap-y-12">
            <div className="flex flex-col">
              <div className="flex gap-3 mb-10">
                <p className="text-gray-500 text-sm font-light">
                  Retro Funding Missions{" "}
                </p>
                <p className="text-sm font-light">{">"}</p>
                <p className="text-sm font-light text-black">Dev Tooling</p>
              </div>

              <h2 className="text-4xl mb-2">Dev Tooling</h2>
              <div className="flex gap-2 mb-6 items-center">
                <p className="font-light text-gray-700">Feb 1 - Jun 30, 2025</p>
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
                <span className="font-bold text-sm">
                  {"Retro Funding: Dev Tooling"}
                </span>{" "}
                <span className="text-sm">
                  {
                    "rewards toolchain software, such as compilers, libraries and debuggers, that support builders in developing onchain applications on the Superchain."
                  }
                </span>
              </div>

              <ul className="list-disc pl-6">
                <li>
                  <span className="font-bold text-sm">{"Timeline:"}</span>
                  <span className="text-sm">
                    {" The program will take place from Feb 1 – Jun 30, 2025."}
                  </span>
                </li>
                <li>
                  <span className="font-bold text-sm">
                    {"Application period:"}
                  </span>
                  <span className="text-sm">
                    {
                      " Applications are rolling, with new applications being reviewed at the end of each month. Apply by the monthly application deadline, and your project will be evaluated for rewards starting the following month."
                    }
                  </span>
                </li>
                <li>
                  <span className="font-bold text-sm">
                    {"Eligibility and rewards:"}
                  </span>
                  <span className="text-sm">{" See details below."}</span>
                </li>
                <li>
                  <span className="font-bold text-sm">{"Grant delivery:"}</span>
                  <span className="text-sm">
                    {" Rewards are delivered monthly, starting in March."}
                  </span>
                </li>
                <li>
                  <span className="font-bold text-sm">{"Budget:"}</span>
                  <span className="text-sm">{" Budget: Up to 8M OP"}</span>
                </li>
              </ul>
            </div>
          </div>
          <Sidebar
            className="ml-auto w-[260px]"
            // projects={projects}
            // user={user}
            // userProjects={userProjects}
          />
        </div>
      </div>
    </main>
  )

  // return (
  //   <div className="w-full">
  //     <div className="w-full max-width-6xl flex flex-col px-52 bg-rose-200">
  // <div className="flex gap-1">
  //   <p className="text-gray-700">Retro Funding Missions </p>
  //   <p>{">"}</p>
  //   <p>Dev Tooling</p>
  // </div>

  // <h2>Dev Tooling</h2>
  // <div className="flex gap-1">
  //   <p>Feb 1 - Jun 30, 2025</p>
  //   <div className="w-0.5 bg-black"></div>
  //   <AxeIcon />
  //   <p>Open for applications</p>
  // </div>
  //     </div>
  //   </div>
  // )
}
