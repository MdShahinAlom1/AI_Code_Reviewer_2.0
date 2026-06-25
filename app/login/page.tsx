'use client'

import type React from 'react'
import { useState } from 'react'
import { getSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, Eye, EyeOff, Shield } from 'lucide-react'

const DEMO = [
  { role: 'Student', email: 'student@codeguard.ai', color: 'text-brand-400' },
  { role: 'Teacher', email: 'teacher@codeguard.ai', color: 'text-purple-400' },
  { role: 'Admin', email: 'admin@codeguard.ai', color: 'text-orange-400' },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    const session = await getSession()
    const role = session?.user?.role
    router.push(role === 'TEACHER' ? '/teacher' : role === 'ADMIN' ? '/admin' : '/dashboard')
    router.refresh()
  }

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('password123')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0d14] py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl text-white">
              CodeGuard <span className="text-brand-400">AI</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="card p-4 mb-6">
          <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wider">Quick Demo Login</p>
          <div className="flex gap-2 flex-wrap">
            {DEMO.map((item) => (
              <button
                type="button"
                key={item.role}
                onClick={() => fillDemo(item.email)}
                className={`text-xs px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:border-white/20 transition-colors ${item.color}`}
              >
                {item.role}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-6">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-3 py-2.5 mb-4 text-sm">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input w-full pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-4">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-brand-400 hover:text-brand-300">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
