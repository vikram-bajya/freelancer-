import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { DollarSign, Clock, CheckCircle } from "lucide-react"

export default async function InvoicesPage() {
  const session = await auth()
  const user = await prisma.user.findUnique({ where: { id: session!.user!.id } })
  const workspaceId = user?.workspaceId!

  const invoices = await prisma.invoice.findMany({
    where: { workspaceId },
    include: { project: { include: { client: true } } },
    orderBy: { createdAt: "desc" },
  })

  const total = invoices.reduce((s, i) => s + i.amount, 0)
  const paid = invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + i.amount, 0)
  const outstanding = invoices
    .filter((i) => ["SENT", "OVERDUE"].includes(i.status))
    .reduce((s, i) => s + i.amount, 0)

  const statusColor: Record<string, string> = {
    DRAFT: "badge-muted",
    SENT: "badge-info",
    PAID: "badge-success",
    OVERDUE: "badge-danger",
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Invoices</h1>
          <p className="page-subtitle">{invoices.length} total invoices</p>
        </div>
        <Link href="/invoices/new" className="btn btn-primary">
          + Create Invoice
        </Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4" style={{ marginBottom: "2rem" }}>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Total Billed</span>
            <div className="stat-icon"><DollarSign size={20} /></div>
          </div>
          <div className="stat-value" style={{ fontSize: "1.5rem" }}>${total.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Collected</span>
            <div className="stat-icon" style={{ background: "rgba(34,197,94,0.1)", color: "var(--success)" }}>
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ fontSize: "1.5rem", color: "var(--success)" }}>
            ${paid.toLocaleString()}
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Outstanding</span>
            <div className="stat-icon" style={{ background: "rgba(245,158,11,0.1)", color: "var(--warning)" }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ fontSize: "1.5rem", color: "var(--warning)" }}>
            ${outstanding.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {invoices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🧾</div>
            <div className="font-semibold">No invoices yet</div>
            <p className="text-sm text-muted">Create your first invoice to start getting paid.</p>
            <Link href="/invoices/new" className="btn btn-primary">
              Create Invoice
            </Link>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Payment Link</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.project.title}</td>
                    <td>{inv.project.client.name}</td>
                    <td>
                      <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        ${inv.amount.toLocaleString()} {inv.currency}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${statusColor[inv.status]}`}>{inv.status}</span>
                    </td>
                    <td>
                      {inv.dueDate
                        ? new Date(inv.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </td>
                    <td>
                      {inv.stripePaymentUrl ? (
                        <a
                          href={inv.stripePaymentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: "0.75rem" }}
                        >
                          💳 View Link
                        </a>
                      ) : (
                        <span className="text-xs text-muted">No link</span>
                      )}
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
