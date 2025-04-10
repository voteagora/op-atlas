'use client';

import { PrivyProvider } from '@privy-io/react-auth';

const PrivyAuthProvider = ({ children }: { children: React.ReactNode }) => {

    const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
    if (!appId) {
        console.error("Please define PRIVY_APP_ID")
        return <>{children}</>
    }

    return (
        <PrivyProvider
            appId={appId}
            config={{
                loginMethods: ['email', 'farcaster', 'wallet'],
                appearance: {
                    theme: 'light',
                    accentColor: '#FF0420',
                    logo: "https://atlas.optimism.io/assets/images/logo.svg",
                },
            }}
        >
            {children}
        </PrivyProvider>
    );
}

export default PrivyAuthProvider;