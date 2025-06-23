[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/voteagora/op-atlas)

# OP Atlas

Bring your identity to the OP collective and signup to get funded via RetroPGF.

Shepherded by the fine folks of [Agora](https://voteagora.com).

## Project Structure

This is a monorepo managed with pnpm workspaces. The repository contains the following packages:

- `app/` - The main OP-Atlas Next.js web application

Each package has its own README with detailed setup and development instructions.

## Development Setup

1. Install pnpm if you haven't already:

   ```bash
   npm install -g pnpm
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   - Copy `.env.example` to `.env` in the `app` directory
   - Fill in required environment variables

4. Start the development server:

   ```bash
   cd app
   pnpm dev
   ```

   OR

   ```bash
   pnpm --filter op-atlas dev
   ```


## Scripts 

1. Revoke citizenship attestation by wallet address 

```bash
pnpm revoke:citizenship 0x123...456
```

The app will be available at [http://localhost:3000](http://localhost:3000).
