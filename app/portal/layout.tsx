import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const workspaceSlug = headersList.get("x-workspace-slug")

  if (!workspaceSlug) {
    // Fallback if accessed without properly going through middleware
    redirect("/")
  }

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug },
  })

  if (!workspace) {
    notFound()
  }

  // Inject the branding into custom CSS variables so the portal UI updates
  const customStyles = {
    "--workspace-primary": workspace.brandColor,
  } as React.CSSProperties

  return (
    <div className="portal-layout" style={customStyles}>
      <header className="portal-header">
        <div className="flex items-center gap-3">
          <div
            className="avatar"
            style={{
              background: workspace.brandColor,
              borderRadius: "var(--radius-md)",
            }}
          >
            {workspace.name[0]}
          </div>
          <span className="font-bold">{workspace.name}</span>
        </div>

        <nav className="portal-nav">
          <Link href={`/portal?workspace=${workspace.slug}`} className="portal-nav-item">
            Projects
          </Link>
          <Link href={`/portal/invoices?workspace=${workspace.slug}`} className="portal-nav-item">
            Invoices
          </Link>
        </nav>

        <div>
          <button className="btn btn-ghost btn-sm">Client Logout</button>
        </div>
      </header>
      
      <main className="portal-content">
        {children}
      </main>
    </div>
  )
}
