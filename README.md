# EAS Indexer

A [Ponder](https://ponder.sh) indexer for Ethereum Attestation Service (EAS) attestations on Optimism.

## Overview

This indexer tracks EAS attestations and stores them in a SQLite database. It watches for `Attested` and `Revoked` events from the EAS contract on Optimism, decodes the attestation data according to predefined schemas, and stores the results in structured tables.

## How it Works

1. **Schema Configuration**

   - Schemas are defined in `schemas.config.ts` with their IDs and optional attester addresses
   - Schema parameter signatures are defined in `src/schemas.ts` for decoding attestation data
   - Database tables are defined in `ponder.schema.ts` matching the schema structures

2. **Event Processing**

   - Listens for `Attested` events matching configured schema IDs
   - Validates attester address if specified in schema config
   - Retrieves full attestation data using `getAttestation`
   - Decodes raw data using schema-specific parameter signatures
   - Stores decoded data in corresponding database tables
   - Tracks revocations through `Revoked` events

3. **Database Structure**
   - Each schema has its own table with appropriate columns
   - All attestations store:
     - Unique ID
     - Recipient address
     - Schema-specific data fields
     - Revocation status

## Setup

1. Install dependencies:

   ```bash
   yarn install
   ```

2. Configure environment:

   - Copy `.env.example` to `.env`
   - Add your RPC URL for Optimism mainnet

3. Start the indexer:

```bash
yarn dev
```

## Development

### Adding New Schemas

1. Add schema configuration in `schemas.config.ts`:

   ```typescript
   export const schemas = [
     {
       id: "0x...",
       name: "citizen",
       attester: "0x...", // optional
     },
   ];
   ```

2. Define schema parameters in `src/schemas.ts`
3. Add corresponding table definition in `ponder.schema.ts`
4. Add schema to `ponder.config.ts`
