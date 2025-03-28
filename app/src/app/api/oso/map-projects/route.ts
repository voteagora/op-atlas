import { NextResponse } from "next/server"

import { prisma } from "@/db/client"
import {
  Oso_ProjectsByCollectionV1,
  Oso_ProjectsV1,
  QueryOso_ProjectsByCollectionV1Args,
  QueryOso_ProjectsV1Args,
} from "@/graphql/__generated__/types"
import { default as client } from "@/lib/oso-client"

export async function GET(req: Request) {
  try {
    let projectAtlasIds: string[] = []

    await prisma.$transaction(async (tx) => {
      const projectOSO = await tx.projectOSO
        .findMany({
          select: { projectId: true },
        })
        .then((results) => results.map((r) => r.projectId))

      const projects = await prisma.project.findMany({
        select: { id: true },
        where: {
          id: {
            notIn: projectOSO,
          },
        },
      })

      projectAtlasIds = projects.map(({ id }) => id)
    })

    const BATCH_SIZE = 100
    let processedOSOProjectsLength = 0
    let createdProjectOSOsLength = 0

    for (let i = 0; i < projectAtlasIds.length; i += BATCH_SIZE) {
      // Projects
      const osoProjectsQuery: QueryOso_ProjectsV1Args = {
        where: {
          projectName: {
            _in: projectAtlasIds.slice(i, i + BATCH_SIZE),
          },
          projectSource: {
            _eq: "OP_ATLAS",
          },
        },
      }
      const osoProjectsSelect: (keyof Oso_ProjectsV1)[] = [
        "projectId",
        "projectName",
      ]
      const osoProjectsBatchResult = await client.executeQuery(
        "oso_projectsV1",
        osoProjectsQuery,
        osoProjectsSelect,
      )
      //

      // Project Rounds
      const osoProjectCollection: QueryOso_ProjectsByCollectionV1Args = {
        where: {
          projectName: {
            _in: projectAtlasIds.slice(i, i + BATCH_SIZE),
          },
        },
      }
      const osoProjectCollectionSelect: (keyof Oso_ProjectsByCollectionV1)[] = [
        "collectionName",
        "projectId",
        "projectName",
      ]
      const batchResultCollection = await client.executeQuery(
        "oso_projectsByCollectionV1",
        osoProjectCollection,
        osoProjectCollectionSelect,
      )
      //

      processedOSOProjectsLength += osoProjectsBatchResult.oso_projectsV1.length

      console.log(
        `Processed ${Math.min(
          i + BATCH_SIZE,
          projectAtlasIds.length,
        )} projects`,
      )

      const createdProjectOSOs = await prisma.projectOSO.createManyAndReturn({
        data: osoProjectsBatchResult.oso_projectsV1.map((project) => {
          const projectFunded =
            batchResultCollection.oso_projectsByCollectionV1.find(
              (p) => p.projectName === project.projectName,
            )

          if (projectFunded) {
            return {
              projectId: project.projectName,
              osoId: project.projectId,
              roundId: projectFunded.collectionName.split("-").at(0),
            }
          }

          return {
            projectId: project.projectName,
            osoId: project.projectId,
          }
        }),
        skipDuplicates: true,
      })

      createdProjectOSOsLength += createdProjectOSOs.length
    }

    console.log("Processed OSO projects", processedOSOProjectsLength)

    return NextResponse.json({
      status: 200,
      body: { message: "Success", count: processedOSOProjectsLength },
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ status: 500, body: { message: "Error" } })
  }
}
