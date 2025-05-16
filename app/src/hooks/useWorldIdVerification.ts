import { useState } from 'react';

interface UseWorldIdVerificationResult {
    isVerifying: boolean;
    error: Error | null;
    verifyProof: (proof: any) => Promise<boolean>;
}

export function useWorldIdVerification(): UseWorldIdVerificationResult {
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const verifyProof = async (proof: any): Promise<boolean> => {
        setIsVerifying(true);
        setError(null);

        try {
            const response = await fetch('/api/world-id/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    proof,
                    action: 'verify-humanity',
                    signal: 'user_value',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to verify proof');
            }

            return data.success;
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error occurred'));
            return false;
        } finally {
            setIsVerifying(false);
        }
    };

    return {
        isVerifying,
        error,
        verifyProof,
    };
} 