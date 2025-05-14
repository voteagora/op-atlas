import { createHash } from "crypto"

export function generateTemporaryUsername(id: string): string {
    const suffix = createHash('sha256')
        .update(id)
        .digest('hex')
        .slice(0, 4);

    return `optimist-${suffix}`;
} 