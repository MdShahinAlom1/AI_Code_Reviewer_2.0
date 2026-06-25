'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Bug, Clock, FileCode2, Plus } from 'lucide-react'
import Navbar from '@/components/Navbar'
import EmptyState from '@/components/EmptyState'
import QualityScore from '@/components/QualityScore'
import { getLocalHistory, type StoredHistoryItem } from '@/lib/localHistory'

export default function HistoryPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [serverItems, setServerItems] = useState<StoredHistoryItem[]>([])
  const [localItems, setLocalItems] = useState<StoredHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return

    const loadHistory = async () => {
      setLoading(true)
      setLocalItems(getLocalHistory())

      try {
        const res = await fetch('/api/history', { cache: 'no-store' })
        const data = await res.json().catch(() => [])

        if (res.ok && Array.isArray(data)) {
          setServerItems(data)
        }
      } catch {
        // Browser-saved history still works when Vercel serverless SQLite cannot share /tmp data.
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [status])

  const submissions = useMemo(() => {
    const map = new Map<string, StoredHistoryItem>()

    for (const item of [...localItems, ...serverItems]) {
      const key = item.reportId || item.id
      if (!key) continue
      map.set(key, item)
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [localItems, serverItems])

  const role = (session?.user as any)?.role || 'STUDENT'

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center text-slate-400">
        Loading history...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0d14]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Submission History</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {submissions.length} submission{submissions.length !== 1 ? 's' : ''} total
            </p>
          </div>
          {role === 'STUDENT' && (
            <Link href="/submit" className="btn-primary flex items-center gap-2 text-sm whitespace-nowrap">
              <Plus size={15} /> New Analysis
            </Link>
          )}
        </div>

        {submissions.length === 0 ? (
          <EmptyState
            icon={FileCode2}
            title="No submissions yet"
            description="Submit your first code snippet to start tracking quality progress."
            action={role === 'STUDENT' ? { label: 'Analyze Code', href: '/submit' } : undefined}
          />
        ) : (
          <div className="card divide-y divide-white/[0.04]">
            {submissions.map((submission) => (
              <div key={submission.reportId || submission.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-brand-600/10 flex items-center justify-center shrink-0">
                  <FileCode2 size={16} className="text-brand-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">{submission.title}</span>
                    {role !== 'STUDENT' && submission.userName && <span className="text-xs text-slate-500">by {submission.userName}</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs code-font text-slate-500 bg-white/[0.04] px-1.5 py-0.5 rounded">{submission.languageName}</span>
                    <span className="text-xs text-slate-600 flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(submission.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-xs text-slate-600 flex items-center gap-1">
                      <Bug size={11} /> {submission.totalBugs} issue{submission.totalBugs !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {submission.qualityScore != null && <QualityScore score={submission.qualityScore} size="sm" />}
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium ${
                      submission.status === 'DONE'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : submission.status === 'FAILED'
                          ? 'bg-red-500/15 text-red-400'
                          : 'bg-yellow-500/15 text-yellow-400'
                    }`}
                  >
                    {submission.status}
                  </span>
                  {submission.reportId && (
                    <Link href={`/reports/${submission.reportId}`} className="btn-secondary text-xs py-1 px-3">
                      View
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
