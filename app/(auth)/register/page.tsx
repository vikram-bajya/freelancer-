"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
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

      <div className="divider mt-6 mb-6">Or continue with</div>

      <button
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="btn btn-secondary w-full flex items-center justify-center gap-2"
        style={{ padding: "0.75rem" }}
        disabled={loading}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
          <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
            <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 52.749 L -8.284 52.749 C -8.574 53.879 -9.224 54.819 -10.144 55.459 L -10.144 57.779 L -6.324 57.779 C -4.084 55.739 -2.774 52.539 -2.774 48.819 L -3.264 51.509 Z"/>
            <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.144 58.009 C -11.214 58.729 -12.564 59.159 -14.754 59.159 C -18.984 59.159 -22.564 56.329 -23.824 52.539 L -27.684 52.539 L -27.684 55.519 C -25.464 59.879 -20.444 63.239 -14.754 63.239 Z"/>
            <path fill="#FBBC05" d="M -23.824 52.539 C -24.144 51.589 -24.324 50.599 -24.324 49.539 C -24.324 48.479 -24.144 47.489 -23.824 46.539 L -23.824 43.559 L -27.684 43.559 C -28.464 45.109 -28.924 46.889 -28.924 48.749 C -28.924 50.609 -28.464 52.389 -27.684 53.939 L -23.824 52.539 Z"/>
            <path fill="#EA4335" d="M -14.754 39.739 C -12.984 39.739 -11.404 40.359 -10.144 41.539 L -6.644 38.039 C -8.804 36.039 -11.514 34.939 -14.754 34.939 C -20.444 34.939 -25.464 38.299 -27.684 42.659 L -23.824 45.639 C -22.564 41.849 -18.984 39.739 -14.754 39.739 Z"/>
          </g>
        </svg>
        Sign in with Google
      </button>

      <div className="text-center text-sm text-muted mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-brand hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  )
}
