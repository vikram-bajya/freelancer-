import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "PortalHQ — White-Label Client Portal for Freelancers",
  description:
    "The all-in-one client portal for freelancers and agencies. Share files, get approvals, send invoices, and keep clients in the loop — all in one branded hub.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
