import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Clock, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default async function ProjectDetailPage(props: PageProps<"/projects/[id]">) {
  const { id } = await props.params
  const session = await auth()
  const user = await prisma.user.findUnique({ where: { id: session!.user!.id } })

  const project = await prisma.project.findFirst({
    where: { id, workspaceId: user?.workspaceId! },
    include: {
      client: true,
      files: { orderBy: { createdAt: "desc" } },
      approvals: { orderBy: { createdAt: "desc" } },
      invoices: { orderBy: { createdAt: "desc" } },
      messages: { orderBy: { createdAt: "asc" } },
      timelineEvents: { orderBy: { date: "asc" } },
    },
  })

  if (!project) notFound()

  const statusColor: Record<string, string> = {
    PENDING: "badge-info",
    APPROVED: "badge-success",
    REVISION: "badge-warning",
  }

  const approvalIcon: Record<string, React.ReactNode> = {
    APPROVED: <CheckCircle size={16} style={{ color: "var(--success)" }} />,
    REVISION: <AlertCircle size={16} style={{ color: "var(--warning)" }} />,
    PENDING: <Clock size={16} style={{ color: "var(--info)" }} />,
  }

  const completedEvents = project.timelineEvents.filter((e) => e.completed).length
  const progress = project.timelineEvents.length
    ? Math.round((completedEvents / project.timelineEvents.length) * 100)
    : 0

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "0.75rem" }}>
        <Link href="/projects" className="text-xs text-muted" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
          ← Back to projects
        </Link>
      </div>

      <div className="page-header" style={{ alignItems: "flex-start" }}>
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: "0.375rem" }}>
            <h1 className="page-title">{project.title}</h1>
            <span className={`badge badge-info`}>{project.status}</span>
          </div>
          <p className="page-subtitle">
            Client: <strong>{project.client.name}</strong>
            {project.dueDate && (
              <span style={{ marginLeft: "1rem" }}>
                Due: {new Date(project.dueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/projects/${project.id}/edit`} className="btn btn-secondary btn-sm">
            Edit Project
          </Link>
        </div>
      </div>

      {/* Progress */}
      {project.timelineEvents.length > 0 && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div className="flex items-center justify-between" style={{ marginBottom: "0.75rem" }}>
            <span className="font-semibold">Overall Progress</span>
            <span className="text-sm text-muted">{progress}% complete</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Timeline */}
        <div className="card">
          <div className="font-semibold" style={{ marginBottom: "1.25rem" }}>
            📅 Timeline
          </div>
          {project.timelineEvents.length === 0 ? (
            <p className="text-sm text-muted">No timeline events. Add some to track progress.</p>
          ) : (
            <div style={{ position: "relative", paddingLeft: "2rem" }}>
              <div className="timeline-line" />
              {project.timelineEvents.map((event, i) => (
                <div
                  key={event.id}
                  style={{
                    position: "relative",
                    marginBottom: i < project.timelineEvents.length - 1 ? "1.25rem" : 0,
                  }}
                >
                  <div
                    className={`timeline-dot ${event.completed ? "done" : ""}`}
                    style={{ position: "absolute", left: "-2rem", top: "2px" }}
                  />
                  <div className="font-medium text-sm">{event.title}</div>
                  <div className="text-xs text-muted">
                    {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    {event.completed && (
                      <span style={{ color: "var(--success)", marginLeft: "0.5rem" }}>✓ Done</span>
                    )}
                  </div>
                  {event.description && (
                    <div className="text-xs text-muted" style={{ marginTop: "0.25rem" }}>
                      {event.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approvals */}
        <div className="card">
          <div className="font-semibold" style={{ marginBottom: "1.25rem" }}>
            ✅ Approvals
          </div>
          {project.approvals.length === 0 ? (
            <p className="text-sm text-muted">No approval items yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              {project.approvals.map((item) => (
                <div
                  key={item.id}
                  className={`approval-card ${item.status.toLowerCase()}`}
                >
                  <div className="flex items-center justify-between" style={{ marginBottom: "0.375rem" }}>
                    <div className="flex items-center gap-2">
                      {approvalIcon[item.status]}
                      <span className="font-medium text-sm">{item.title}</span>
                    </div>
                    <span className={`badge ${statusColor[item.status]}`}>{item.status}</span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted">{item.description}</p>
                  )}
                  {item.clientNote && (
                    <div
                      className="text-xs"
                      style={{
                        marginTop: "0.5rem",
                        padding: "0.5rem 0.75rem",
                        background: "rgba(245,158,11,0.08)",
                        borderRadius: "var(--radius-sm)",
                        color: "var(--warning)",
                      }}
                    >
                      💬 Client: "{item.clientNote}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Files */}
        <div className="card">
          <div className="font-semibold" style={{ marginBottom: "1.25rem" }}>
            📁 Files & Deliverables
          </div>
          {project.files.length === 0 ? (
            <p className="text-sm text-muted">No files uploaded yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {project.files.map((file) => (
                <a key={file.id} href={file.url} target="_blank" rel="noreferrer" className="file-card">
                  <div className="file-icon">📄</div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div className="font-medium text-sm" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {file.name}
                    </div>
                    <div className="text-xs text-muted">
                      {file.size ? `${(file.size / 1024).toFixed(1)} KB` : file.type || "File"}
                    </div>
                  </div>
                  <Download size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Invoices */}
        <div className="card">
          <div className="font-semibold" style={{ marginBottom: "1.25rem" }}>
            💰 Invoices
          </div>
          {project.invoices.length === 0 ? (
            <p className="text-sm text-muted">No invoices created yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {project.invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between"
                  style={{
                    padding: "0.75rem",
                    background: "var(--bg-muted)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <div>
                    <div className="font-semibold">${inv.amount.toLocaleString()}</div>
                    <div className="text-xs text-muted">
                      {inv.dueDate
                        ? `Due ${new Date(inv.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                        : "No due date"}
                    </div>
                  </div>
                  <span
                    className={`badge ${
                      inv.status === "PAID"
                        ? "badge-success"
                        : inv.status === "OVERDUE"
                        ? "badge-danger"
                        : inv.status === "SENT"
                        ? "badge-warning"
                        : "badge-muted"
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="card" style={{ marginTop: "1.5rem" }}>
        <div className="font-semibold" style={{ marginBottom: "1.25rem" }}>
          💬 Messages
        </div>
        {project.messages.length === 0 ? (
          <p className="text-sm text-muted">No messages yet. Start the conversation.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "400px", overflowY: "auto" }}>
            {project.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderType === "FREELANCER" ? "justify-between" : ""}`}
                style={{ flexDirection: msg.senderType === "FREELANCER" ? "row-reverse" : "row", gap: "0.75rem", alignItems: "flex-start" }}
              >
                <div className="avatar" style={{ flexShrink: 0 }}>
                  {msg.senderName?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <div className="text-xs text-muted" style={{ marginBottom: "0.25rem" }}>
                    {msg.senderName} · {new Date(msg.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div className={`message-bubble ${msg.senderType.toLowerCase()}`}>
                    {msg.body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
