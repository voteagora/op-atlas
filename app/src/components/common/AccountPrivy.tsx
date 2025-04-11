"use client"

import { signIn, signOut, useSession } from "next-auth/react";


import { usePrivy } from "@privy-io/react-auth";


import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";

export function AccountPrivy() {
    const { ready, authenticated, login, logout, user, getAccessToken } = usePrivy();

    const router = useRouter()

    const logOut = useCallback(() => {

        logout().then(() => {
            signOut();
            router.push("/")
        })
    }, [router])


    useEffect(() => {
        if (user) {

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
        return <div className="cursor-pointer text-white bg-[#FF0420] rounded-md px-4 py-2" onClick={logOut}>Logout</div>
    } else {
        return <div className="cursor-pointer text-white bg-[#FF0420] rounded-md px-4 py-2" onClick={() => login()}>Login</div>

    }
}
