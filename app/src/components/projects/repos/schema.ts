import { z } from "zod"

export const GithubRepoSchema = z.object({
  url: z.string().url(),
  verified: z.boolean().default(false),
  openSource: z.boolean().default(false),
  containsContracts: z.boolean().default(false),
  npmPackage: z.boolean().default(false),
  crate: z.boolean().default(false),
  name: z.string().optional(),
  description: z.string().optional(),
})

export type GithubRepo = z.infer<typeof GithubRepoSchema>

export const LinkSchema = z.object({
  url: z.string().url(),
  name: z.string(),
  description: z.string(),
})

export const ReposFormSchema = z.object({
  noRepos: z.boolean(),
  githubRepos: z.array(GithubRepoSchema),
  links: z.array(LinkSchema),
})
