import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

export const authConfig: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            // The name to display on the sign in form (e.g. "Sign in with...")
            name: "Credentials",
            // `credentials` is used to generate a form on the sign in page.
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            // You can pass any HTML attribute to the <input> tag through the object.
            credentials: {
                email: { label: "Email", type: "email", placeholder: "john.doe@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                if (!credentials || !credentials.email || !credentials.password) {
                    return null;
                }

                //TODO: connect to a DB and get user
                // const user = await supabase.user.find({crednetials.email})
                // if (user && user.password === credentials.password) {
                //     const {dbUser} = user;
                //     return dbUser;
                // }
                return null;
            }
        }),
        GithubProvider({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        })
        // ...add more providers here
    ],
}
