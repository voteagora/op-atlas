"use client"

import { useRefreshPassport } from '@/hooks/useRefreshPassport';

interface Props {
    userId: string;
    children?: React.ReactNode;
}

export const PassportConnection = ({
    userId,
    children,
}: Props) => {
    const { refresh } = useRefreshPassport(userId);

    return (
        <div
            className="inline-block cursor-pointer underline hover:no-underline"
            onClick={(event) => {
                event.preventDefault()
                refresh()
            }}
        >
            {children}
        </div>
    )
}

export default PassportConnection 