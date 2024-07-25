import { z } from "zod"

export const GithubRepoSchema = z.object({
  url: z.string(),
  verified: z.boolean().default(false),
  openSource: z.boolean().default(false),
  containsContracts: z.boolean().default(false),
  name: z.string(),
  description: z.string(),
})

export type GithubRepo = z.infer<typeof GithubRepoSchema>

export const PackageSchema = z.object({
  url: z.string(),
  name: z.string(),
  description: z.string(),
})

export const ReposFormSchema = z.object({
  noRepos: z.boolean(),
  githubRepos: z.array(GithubRepoSchema),
  packages: z.array(PackageSchema),
})
