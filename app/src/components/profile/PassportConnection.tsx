"use client"

import { Button } from '@/components/common/Button';
import { useUserPOH } from '@/hooks/db/useUserPOH';
import { refreshUserPassport } from '@/lib/actions/users';
import { toast } from 'sonner';

interface Props {
    userId: string;
    children?: React.ReactNode;
}

export const PassportConnection = ({
    userId,
    children,
}: Props) => {

    const { invalidate } = useUserPOH({ enabled: false, id: userId })

    const onRefresh = async () => {

        toast.promise(
            refreshUserPassport().then(() => invalidate()),
            {
                loading: "Refreshing passport score...",
                success: "Passport score refreshed successfully",
                error: "Failed to refresh passport score",
            },
        )
    }

    return (
        <Button
            variant="primary"
            onClick={(event) => {
                event.preventDefault()
                onRefresh()
            }}
        >
            {children}
        </Button>
    )
}

export default PassportConnection 