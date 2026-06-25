'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, CheckCircle, ChevronRight, Code2, Filter } from 'lucide-react'
import Navbar from '@/components/Navbar'
import BugCard, { type BugRecordView } from '@/components/BugCard'
import EmptyState from '@/components/EmptyState'
import FixChecklist from '@/components/FixChecklist'
import LearningRecommendation from '@/components/LearningRecommendation'
import QualityScore from '@/components/QualityScore'
import ScoreBreakdown from '@/components/ScoreBreakdown'
import { getRecommendations } from '@/lib/recommendations'
import { getLocalReport } from '@/lib/localHistory'

interface Report {
  id: string
  submissionId: string
  totalBugs: number
  qualityScore: number
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  infoCount: number
  createdAt: string
  submission: {
    title: string
    code: string
    language: { name: string }
    createdAt: string
  }
  bugRecords: BugRecordView[]
}

export default function ReportPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'beginner' | 'expert'>('beginner')
  const [filter, setFilter] = useState<string>('ALL')
  const [showCode, setShowCode] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/reports/${id}`)
        const data = await res.json()

        if (!res.ok) {
          const cached = getLocalReport(id)
          if (cached) {
            setReport(cached)
            return
          }
          setError(data.error || 'Report not found')
          return
        }

        setReport(data)
      } catch {
        const cached = getLocalReport(id)
        if (cached) {
          setReport(cached)
        } else {
          setError('Could not load report')
        }
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  const filtered = useMemo(() => {
    if (!report) return []
    return filter === 'ALL' ? report.bugRecords : report.bugRecords.filter((bug) => bug.severity === filter)
  }, [filter, report])

  const recommendations = useMemo(() => {
    if (!report) return []
    return getRecommendations(report.bugRecords.map((bug) => bug.category))
  }, [report])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <span className="w-5 h-5 border-2 border-white/20 border-t-brand-500 rounded-full animate-spin" />
          Loading report…
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-[#0a0d14]">
        <Navbar />
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <p className="text-slate-400">{error || 'Report not found.'}</p>
          <Link href="/history" className="btn-primary mt-4 inline-block">
            Back to History
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0d14]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-start gap-4 mb-6">
          <button onClick={() => router.back()} className="btn-ghost p-2 mt-0.5 shrink-0">
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/history" className="hover:text-slate-300">
                History
              </Link>
              <ChevronRight size={12} />
              <span>{report.submission.title}</span>
            </div>
            <h1 className="text-2xl font-bold text-white">{report.submission.title}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-slate-500 code-font bg-white/[0.05] px-2 py-0.5 rounded">
                {report.submission.language.name}
              </span>
              <span className="text-xs text-slate-500">{new Date(report.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card p-6 flex flex-col items-center justify-center">
            <QualityScore score={report.qualityScore} size="lg" />
            <div className="mt-3 text-center">
              <div className="text-sm font-semibold text-white">Quality Score</div>
              <div className="text-xs text-slate-500">
                {report.totalBugs} issue{report.totalBugs !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>

          <div className="md:col-span-2 card p-5">
            <div className="text-sm font-semibold text-white mb-3">Score Breakdown</div>
            <ScoreBreakdown
              critical={report.criticalCount}
              high={report.highCount}
              medium={report.mediumCount}
              low={report.lowCount}
              info={report.infoCount}
            />
          </div>
        </div>

        {report.totalBugs > 0 && (
          <div className="mb-6">
            <FixChecklist items={report.bugRecords.map((bug) => ({ id: bug.id, title: bug.title, severity: bug.severity }))} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-1">
                <button
                  onClick={() => setMode('beginner')}
                  className={`text-xs px-3 py-1.5 rounded-md transition-all ${mode === 'beginner' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <BookOpen size={12} className="inline mr-1" /> Beginner
                </button>
                <button
                  onClick={() => setMode('expert')}
                  className={`text-xs px-3 py-1.5 rounded-md transition-all ${mode === 'expert' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  <Code2 size={12} className="inline mr-1" /> Expert
                </button>
              </div>

              <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-1 flex-wrap">
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setFilter(item)}
                    className={`text-xs px-2.5 py-1.5 rounded-md transition-all ${filter === item ? 'bg-white/[0.1] text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {item === 'ALL' ? `All (${report.totalBugs})` : item}
                  </button>
                ))}
              </div>

              <button onClick={() => setShowCode(!showCode)} className="btn-ghost text-xs ml-auto">
                {showCode ? 'Hide' : 'View'} Source Code
              </button>
            </div>

            {showCode && (
              <div className="card mb-4 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.06] bg-[#0f1420]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                  </div>
                  <span className="text-xs text-slate-500 code-font">{report.submission.language.name}</span>
                </div>
                <pre className="code-font text-xs text-slate-300 p-4 overflow-x-auto leading-6">{report.submission.code}</pre>
              </div>
            )}

            {report.totalBugs === 0 ? (
              <EmptyState icon={CheckCircle} title="No issues found!" description="Your code passed all checks. Great work." />
            ) : filtered.length === 0 ? (
              <EmptyState icon={Filter} title="No issues match this filter" description="Try selecting a different severity level." />
            ) : (
              <div className="space-y-3">
                {filtered.map((bug, i) => (
                  <BugCard key={bug.id} bug={bug} mode={mode} index={i} />
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-8">
              <Link href="/submit" className="btn-primary flex items-center gap-2">
                Analyze Again
              </Link>
              <Link href="/history" className="btn-secondary">
                Back to History
              </Link>
            </div>
          </div>

          <div className="lg:col-span-1">
            <LearningRecommendation recommendations={recommendations} />
          </div>
        </div>
      </main>
    </div>
  )
}
