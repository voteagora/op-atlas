import CredentialsProvider from "next-auth/providers/credentials";
import { addUserAddresses, getUserByAddress, getUserByEmail, updateUserEmail, upsertUser } from "../db/users";
import privy from "../lib/privy";

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

export const PrivyCredentialsProvider = CredentialsProvider({
    name: "prviy",
    credentials: {
        email: { label: "address", type: "text", placeholder: "test@test.com" },
        wallet: { label: "wallet", type: "text", placeholder: "0x0" },
        token: { label: "token", type: "text", placeholder: "xxx" },
    },

    async authorize(credentials) {
        const { wallet, token, email } = credentials;

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

        // Email registration flow
        if (email) {
            let user = await getUserByEmail(email as string);

            if (!user) {
                try {
                    const newUser = await upsertUser({
                        farcasterId: '6666',
                        name: undefined,
                        username: undefined,
                        imageUrl: undefined,
                        bio: undefined,
                    });

                    await updateUserEmail({
                        id: newUser.id,
                        email: email as string,
                    });

                    return userResponse(newUser);
                } catch (error) {
                    console.error('Failed to create user or update email:', error);
                    return null;
                }
            } else {
                return userResponse(user);
            }
        }

        if (wallet) {
            let user = await getUserByAddress(wallet as string);

            if (!user) {
                try {
                    const newUser = await upsertUser({
                        farcasterId: '6666',
                        name: 'andreitr',
                        username: 'andreitr',
                        imageUrl: undefined,
                        bio: undefined,
                    });

                    await addUserAddresses({
                        id: newUser.id,
                        addresses: [wallet as string],
                        source: 'atlas',
                    });

                    return userResponse(newUser);
                } catch (error) {
                    console.error('Failed to create user or add address:', error);
                    return null;
                }
            }
            return userResponse(user);
        }

        return null;
    },
}); 