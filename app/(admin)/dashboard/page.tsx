import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import {
  FolderKanban,
  Users,
  Receipt,
  CheckSquare,
  ArrowRight,
  TrendingUp,
  Clock,
} from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id },
    include: { workspace: true },
  })

  const workspaceId = user?.workspaceId!

  const [projectCount, clientCount, pendingApprovals, unpaidInvoices, recentProjects] =
    await Promise.all([
      prisma.project.count({ where: { workspaceId } }),
      prisma.client.count({ where: { workspaceId } }),
      prisma.approvalItem.count({
        where: { project: { workspaceId }, status: "PENDING" },
      }),
      prisma.invoice.aggregate({
        where: { workspaceId, status: { in: ["SENT", "OVERDUE"] } },
        _sum: { amount: true },
      }),
      prisma.project.findMany({
        where: { workspaceId },
        include: { client: true, _count: { select: { files: true, approvals: true } } },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
    ])

  const unpaidTotal = unpaidInvoices._sum.amount ?? 0

  const statusColor: Record<string, string> = {
    ACTIVE: "badge-info",
    REVIEW: "badge-warning",
    COMPLETED: "badge-success",
    PAUSED: "badge-muted",
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Good {getGreeting()}, {user?.name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="page-subtitle">
            Here's what's happening in{" "}
            <strong style={{ color: "var(--brand-secondary)" }}>
              {user?.workspace?.name}
            </strong>
          </p>
        </div>
        <Link href="/projects/new" className="btn btn-primary">
          + New Project
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4" style={{ marginBottom: "2rem" }}>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Active Projects</span>
            <div className="stat-icon">
              <FolderKanban size={20} />
            </div>
          </div>
          <div className="stat-value">{projectCount}</div>
          <div className="text-xs text-muted" style={{ marginTop: "0.375rem" }}>
            All time
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Clients</span>
            <div className="stat-icon" style={{ background: "rgba(34,197,94,0.1)", color: "var(--success)" }}>
              <Users size={20} />
            </div>
          </div>
          <div className="stat-value">{clientCount}</div>
          <div className="text-xs text-muted" style={{ marginTop: "0.375rem" }}>
            Total
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Pending Approvals</span>
            <div className="stat-icon" style={{ background: "rgba(245,158,11,0.1)", color: "var(--warning)" }}>
              <CheckSquare size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: pendingApprovals > 0 ? "var(--warning)" : "var(--text-primary)" }}>
            {pendingApprovals}
          </div>
          <div className="text-xs text-muted" style={{ marginTop: "0.375rem" }}>
            Awaiting client
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Outstanding</span>
            <div className="stat-icon" style={{ background: "rgba(59,130,246,0.1)", color: "var(--info)" }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ fontSize: "1.5rem" }}>
            ${unpaidTotal.toLocaleString()}
          </div>
          <div className="text-xs text-muted" style={{ marginTop: "0.375rem" }}>
            Unpaid invoices
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          className="flex items-center justify-between"
          style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <div className="font-semibold">Recent Projects</div>
            <div className="text-xs text-muted">Latest updates across your workspace</div>
          </div>
          <Link href="/projects" className="btn btn-ghost btn-sm" style={{ gap: "0.25rem" }}>
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🗂️</div>
            <div className="font-semibold">No projects yet</div>
            <div className="text-sm text-muted">Create your first project to get started.</div>
            <Link href="/projects/new" className="btn btn-primary btn-sm">
              Create Project
            </Link>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Files</th>
                  <th>Approvals</th>
                  <th>Due Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <div className="font-semibold">{project.title}</div>
                      {project.description && (
                        <div
                          className="text-xs text-muted"
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "200px",
                          }}
                        >
                          {project.description}
                        </div>
                      )}
                    </td>
                    <td>{project.client.name}</td>
                    <td>
                      <span className={`badge ${statusColor[project.status] || "badge-muted"}`}>
                        {project.status}
                      </span>
                    </td>
                    <td>{project._count.files}</td>
                    <td>{project._count.approvals}</td>
                    <td>
                      {project.dueDate ? (
                        <div className="flex items-center gap-1 text-xs text-muted">
                          <Clock size={12} />
                          {new Date(project.dueDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <Link
                        href={`/projects/${project.id}`}
                        className="btn btn-ghost btn-sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "morning"
  if (hour < 17) return "afternoon"
  return "evening"
}
