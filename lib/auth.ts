import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Credentials from "next-auth/providers/credentials"
import Email from "next-auth/providers/nodemailer"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { workspace: true },
        })

        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          workspaceId: user.workspaceId,
          workspaceSlug: user.workspace?.slug,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.workspaceId = (user as any).workspaceId
        token.workspaceSlug = (user as any).workspaceSlug
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        ;(session.user as any).workspaceId = token.workspaceId
        ;(session.user as any).workspaceSlug = token.workspaceSlug
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
})
