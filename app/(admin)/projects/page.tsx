import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Clock, FolderKanban, ArrowRight } from "lucide-react"

export default async function ProjectsPage() {
  const session = await auth()
  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id },
  })
  const workspaceId = user?.workspaceId!

  const projects = await prisma.project.findMany({
    where: { workspaceId },
    include: {
      client: true,
      _count: { select: { files: true, approvals: true, messages: true } },
    },
    orderBy: { updatedAt: "desc" },
  })

  const statusColor: Record<string, string> = {
    ACTIVE: "badge-info",
    REVIEW: "badge-warning",
    COMPLETED: "badge-success",
    PAUSED: "badge-muted",
  }

  const grouped = {
    ACTIVE: projects.filter((p) => p.status === "ACTIVE"),
    REVIEW: projects.filter((p) => p.status === "REVIEW"),
    COMPLETED: projects.filter((p) => p.status === "COMPLETED"),
    PAUSED: projects.filter((p) => p.status === "PAUSED"),
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} total projects</p>
        </div>
        <Link href="/projects/new" className="btn btn-primary">
          + New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🗂️</div>
            <div className="font-semibold">No projects yet</div>
            <p className="text-sm text-muted">Create your first project and invite a client.</p>
            <Link href="/projects/new" className="btn btn-primary">
              Create Project
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {Object.entries(grouped).map(([status, items]) => {
            if (items.length === 0) return null
            return (
              <div key={status}>
                <div
                  className="flex items-center gap-2"
                  style={{ marginBottom: "0.875rem" }}
                >
                  <span className={`badge ${statusColor[status]}`}>{status}</span>
                  <span className="text-sm text-muted">{items.length} project{items.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {items.map((project) => (
                    <Link key={project.id} href={`/projects/${project.id}`} style={{ textDecoration: "none" }}>
                      <div className="card" style={{ cursor: "pointer" }}>
                        <div className="flex items-center justify-between" style={{ marginBottom: "0.75rem" }}>
                          <div
                            style={{
                              width: 36, height: 36,
                              borderRadius: "var(--radius-md)",
                              background: "rgba(99,102,241,0.12)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                          >
                            <FolderKanban size={18} style={{ color: "var(--brand-secondary)" }} />
                          </div>
                          <span className={`badge ${statusColor[project.status]}`}>{project.status}</span>
                        </div>

                        <div className="font-semibold" style={{ marginBottom: "0.25rem" }}>
                          {project.title}
                        </div>
                        <div className="text-xs text-muted" style={{ marginBottom: "1rem" }}>
                          {project.client.name}
                        </div>

                        {project.description && (
                          <p
                            className="text-sm text-secondary"
                            style={{
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              marginBottom: "1rem",
                            }}
                          >
                            {project.description}
                          </p>
                        )}

                        <div
                          className="flex items-center justify-between text-xs text-muted"
                          style={{ paddingTop: "0.75rem", borderTop: "1px solid var(--border-subtle)" }}
                        >
                          <span>📁 {project._count.files} files</span>
                          <span>✅ {project._count.approvals} approvals</span>
                          {project.dueDate && (
                            <div className="flex items-center gap-1">
                              <Clock size={11} />
                              {new Date(project.dueDate).toLocaleDateString("en-US", {
                                month: "short", day: "numeric",
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
