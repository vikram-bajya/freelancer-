import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Clock, Download, CheckCircle, AlertCircle } from "lucide-react"

export default async function PortalDashboardPage(props: PageProps<"/portal">) {
  const headersList = await headers()
  const workspaceSlug = headersList.get("x-workspace-slug")
  
  // Use a query param for the client ID in this demo
  const searchParams = await props.searchParams
  const clientId = typeof searchParams.client === "string" ? searchParams.client : undefined

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug! },
  })

  if (!workspace) notFound()

  // For MVP: Fetch all active projects for this workspace.
  // In a real app, we'd filter by the logged-in client.
  const projects = await prisma.project.findMany({
    where: { 
      workspaceId: workspace.id,
      ...(clientId ? { clientId } : {})
    },
    include: {
      client: true,
      timelineEvents: { orderBy: { date: "asc" } },
      approvals: { orderBy: { createdAt: "desc" } },
      files: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { updatedAt: "desc" },
  })

  if (projects.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
        <h2 className="text-xl font-bold">No active projects</h2>
        <p className="text-muted mt-2">You don't have any active projects right now.</p>
      </div>
    )
  }

  // We'll show the most recently updated project
  const project = projects[0]

  const completedEvents = project.timelineEvents.filter((e) => e.completed).length
  const progress = project.timelineEvents.length
    ? Math.round((completedEvents / project.timelineEvents.length) * 100)
    : 0

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

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="text-3xl font-bold">{project.title}</h1>
        {project.description && (
          <p className="text-muted mt-2" style={{ maxWidth: "800px" }}>{project.description}</p>
        )}
      </div>

      <div className="card" style={{ marginBottom: "2rem" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: "0.75rem" }}>
          <span className="font-semibold">Project Progress</span>
          <span className="text-sm font-medium">{progress}% Complete</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Timeline */}
        <div className="card">
          <h3 className="font-semibold text-lg" style={{ marginBottom: "1.5rem" }}>
            Project Timeline
          </h3>
          <div style={{ position: "relative", paddingLeft: "1.5rem" }}>
            <div className="timeline-line" style={{ top: 8 }} />
            {project.timelineEvents.map((event, i) => (
              <div
                key={event.id}
                style={{
                  position: "relative",
                  marginBottom: i < project.timelineEvents.length - 1 ? "1.5rem" : 0,
                }}
              >
                <div
                  className={`timeline-dot ${event.completed ? "done" : ""}`}
                  style={{
                    position: "absolute", left: "-1.5rem", top: 0,
                    width: "16px", height: "16px", transform: "translateX(-50%)"
                  }}
                />
                <div className={`font-medium ${event.completed ? "" : "text-muted"}`}>
                  {event.title}
                </div>
                <div className="text-xs text-muted mt-1">
                  {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-col gap-6">
          {/* Action Required: Approvals */}
          <div className="card" style={{ borderColor: project.approvals.some(a => a.status === "PENDING") ? "var(--brand-primary)" : "var(--border)" }}>
            <h3 className="font-semibold text-lg flex items-center gap-2" style={{ marginBottom: "1.25rem" }}>
              Needs Review {project.approvals.some(a => a.status === "PENDING") && <span className="badge badge-brand">Action Required</span>}
            </h3>
            
            {project.approvals.length === 0 ? (
              <p className="text-sm text-muted">No items require your review right now.</p>
            ) : (
              <div className="flex-col gap-3">
                {project.approvals.map((item) => (
                  <div key={item.id} className={`approval-card ${item.status.toLowerCase()}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {approvalIcon[item.status]}
                        <span className="font-medium text-sm">{item.title}</span>
                      </div>
                      <span className={`badge ${statusColor[item.status]}`}>{item.status}</span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted mb-3">{item.description}</p>
                    )}
                    
                    {item.status === "PENDING" && (
                      <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                        <button className="btn btn-primary btn-sm flex-1">Approve</button>
                        <button className="btn btn-secondary btn-sm flex-1">Request Revision</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Files */}
          <div className="card">
            <h3 className="font-semibold text-lg" style={{ marginBottom: "1.25rem" }}>
              Deliverables
            </h3>
            
            {project.files.length === 0 ? (
              <p className="text-sm text-muted">No files shared yet.</p>
            ) : (
              <div className="flex-col gap-3">
                {project.files.map((file) => (
                  <a key={file.id} href={file.url} target="_blank" rel="noreferrer" className="file-card">
                    <div className="file-icon">📄</div>
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <div className="font-medium text-sm truncate">{file.name}</div>
                      <div className="text-xs text-muted">
                        {file.size ? `${(file.size / 1024).toFixed(1)} KB` : "File"} · {new Date(file.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Download size={16} className="text-brand" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
