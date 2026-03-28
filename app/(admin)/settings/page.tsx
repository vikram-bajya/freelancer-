import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Palette, Link as LinkIcon, Building } from "lucide-react"

export default async function SettingsPage() {
  const session = await auth()
  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id },
    include: { workspace: true },
  })

  const workspace = user?.workspace!

  async function updateSettings(formData: FormData) {
    "use server"
    const name = formData.get("name") as string
    const slug = formData.get("slug") as string
    const brandColor = formData.get("brandColor") as string
    const customDomain = formData.get("customDomain") as string

    await prisma.workspace.update({
      where: { id: workspace.id },
      data: { name, slug, brandColor, customDomain: customDomain || null },
    })

    revalidatePath("/settings")
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Workspace Settings</h1>
          <p className="page-subtitle">Manage your agency profile and white-label branding.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: "800px" }}>
        <form action={updateSettings} className="flex-col gap-6">
          
          <div className="flex-col gap-4">
            <h3 className="flex items-center gap-2 font-semibold text-lg" style={{ marginBottom: "0.5rem" }}>
              <Building size={18} className="text-brand" /> Agency Details
            </h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Agency Name</label>
                <input type="text" id="name" name="name" defaultValue={workspace.name} required />
              </div>
              
              <div className="form-group">
                <label htmlFor="slug">Portal Subdomain ID</label>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    defaultValue={workspace.slug}
                    pattern="^[a-z0-9-]+$"
                    title="Lowercase letters, numbers, and hyphens only"
                    required
                    style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                  />
                  <div
                    style={{
                      padding: "0.6rem 0.875rem",
                      background: "var(--bg-muted)",
                      border: "1px solid var(--border)",
                      borderLeft: "none",
                      borderTopRightRadius: "var(--radius-md)",
                      borderBottomRightRadius: "var(--radius-md)",
                      color: "var(--text-muted)",
                      fontSize: "0.875rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    .clientportal.dev
                  </div>
                </div>
                <div className="text-xs text-muted mt-1">
                  Clients will access their portal at <strong>{workspace.slug}.clientportal.dev</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="divider" />

          <div className="flex-col gap-4">
            <h3 className="flex items-center gap-2 font-semibold text-lg" style={{ marginBottom: "0.5rem" }}>
              <Palette size={18} className="text-brand" /> White-label Branding
            </h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="brandColor">Primary Brand Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="brandColor"
                    name="brandColor"
                    defaultValue={workspace.brandColor}
                    style={{
                      width: "50px",
                      height: "40px",
                      padding: "2px",
                      cursor: "pointer",
                    }}
                  />
                  <input
                    type="text"
                    defaultValue={workspace.brandColor}
                    style={{ flex: 1 }}
                    disabled
                  />
                </div>
                <div className="text-xs text-muted mt-1">
                  This color will be used for buttons and accents in the client portal.
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="customDomain">Custom Domain (Optional)</label>
                <div style={{ position: "relative" }}>
                  <LinkIcon size={16} className="absolute text-muted" style={{ left: "12px", top: "14px" }} />
                  <input
                    type="text"
                    id="customDomain"
                    name="customDomain"
                    defaultValue={workspace.customDomain || ""}
                    placeholder="portal.youragency.com"
                    style={{ paddingLeft: "36px" }}
                  />
                </div>
                <div className="text-xs text-muted mt-1">
                  Requires CNAME configuration.
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ maxWidth: "800px", marginTop: "1.5rem" }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold" style={{ marginBottom: "0.25rem" }}>Client View Preview</h3>
            <p className="text-sm text-muted">See how the portal looks with your branding.</p>
          </div>
          <a
            href={`/portal?workspace=${workspace.slug}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary btn-sm"
          >
            Preview Portal ↗
          </a>
        </div>
      </div>
    </div>
  )
}
