import { z } from "zod"

const GithubRepoBaseSchema = z.object({
  verified: z.boolean().default(false),
  openSource: z.boolean().default(false),
  containsContracts: z.boolean().default(false),
  npmPackage: z.boolean().default(false),
  crate: z.boolean().default(false),
  name: z.string().optional(),
  description: z.string().optional(),
})

// Strict schema with URL validation for actual repos
export const GithubRepoSchema = GithubRepoBaseSchema.extend({
  url: z.string().url(),
})

// Relaxed schema for form state when noRepos is true
const GithubRepoFormSchema = GithubRepoBaseSchema.extend({
  url: z.string(),
})

export type GithubRepo = z.infer<typeof GithubRepoSchema>

export const LinkSchema = z.object({
  url: z.string().url().or(z.literal("")),
  name: z.string(),
  description: z.string(),
})

export const ReposFormSchema = z.discriminatedUnion("noRepos", [
  // When noRepos is true, allow empty/invalid URLs
  z.object({
    noRepos: z.literal(true),
    githubRepos: z.array(GithubRepoFormSchema),
    links: z.array(LinkSchema),
  }),
  // When noRepos is false, enforce proper validation
  z.object({
    noRepos: z.literal(false),
    githubRepos: z.array(GithubRepoSchema),
    links: z.array(LinkSchema),
  }),
])
