"use client"

import { Button } from '@/components/common/Button';

interface Props {
    userId: string;
    children?: React.ReactNode;
}

export const PassportConnection = ({
    children,
}: Props) => {
    return (
        <Button
            variant="primary"
            onClick={(event) => {
                event.preventDefault()
            }}
        >
            {children}
        </Button>
    )
}

export default PassportConnection 