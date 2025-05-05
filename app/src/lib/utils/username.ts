import { createHash } from "crypto"

export function generateTemporaryUsername(privyDid: string): string {
    const suffix = createHash('sha256')
        .update(privyDid)
        .digest('hex')
        .slice(0, 8);

    return `optimist-${suffix}`;
} 