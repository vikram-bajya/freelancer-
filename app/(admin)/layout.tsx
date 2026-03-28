import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminSidebar from "@/components/AdminSidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { workspace: true },
  })

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar
        userName={user?.name}
        userEmail={user?.email}
        workspaceName={user?.workspace?.name}
      />
      <main
        style={{
          flex: 1,
          padding: "2rem",
          overflow: "auto",
          background: "var(--bg-primary)",
        }}
      >
        {children}
      </main>
    </div>
  )
}
