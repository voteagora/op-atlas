'use client';

// import { useWorldIdVerification } from '@/hooks/useWorldIdVerification';
// import { IDKitWidget } from '@worldcoin/idkit';
// import { useEffect, useState } from 'react';
// import { toast } from 'sonner';

interface Props {
    userId: string;
    children?: React.ReactNode;
    className?: string;
}

export function WorldConnection({ userId, children, className }: Props) {


    return <div>{children}</div>

    // const [isClient, setIsClient] = useState(false);
    // const [isVerified, setIsVerified] = useState(false);
    // const { isVerifying, error, verifyProof } = useWorldIdVerification();

    // useEffect(() => {
    //     setIsClient(true);
    // }, []);

    // useEffect(() => {
    //     if (error) {
    //         toast.error(error.message);
    //     }
    // }, [error]);

    // if (!isClient) {
    //     return null;
    // }

    // const handleSuccess = async (proof: any) => {
    //     const success = await verifyProof(proof);
    //     if (success) {
    //         setIsVerified(true);
    //         toast.success('Successfully verified with World ID');
    //     }
    // };

    // return (
    //     <IDKitWidget
    //         app_id={process.env.NEXT_PUBLIC_WORLD_APP_ID!}
    //         action="atals-humanity-verification"
    //         onSuccess={handleSuccess}
    //     >
    //         {({ open }: { open: () => void }) => (
    //             <div className={className} onClick={open} >{children}</div>
    //         )}
    //     </IDKitWidget>

    // );
} 