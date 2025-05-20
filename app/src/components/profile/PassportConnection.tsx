"use client"

import { Button } from '@/components/common/Button';
import { usePassportScore } from '@/hooks/api/usePassportScore';
import { useUser } from '@/hooks/db/useUser';

interface Props {
    userId: string;
    children?: React.ReactNode;
}

export const PassportConnection = ({
    userId,
    children,
}: Props) => {

    const { user } = useUser({ id: userId, enabled: !!userId })

    const verifiedAddress = user?.addresses.find(address => address.primary)

    const { data } = usePassportScore({
        address: verifiedAddress?.address as string,
        enabled: Boolean(verifiedAddress),
    })

    return (
        <Button
            variant="primary"
            onClick={(event) => {
                event.preventDefault()
            }}
        >
            {children} {data?.score}
        </Button>
    )
}

export default PassportConnection 