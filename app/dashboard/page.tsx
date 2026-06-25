import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Bug, Clock, Code2, FileCode2, Plus, TrendingUp } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import Navbar from '@/components/Navbar'
import DashboardCard from '@/components/DashboardCard'
import EmptyState from '@/components/EmptyState'
import QualityScore from '@/components/QualityScore'
import SimpleChart from '@/components/SimpleChart'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) redirect('/login')
  if (session.user.role === 'TEACHER') redirect('/teacher')
  if (session.user.role === 'ADMIN') redirect('/admin')

  const submissions = await prisma.submission.findMany({
    where: { userId: session.user.id },
    include: {
      language: true,
      bugReport: { include: { bugRecords: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const done = submissions.filter((s) => s.status === 'DONE')
  const avgScore = done.length ? Math.round(done.reduce((sum, item) => sum + (item.qualityScore || 0), 0) / done.length) : 0
  const totalBugs = done.reduce((sum, item) => sum + (item.bugReport?.totalBugs || 0), 0)
  const allBugs = done.flatMap((s) => s.bugReport?.bugRecords || [])

  const catCount: Record<string, number> = {}
  for (const bug of allBugs) catCount[bug.category] = (catCount[bug.category] || 0) + 1
  const topCat = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

  const chartData = done
    .slice()
    .reverse()
    .slice(-10)
    .map((s, i) => ({ label: `#${i + 1}`, score: s.qualityScore || 0 }))

  const severityMap: Record<string, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 }
  for (const bug of allBugs) severityMap[bug.severity] = (severityMap[bug.severity] || 0) + 1

  return (
    <div className="min-h-screen bg-[#0a0d14]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400 text-sm mt-0.5">Welcome back, {session.user.name}</p>
          </div>
          <Link href="/submit" className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <Plus size={16} /> Analyze New Code
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <DashboardCard title="Total Submissions" value={submissions.length} icon={FileCode2} iconColor="text-brand-400" />
          <DashboardCard title="Avg Quality Score" value={avgScore} icon={TrendingUp} iconColor="text-emerald-400" subtitle="/100" />
          <DashboardCard title="Bugs Detected" value={totalBugs} icon={Bug} iconColor="text-red-400" />
          <DashboardCard title="Top Issue Type" value={topCat} icon={Code2} iconColor="text-orange-400" />
        </div>

        {done.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <div className="lg:col-span-2 card p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Quality Score Trend</h3>
              <SimpleChart data={chartData} />
            </div>
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-white mb-4">Severity Distribution</h3>
              <div className="space-y-3">
                {[
                  { label: 'Critical', key: 'CRITICAL', cls: 'bg-red-500' },
                  { label: 'High', key: 'HIGH', cls: 'bg-orange-500' },
                  { label: 'Medium', key: 'MEDIUM', cls: 'bg-yellow-500' },
                  { label: 'Low', key: 'LOW', cls: 'bg-blue-500' },
                  { label: 'Info', key: 'INFO', cls: 'bg-slate-500' },
                ].map((item) => {
                  const count = severityMap[item.key] || 0
                  const pct = totalBugs > 0 ? (count / totalBugs) * 100 : 0
                  return (
                    <div key={item.key} className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-14">{item.label}</span>
                      <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className={`h-full ${item.cls} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-slate-500 w-4 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
            <h3 className="font-semibold text-white">Recent Submissions</h3>
            <Link href="/history" className="text-xs text-brand-400 hover:text-brand-300">
              View all →
            </Link>
          </div>

          {submissions.length === 0 ? (
            <EmptyState
              icon={Code2}
              title="No submissions yet"
              description="Submit your first code snippet to get a quality analysis and bug report."
              action={{ label: 'Analyze Code', href: '/submit' }}
            />
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {submissions.slice(0, 6).map((submission) => (
                <div key={submission.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-brand-600/10 flex items-center justify-center shrink-0">
                    <FileCode2 size={14} className="text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{submission.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500 code-font">{submission.language.name}</span>
                      <span className="text-slate-700">·</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={11} /> {new Date(submission.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {submission.qualityScore != null && <QualityScore score={submission.qualityScore} size="sm" />}
                  {submission.bugReport && (
                    <Link href={`/reports/${submission.bugReport.id}`} className="btn-secondary text-xs py-1 px-3 shrink-0">
                      View Report
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
