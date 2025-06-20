import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Load projects data from projects.json
  const projectData = require("../lib/funding_by_round.json");

  for (const project of projectData) {
    await prisma.project.create({
      data: {
        project_name: project.project_name,
        OPAtlas_projectId: project.OPAtlas_projectId,
        OrgID: project.OrgID,
        rpgf2_amount: parseFloat(project.rpgf2_amount),
        rpgf3_amount: parseFloat(project.rpgf3_amount),
        rpgf4_amount: parseFloat(project.rpgf4_amount),
        rpgf5_amount: parseFloat(project.rpgf5_amount),
        rpgf6_amount: parseFloat(project.rpgf6_amount),
        rpgf2_projectId: project.rpgf2_projectId,
        rpgf3_projectId: project.rpgf3_projectId
      }
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
