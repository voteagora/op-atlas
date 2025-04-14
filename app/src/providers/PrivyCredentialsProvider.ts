import CredentialsProvider from "next-auth/providers/credentials";
import { addUserAddresses, getUserByAddress, getUserByEmail, getUserByFarcasterId, updateUserEmail, upsertUser } from "../db/users";
import privy from "../lib/privy";
import { getUserConnectedAddresses } from "@/lib/neynar";

interface UserResponse {
    id: string;
    farcasterId: string;
    name?: string;
    image?: string;
}

const userResponse = (user: any): UserResponse => ({
    id: user.id,
    farcasterId: user.farcasterId,
    name: user?.name as string | undefined,
    image: user?.imageUrl as string | undefined,
});

const loginWithEmail = async (email: string): Promise<UserResponse | null> => {
    const user = await getUserByEmail(email);

    if (user) {
        return userResponse(user);
    }

    try {
        const newUser = await upsertUser({
            farcasterId: '6666',
        });

        // Should we set email to be verified?
        await updateUserEmail({
            id: newUser.id,
            email: email,
        });

        return userResponse(newUser);
    } catch (error) {
        console.error('Failed to create user or update email:', error);
        return null;
    }
};

const loginWithWallet = async (wallet: string): Promise<UserResponse | null> => {

    const normalizedAddress = wallet.toLowerCase();
    const user = await getUserByAddress(normalizedAddress);

    if (user) {
        return userResponse(user);
    }

    try {
        const newUser = await upsertUser({
            farcasterId: '5555',
        });

        await addUserAddresses({
            id: newUser.id,
            addresses: [normalizedAddress],
            source: 'privy',
        });
        return userResponse(newUser);
    } catch (error) {
        console.error('Failed to create user or add address:', error);
        return null;
    }
};

const loginWithFarcaster = async (farcaster: string): Promise<UserResponse | null> => {
    try {
        const { fid, pfp, displayName, username, bio } = JSON.parse(farcaster) || {};

        if (!fid) {
            console.error('Farcaster ID is required');
            return null;
        }

        const farcasterId = fid.toString();

        // Check for direct fid match first
        const user = await getUserByFarcasterId(farcasterId);
        if (user) {
            return userResponse(user);
        }

        // Check for connected addresses
        const connectedAddresses = await getUserConnectedAddresses(farcasterId);
        if (connectedAddresses) {
            const user = await getUserByAddress(connectedAddresses[0]);
            return userResponse(user);
        }

        // We have a new user
        const newUser = await upsertUser({
            farcasterId,
            name: displayName || null,
            username: username || null,
            imageUrl: pfp || null,
            bio: bio || null,
        });

        return userResponse(newUser);
    } catch (error) {
        console.error('Failed to create user or add address:', error);
        return null;
    }
}

export const PrivyCredentialsProvider = CredentialsProvider({
    name: "prviy",
    credentials: {
        email: { label: "address", type: "text" },
        wallet: { label: "wallet", type: "text" },
        token: { label: "token", type: "text" },
        farcaster: { label: "farcaster", type: "text" },
    },

    async authorize(credentials) {
        const { wallet, token, email, farcaster } = credentials;

        try {


            const verified = await privy.verifyAuthToken(token as string);

            // TODO: Implement further token validation

            // appId	string	Your Privy app ID.
            // userId	string	The authenticated user's Privy DID. Use this to identify the requesting user.
            // issuer	string	This will always be 'privy.io'.
            // issuedAt	string	Timestamp for when the access token was signed by Privy.
            // expiration	string	Timestamp for when the access token will expire.
            // sessionId	string	Unique identifier for the user's session.

        } catch (error) {
            console.log(`Token verification failed with error ${error}.`);
        }

        if (farcaster && farcaster !== 'undefined') {
            return loginWithFarcaster(farcaster as string);
        }

        if (wallet && wallet !== 'undefined') {
            return loginWithWallet(wallet as string);
        }

        if (email && email !== 'undefined') {
            return loginWithEmail(email as string);
        }


        return null;
    },
});