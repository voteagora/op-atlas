"use client"
import Image from "next/image"
import React from "react"

import ArrowLeftIcon from "@/components/icons/arrowLeftIcon"
import { Button } from "@/components/ui/button"

const projectsList = [
  {
    title: "Defi Llama",
    description: "Open and transparent DeFi analytics.",
    ProjectImage: "/assets/images/dummy-project-image.png",
    funding: 1999999,
  },
  {
    title: "Protocol Guild",
    description:
      "A collective of Ethereum's active core protocol contributors.",
    ProjectImage: "/assets/images/dummy-project-image.png",
    funding: 1450986,
  },
  {
    title: "Solidity",
    description:
      "Solidity is a statically-typed curly-braces programming language for EVM chains.",
    ProjectImage: "/assets/images/dummy-project-image.png",
    funding: 1200343,
  },
  {
    title: "Puky Cats Dapp",
    description:
      "We built a purrfect world for cat engineers onchain! It's a universe where engineers have whiskers, tails...",
    ProjectImage: "/assets/images/dummy-project-image.png",
    funding: 900890,
  },
  {
    title: "Infura",
    description: "A leading Ethereum consensus client written in rust.",
    ProjectImage: "/assets/images/dummy-project-image.png",
    funding: 850340,
  },
  {
    title: "Title of project",
    description: "Description",
    ProjectImage: "/assets/images/dummy-project-image.png",
    funding: 2999.5,
  },
  {
    title: "Title of project",
    description: "Description",
    ProjectImage: "/assets/images/dummy-project-image.png",
    funding: 2999.5,
  },
  {
    title: "Title of project",
    description: "Description",
    ProjectImage: "/assets/images/dummy-project-image.png",
    funding: 2999.5,
  },
  {
    title: "Title of project",
    description: "Description",
    ProjectImage: "/assets/images/dummy-project-image.png",
    funding: 2999.5,
  },
]

const ProjectsList = () => {
  return (
    <div>
      <div className="flex flex-row justify-between w-full mt-6 pb-4">
        <h1 className="text-xl font-semibold">
          516 projects applied to Round 4
        </h1>
        <h1 className="text-xl font-semibold">Rewards</h1>
      </div>
      <hr />
      {projectsList.map((project, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-row justify-between py-8">
            <div className="flex flex-row items-center">
              <Image
                src={project.ProjectImage}
                alt={project.title}
                width={64}
                height={64}
              />
              <div className="ml-4">
                <h5 className="text-base font-semibold text-text-default">
                  {project.title}
                </h5>
                <p className="text-base font-normal text-secondary-foreground">
                  {project.description}
                </p>
              </div>
            </div>
            <div className="flex flex-row items-center">
              <Image
                src="/assets/images/optimism-small.png"
                alt="Optimism"
                width={24}
                height={24}
              />
              <span className="ml-2 text-base font-medium text-foreground">
                {project.funding}
              </span>
            </div>
          </div>
          <hr />
        </React.Fragment>
      ))}
      <Button
        variant="outline"
        className="mt-6 text-base font-medium flex justify-center items-center gap-2 mx-auto "
      >
        Show more
        <ArrowLeftIcon fill="#0F111A" className=" -rotate-90" />
      </Button>
    </div>
  )
}

export default ProjectsList
