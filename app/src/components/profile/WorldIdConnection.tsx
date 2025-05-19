'use client';

import { Button } from '@/components/common/Button';
import { useWorldIdVerification } from '@/hooks/useWorldIdVerification';
import { IDKitWidget } from '@worldcoin/idkit';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    userId: string;
    children?: React.ReactNode;
}

export function WorldConnection({ userId, children }: Props) {
    const [isClient, setIsClient] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const { isVerifying, error, verifyProof } = useWorldIdVerification();

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (error) {
            toast.error(error.message);
        }
    }, [error]);

    if (!isClient) {
        return null;
    }

    const handleSuccess = async (proof: any) => {
        const success = await verifyProof(proof);
        if (success) {
            setIsVerified(true);
            toast.success('Successfully verified with World ID');
        }
    };

    return (
        <div className="flex flex-row gap-2">
            {isVerified && (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5">
                        <div className="flex flex-1 p-3 border items-center gap-1.5 rounded-lg h-10">
                            <Image
                                src="/assets/icons/circle-check-green.svg"
                                height={16.67}
                                width={16.67}
                                alt="Verified"
                            />
                            <p className="text-sm">Verified with World ID</p>
                        </div>
                    </div>
                </div>
            )}

            {!isVerified && (
                <IDKitWidget
                    app_id={process.env.NEXT_PUBLIC_WORLD_APP_ID!}
                    action="atals-humanity-verification"
                    onSuccess={handleSuccess}
                >
                    {({ open }: { open: () => void }) => (
                        <Button onClick={open} variant="primary">{children}</Button>
                    )}
                </IDKitWidget>
            )}
        </div>
    );
} 