# EAS Indexer

A [Ponder](https://ponder.sh) indexer for Ethereum Attestation Service (EAS) attestations on Optimism.

## Overview

This indexer tracks EAS attestations and stores them into Postgres database. It watches for `Attested` and `Revoked` events from the EAS contract on Optimism, decodes the attestation data according to predefined schemas, and stores the results in structured tables.

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
yarn start
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
5. Update `src/index.ts` to include the new schema

### Adding New Entities

1. Add entity configuration in `ponder.schema.ts`
2. Add entity to `ponder.config.ts`
3. Update `src/index.ts` to include the new entity

## Redeployment

**Important**: Due to Ponder's architecture, redeploying the indexer requires creating a new database schema to avoid deployment crashes. This is a necessary step for production deployments.

### Pre-deployment Steps

1. **Update Schema Name**: Before deploying, update the schema name in `package.json` scripts:

   ```json
   {
     "scripts": {
       "start": "ponder start --schema eas_indexer_3", // Increment version number
       "db:create-views": "ponder db create-views --schema eas_indexer_3 --views-schema eas"
     }
   }
   ```

   **Note**: Increment the schema version number (e.g., `eas_indexer_2` → `eas_indexer_3`) for each deployment.

2. **Update Ponder Config**: Ensure your `ponder.config.ts` references the new schema name.

### Deployment Process

1. **Deploy to Railway**: Push your changes to trigger a new Railway deployment
2. **Wait for Deployment**: Allow the new deployment to complete and start running
3. **Create Database Views**: After successful deployment, manually run the view creation command:

   ```bash
   yarn db:create-views
   ```

   This command creates the necessary database views in the `eas` schema that your application uses to query attestation data.

### Why Separate Schemas?

- **Data Integrity**: Prevents deployment crashes that can occur when trying to modify existing database structures
- **Rollback Safety**: Allows you to quickly rollback to previous versions if needed
- **Zero Downtime**: New deployments can start indexing while old ones continue running
- **Ponder Best Practice**: This approach is recommended by Ponder for production environments

### Post-deployment Verification

1. Check that the new indexer is running and indexing data
2. Verify that database views are accessible
3. Test API endpoints to ensure they're returning data from the new schema
4. Monitor logs for any indexing errors

## API Endpoints

The indexer exposes REST API endpoints for querying attestation data. Endpoints are automatically generated for each schema defined in `schemas.config.ts`.

### Get Attestations by Address

For each schema (citizen, badgeholder, gov_contribution, etc.), the following endpoint is available:

```http
GET /api/{schema}/address/{address}
```

Example:

```http
GET /api/citizen/address/0x1234...
```

Response:

```json
{
  "attestations": [
    {
      "id": "0xabcd...",
      "recipient": "0x1234...",
      "attester": "0x5678...",
      "time": "2024-03-21T15:30:00Z",
      "revoked": false
      // schema-specific fields
    }
  ]
}
```
