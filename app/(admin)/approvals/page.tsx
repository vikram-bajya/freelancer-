import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { CheckCircle, AlertCircle, Clock } from "lucide-react"

export default async function ApprovalsPage() {
  const session = await auth()
  const user = await prisma.user.findUnique({ where: { id: session!.user!.id } })
  const workspaceId = user?.workspaceId!

  const approvals = await prisma.approvalItem.findMany({
    where: { project: { workspaceId } },
    include: { project: { include: { client: true } } },
    orderBy: { updatedAt: "desc" },
  })

  const pending = approvals.filter((a) => a.status === "PENDING")
  const revision = approvals.filter((a) => a.status === "REVISION")
  const approved = approvals.filter((a) => a.status === "APPROVED")

  const statusIcon: Record<string, React.ReactNode> = {
    APPROVED: <CheckCircle size={16} style={{ color: "var(--success)" }} />,
    REVISION: <AlertCircle size={16} style={{ color: "var(--warning)" }} />,
    PENDING: <Clock size={16} style={{ color: "var(--info)" }} />,
  }

  const statusColor: Record<string, string> = {
    PENDING: "badge-info",
    APPROVED: "badge-success",
    REVISION: "badge-warning",
  }

  const renderGroup = (title: string, items: typeof approvals, emoji: string) => {
    if (items.length === 0) return null
    return (
      <div style={{ marginBottom: "2rem" }}>
        <div className="flex items-center gap-2" style={{ marginBottom: "1rem" }}>
          <span style={{ fontSize: "1.125rem" }}>{emoji}</span>
          <span className="font-semibold">{title}</span>
          <span className="badge badge-muted">{items.length}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {items.map((item) => (
            <div key={item.id} className={`approval-card ${item.status.toLowerCase()}`}>
              <div className="flex items-center justify-between" style={{ marginBottom: "0.375rem" }}>
                <div className="flex items-center gap-2">
                  {statusIcon[item.status]}
                  <span className="font-semibold">{item.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/projects/${item.project.id}`}
                    className="text-xs text-muted"
                    style={{ textDecoration: "underline" }}
                  >
                    {item.project.title}
                  </Link>
                  <span className={`badge ${statusColor[item.status]}`}>{item.status}</span>
                </div>
              </div>
              <div className="text-sm text-secondary" style={{ marginBottom: item.clientNote ? "0.625rem" : 0 }}>
                Client: <strong>{item.project.client.name}</strong>
                {item.description && ` — ${item.description}`}
              </div>
              {item.clientNote && (
                <div
                  className="text-xs"
                  style={{
                    padding: "0.5rem 0.75rem",
                    background: "rgba(245,158,11,0.08)",
                    borderRadius: "var(--radius-sm)",
                    color: "var(--warning)",
                  }}
                >
                  💬 "{item.clientNote}"
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Approvals</h1>
          <p className="page-subtitle">
            {pending.length} pending · {revision.length} needs revision · {approved.length} approved
          </p>
        </div>
      </div>

      {approvals.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <div className="font-semibold">No approval items</div>
            <p className="text-sm text-muted">Approval items are created within projects.</p>
          </div>
        </div>
      ) : (
        <>
          {renderGroup("Needs Revision", revision, "🔄")}
          {renderGroup("Pending Client Review", pending, "⏳")}
          {renderGroup("Approved", approved, "✅")}
        </>
      )}
    </div>
  )
}
