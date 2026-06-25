'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, LogOut, User } from 'lucide-react'

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const role = session?.user?.role

  const links = role === 'TEACHER'
    ? [
        { href: '/teacher', label: 'Dashboard' },
        { href: '/teacher/exams', label: 'Create Exams' },
        { href: '/teacher/grading', label: 'Grading' },
        { href: '/history', label: 'Submissions' },
      ]
    : role === 'ADMIN'
      ? [
          { href: '/admin', label: 'Admin Panel' },
          { href: '/admin/system', label: 'System' },
          { href: '/admin/logs', label: 'Logs' },
          { href: '/history', label: 'All Submissions' },
        ]
      : [
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/exams', label: 'Lab Exams' },
          { href: '/submit', label: 'Analyze Code' },
          { href: '/history', label: 'History' },
        ]

  return (
    <nav className="border-b border-white/[0.06] bg-[#0a0d14]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
            <Shield size={14} className="text-white" />
          </div>
          <span className="font-semibold text-white text-sm hidden sm:inline">
            CodeGuard <span className="text-brand-400">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 overflow-x-auto">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'bg-brand-600/20 text-brand-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-500 hidden lg:block max-w-[160px] truncate">
            {session?.user?.name}
          </span>
          <Link href="/profile" className="btn-ghost p-2 rounded-lg" title="Profile">
            <User size={16} />
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="btn-ghost p-2 rounded-lg text-slate-400"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  )
}
