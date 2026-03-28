import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function PortalInvoicesPage() {
  const headersList = await headers()
  const workspaceSlug = headersList.get("x-workspace-slug")

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceSlug! },
  })

  if (!workspace) notFound()

  const invoices = await prisma.invoice.findMany({
    where: { workspaceId: workspace.id, status: { not: "DRAFT" } },
    include: { project: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="text-3xl font-bold">Invoices & Payments</h1>
        <p className="text-muted mt-2">Manage your billing and payment history.</p>
      </div>

      {invoices.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <h2 className="text-xl font-bold">No invoices</h2>
          <p className="text-muted mt-2">You don't have any invoices right now.</p>
        </div>
      ) : (
        <div className="flex-col gap-4">
          {invoices.map((inv) => (
            <div key={inv.id} className="card flex items-center justify-between">
              <div>
                <div className="font-bold text-lg mb-1">
                  ${inv.amount.toLocaleString()} {inv.currency}
                </div>
                <div className="text-sm text-secondary">
                  {inv.project.title}
                </div>
                <div className="text-xs text-muted mt-1">
                  {inv.dueDate ? `Due ${new Date(inv.dueDate).toLocaleDateString()}` : "Due upon receipt"}
                </div>
              </div>

              <div className="flex items-center gap-4">
                {inv.status === "PAID" ? (
                  <span className="badge badge-success px-3 py-1 text-sm bg-green-500/10 text-green-500 rounded-full flex items-center gap-1">
                    ✓ Paid
                  </span>
                ) : (
                  <>
                    <span className="text-sm text-warning font-medium">Unpaid</span>
                    {inv.stripePaymentUrl && (
                      <a
                        href={inv.stripePaymentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary"
                      >
                        Pay Now
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
