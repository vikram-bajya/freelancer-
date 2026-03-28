"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Zap } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (res?.error) {
      setError("Invalid email or password")
      setLoading(false)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
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
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-muted mt-1">Sign in to your freelancer dashboard</p>
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
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="admin@demo.com"
            autoComplete="email"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <div className="flex items-center justify-between">
            <label htmlFor="password">Password</label>
            <a href="#" className="text-xs text-brand hover:underline">
              Forgot password?
            </a>
          </div>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="••••••••"
            autoComplete="current-password"
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
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="text-center text-sm text-muted mt-6">
        Don't have an account?{" "}
        <Link href="/register" className="text-brand hover:underline">
          Create one
        </Link>
      </div>
      
      <div className="mt-8 pt-6 border-t border-[var(--border)] text-center text-xs text-muted">
        <strong>Demo Login:</strong> admin@demo.com / password123
      </div>
    </div>
  )
}
