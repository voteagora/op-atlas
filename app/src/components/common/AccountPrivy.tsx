"use client"

import { usePrivy } from "@privy-io/react-auth";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function AccountPrivy() {
    const { login: privyLogin, logout: privyLogout, user: privyUser, getAccessToken } = usePrivy();
    const { data: session, status, } = useSession();

    const sessionIsReady = () => status === 'authenticated';

    const router = useRouter()


    const logOut = useCallback(() => {

        Promise.all([
            privyLogout(),
            signOut()
        ]).then(() => {
            router.push("/")
        }).catch((err) => {
            toast.error(`Error logging out. ${err}`)
        })
    }, [router])


    useEffect(() => {
        if (privyUser) {

            getAccessToken().then((token) => {
                signIn('credentials', {
                    wallet: privyUser?.wallet?.address,
                    email: privyUser?.email?.address,
                    farcaster: JSON.stringify(privyUser?.farcaster),
                    token: token,
                    redirect: false,
                }).then((res) => {
                    if (res?.url) {
                        if (res?.url && sessionIsReady()) {
                            router.push(res.url);
                        }
                    }
                }).catch((err) => {
                    logOut();
                    toast.error("Unable to login at this time. Try again later.")
                })
            }).catch((err) => {
                toast.error("Unable to create Privy session. Try again later.")
            })
        }
    }, [privyUser]);


    if (session) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none focus:opacity-80">
                    <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-secondary h-10 px-4 py-2 gap-x-2.5 text-sm font-medium">
                        <Avatar className="!w-6 !h-6">
                            <AvatarImage src={session.user?.image || ""} alt="avatar" />
                            <AvatarFallback>{session.user?.name}</AvatarFallback>
                        </Avatar>{" "}
                        {session.user?.name}
                        <Image
                            src="/assets/icons/arrowDownIcon.svg"
                            width={10}
                            height={6}
                            alt=""
                        />
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-56 flex flex-col gap-1 z-[9999]"
                >
                    <Link href="/dashboard">
                        <DropdownMenuItem className="cursor-pointer">
                            Dashboard
                        </DropdownMenuItem>
                    </Link>
                    <hr className="w-full border-[0.5px] border-border" />
                    <Link href="/profile/details">
                        <DropdownMenuItem className="cursor-pointer">
                            Profile details
                        </DropdownMenuItem>
                    </Link>
                    <Link href="/profile/connected-apps">
                        <DropdownMenuItem className="cursor-pointer">
                            Connected apps
                        </DropdownMenuItem>
                    </Link>
                    <Link href="/profile/verified-addresses">
                        <DropdownMenuItem className="cursor-pointer">
                            Verified addresses
                        </DropdownMenuItem>
                    </Link>
                    <Link href="/profile/organizations/new">
                        <DropdownMenuItem className="cursor-pointer">
                            Organizations
                        </DropdownMenuItem>
                    </Link>
                    <hr className="w-full border-[0.5px] border-border" />
                    <DropdownMenuItem className="cursor-pointer" onClick={logOut}>
                        Sign out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    } else {
        return <div className="cursor-pointer text-white bg-[#FF0420] rounded-md px-4 py-2" onClick={privyLogin}>Login</div>

    }
}
