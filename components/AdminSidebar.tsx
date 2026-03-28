"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  FileText,
  CheckSquare,
  Receipt,
  Settings,
  LogOut,
  Zap,
  MessageSquare,
} from "lucide-react"

const navItems = [
  {
    section: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    section: "Work",
    items: [
      { href: "/projects", label: "Projects", icon: FolderKanban },
      { href: "/clients", label: "Clients", icon: Users },
      { href: "/approvals", label: "Approvals", icon: CheckSquare },
      { href: "/files", label: "Files", icon: FileText },
    ],
  },
  {
    section: "Business",
    items: [
      { href: "/invoices", label: "Invoices", icon: Receipt },
    ],
  },
  {
    section: "Settings",
    items: [{ href: "/settings", label: "Settings", icon: Settings }],
  },
]

interface AdminSidebarProps {
  userName?: string | null
  userEmail?: string | null
  workspaceName?: string | null
}

export default function AdminSidebar({
  userName,
  userEmail,
  workspaceName,
}: AdminSidebarProps) {
  const pathname = usePathname()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U"

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Zap size={18} />
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: "0.9375rem", color: "var(--text-primary)" }}>
            {workspaceName || "PortalHQ"}
          </div>
          <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
            Admin Panel
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((group) => (
          <div key={group.section}>
            <div className="sidebar-section">{group.section}</div>
            {group.items.map((item) => {
              const Icon = item.icon
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${isActive ? "active" : ""}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="user-chip" style={{ marginBottom: "0.5rem" }}>
          <div className="avatar">{initials}</div>
          <div className="flex-col" style={{ overflow: "hidden" }}>
            <div
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {userName || "User"}
            </div>
            <div
              style={{
                fontSize: "0.6875rem",
                color: "var(--text-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {userEmail}
            </div>
          </div>
        </div>
        <button
          className="btn btn-ghost btn-sm w-full"
          onClick={handleLogout}
          disabled={isLoggingOut}
          style={{ justifyContent: "flex-start", gap: "0.5rem" }}
        >
          <LogOut size={16} />
          <span>{isLoggingOut ? "Logging out…" : "Sign out"}</span>
        </button>
      </div>
    </aside>
  )
}
