# Repository Guidelines

## Project Structure & Modules
- Root: PNPM workspace (`pnpm-workspace.yaml`) targeting two packages.
- `app/`: Next.js TypeScript web app (Tailwind, Prisma, Sentry). Static assets in `app/public/`.
- `eas-indexer/`: TypeScript service using Ponder for on‑chain indexing and an API.
- Config: Node version in `.nvmrc` (21), workspace tooling in root `package.json`, `tsconfig.json`.

## Build, Test, and Development
- Install: `pnpm install` (Node >= 21, PNPM >= 9).
- App dev: `pnpm --filter op-atlas dev` (runs GraphQL codegen, Prisma generate, Next dev).
- App build/start: `pnpm --filter op-atlas build` then `pnpm --filter op-atlas start`.
- Indexer dev: `pnpm --filter eas-indexer dev` (Ponder dev server).
- Indexer start: `pnpm --filter eas-indexer start` (uses schema `eas_indexer`).
- Repo format: `pnpm format` (root) or `pnpm --filter op-atlas format`.
- Tests: `pnpm --filter op-atlas test` and/or `pnpm --filter eas-indexer test`.

## Coding Style & Naming
- Language: TypeScript, 2‑space indentation, semicolons via Prettier.
- Linting: `next lint` in `app/`, `eslint-config-ponder` in `eas-indexer/`.
- Components: PascalCase (e.g., `ClaimRewardsDialog.tsx`). Hooks: `useX.ts(x)`.
- Files: prefer kebab/lowercase for utilities (`button.tsx`, `logging.ts`); PascalCase for exported React components.

## Testing Guidelines
- Framework: Jest with `ts-jest` in both packages (see `eas-indexer/jest.config.js`).
- Place tests near code or under `__tests__/`; name `*.test.ts(x)`.
- Aim to cover business logic and data transforms; mock network and chain calls.
- Run locally before pushing: `pnpm -r test` or per package as above.

## Commit & Pull Requests
- Commits: clear, scoped subjects; include ticket when applicable (e.g., `OPAG-171: fix copy in header`). Conventional prefixes welcome (`feat:`, `fix:`).
- Branches: `<your-name>/<feature-or-fix>` (e.g., `jane/add-login`).
- PRs: link Jira key (action enforces), describe intent and impact, attach screenshots for UI changes, note env/DB migrations (Prisma), and reference related issues.
- Pre‑merge: `pnpm -r lint`, `pnpm -r test`, ensure `pnpm --filter op-atlas build` passes.

## Security & Configuration
- Secrets via environment variables; never commit `.env`. Prisma requires DB access; run `pnpm --filter op-atlas db:migrate` for local changes.
- Sentry/PostHog/OTEL are optional but configured; disable in local dev if unneeded.
