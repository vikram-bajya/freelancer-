import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Mail, FolderKanban } from "lucide-react"

export default async function ClientsPage() {
  const session = await auth()
  const user = await prisma.user.findUnique({ 
    where: { id: session!.user!.id },
    include: { workspace: true }
  })
  const workspaceId = user?.workspaceId!

  const clients = await prisma.client.findMany({
    where: { workspaceId },
    include: {
      _count: { select: { projects: true } },
      projects: {
        select: { status: true },
        orderBy: { updatedAt: "desc" },
        take: 3,
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">{clients.length} total clients</p>
        </div>
        <Link href="/clients/new" className="btn btn-primary">
          + Add Client
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="font-semibold">No clients yet</div>
            <p className="text-sm text-muted">Add your first client to start managing projects.</p>
            <Link href="/clients/new" className="btn btn-primary">
              Add Client
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {clients.map((client) => (
            <div key={client.id} className="card">
              <div className="flex items-center gap-3" style={{ marginBottom: "1rem" }}>
                <div className="avatar avatar-lg">
                  {client.name[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold">{client.name}</div>
                  <div className="flex items-center gap-1 text-xs text-muted">
                    <Mail size={11} />
                    {client.email}
                  </div>
                </div>
              </div>

              <div
                className="flex items-center justify-between text-xs"
                style={{
                  padding: "0.625rem 0.875rem",
                  background: "var(--bg-muted)",
                  borderRadius: "var(--radius-md)",
                  marginBottom: "1rem",
                }}
              >
                <div className="flex items-center gap-1 text-secondary">
                  <FolderKanban size={13} />
                  {client._count.projects} project{client._count.projects !== 1 ? "s" : ""}
                </div>
                <div className="flex gap-1">
                  {client.projects.slice(0, 2).map((p, i) => (
                    <span
                      key={i}
                      className={`badge ${
                        p.status === "ACTIVE"
                          ? "badge-info"
                          : p.status === "COMPLETED"
                          ? "badge-success"
                          : "badge-muted"
                      }`}
                    >
                      {p.status}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/clients/${client.id}`}
                  className="btn btn-secondary btn-sm w-full"
                >
                  View
                </Link>
                <Link
                  href={`/portal?workspace=${user?.workspace?.slug || ""}&client=${client.id}`}
                  className="btn btn-ghost btn-sm"
                  style={{ whiteSpace: "nowrap" }}
                >
                  Portal ↗
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
