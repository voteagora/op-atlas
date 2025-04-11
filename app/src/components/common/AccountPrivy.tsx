"use client"

import { useSession, signIn, signOut } from "next-auth/react"


import { usePrivy } from "@privy-io/react-auth"


import { use, useEffect } from "react";

export function AccountPrivy() {
    const { ready, authenticated, login, logout, user, getAccessToken } = usePrivy();
    const { data: session, status } = useSession();



    useEffect(() => {
        if (user) {

            console.log("Getting token");


            getAccessToken().then((token) => {
                console.log("we have the token", token);
                signIn('credentials', {
                    wallet: user?.wallet?.address,
                    email: user?.email?.address,
                    token: token,
                });
            });
        }
    }, [user]);


    if (authenticated) {
        return <div className="cursor-pointer text-white bg-[#FF0420] rounded-md px-4 py-2" onClick={() => logout()}>Logout</div>
    } else {
        return <div className="cursor-pointer text-white bg-[#FF0420] rounded-md px-4 py-2" onClick={() => login()}>Login</div>

    }
}
