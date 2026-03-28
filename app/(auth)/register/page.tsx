"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Zap } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // For the MVP, we skip the actual API call and simulate a quick registration
    // In a real app, you'd call a Server Action or API Route here to create the User + Workspace
    setTimeout(() => {
      setError("Registration is disabled in this demo. Please use the demo login.")
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="auth-card">
      <div className="flex flex-col items-center mb-8">
        <div
          className="sidebar-logo-icon mb-4"
          style={{ width: "48px", height: "48px", fontSize: "1.25rem" }}
        >
          <Zap size={24} />
        </div>
        <h1 className="text-2xl font-bold">Create your agency</h1>
        <p className="text-sm text-muted mt-1">Start managing clients like a pro</p>
      </div>

      {error && (
        <div
          className="mb-6 p-3 text-sm text-center"
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            color: "var(--danger)",
            borderRadius: "var(--radius-md)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex-col gap-4">
        <div className="form-group">
          <label htmlFor="agency">Agency Name</label>
          <input
            type="text"
            id="agency"
            name="agency"
            placeholder="Acme Studio"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="name">Your Name</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="John Doe"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="john@acme.com"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="••••••••"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full mt-4"
          disabled={loading}
          style={{ padding: "0.75rem" }}
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <div className="text-center text-sm text-muted mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-brand hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  )
}
