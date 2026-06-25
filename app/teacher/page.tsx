import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, BookOpen, Bug, ChevronRight, Clock, FileCode2, TrendingUp, Users } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import Navbar from '@/components/Navbar'
import DashboardCard from '@/components/DashboardCard'
import EmptyState from '@/components/EmptyState'
import QualityScore from '@/components/QualityScore'

export default async function TeacherPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) redirect('/login')
  if (session.user.role !== 'TEACHER') redirect('/dashboard')

  const classes = await prisma.class.findMany({
    where: { teacherId: session.user.id },
    include: { members: { include: { user: true } }, assignments: true },
  })

  const studentIds = Array.from(new Set(classes.flatMap((cls) => cls.members.map((member) => member.userId))))

  const submissions = await prisma.submission.findMany({
    where: { userId: { in: studentIds } },
    include: { language: true, user: true, bugReport: true },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })

  const done = submissions.filter((s) => s.status === 'DONE' && s.qualityScore != null)
  const avgScore = done.length ? Math.round(done.reduce((sum, item) => sum + (item.qualityScore || 0), 0) / done.length) : 0

  const studentScores: Record<string, number[]> = {}
  for (const submission of done) {
    if (!studentScores[submission.userId]) studentScores[submission.userId] = []
    studentScores[submission.userId].push(submission.qualityScore || 0)
  }

  const needingHelp = Object.entries(studentScores).filter(([, scores]) => scores.reduce((a, b) => a + b, 0) / scores.length < 50).length

  const bugRecords = await prisma.bugRecord.findMany({
    where: { bugReport: { submission: { userId: { in: studentIds } } } },
  })

  const catCount: Record<string, number> = {}
  for (const bug of bugRecords) catCount[bug.category] = (catCount[bug.category] || 0) + 1
  const topBugs = Object.entries(catCount).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <div className="min-h-screen bg-[#0a0d14]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Teacher Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">Welcome, {session.user.name}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <DashboardCard title="Total Students" value={studentIds.length} icon={Users} iconColor="text-brand-400" />
          <DashboardCard title="Total Submissions" value={submissions.length} icon={FileCode2} iconColor="text-purple-400" />
          <DashboardCard title="Class Avg Score" value={avgScore} icon={TrendingUp} iconColor="text-emerald-400" subtitle="/100" />
          <DashboardCard title="Students Need Help" value={needingHelp} icon={AlertCircle} iconColor="text-orange-400" subtitle="score < 50" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="p-5 border-b border-white/[0.06]">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <BookOpen size={15} className="text-brand-400" /> My Classes
              </h3>
            </div>
            {classes.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">No classes yet</div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {classes.map((cls) => (
                  <div key={cls.id} className="p-4">
                    <div className="font-medium text-white text-sm">{cls.name}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs code-font text-brand-400 bg-brand-600/10 px-1.5 py-0.5 rounded">{cls.code}</span>
                      <span className="text-xs text-slate-500">
                        {cls.members.length} student{cls.members.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="p-5 border-b border-white/[0.06]">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Bug size={15} className="text-red-400" /> Common Mistakes
              </h3>
            </div>
            {topBugs.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">No data yet</div>
            ) : (
              <div className="p-5 space-y-3">
                {topBugs.map(([category, count], index) => (
                  <div key={category} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-white/[0.06] text-xs text-slate-400 flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-sm text-slate-300">{category}</span>
                    <span className="text-xs text-slate-500 bg-white/[0.04] px-2 py-0.5 rounded">{count}x</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="p-5 border-b border-white/[0.06]">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <AlertCircle size={15} className="text-orange-400" /> Needs Attention
              </h3>
            </div>
            {Object.entries(studentScores).length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">No score data yet</div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {Object.entries(studentScores)
                  .sort((a, b) => a[1].reduce((x, y) => x + y, 0) / a[1].length - b[1].reduce((x, y) => x + y, 0) / b[1].length)
                  .slice(0, 5)
                  .map(([uid, scores]) => {
                    const submission = done.find((s) => s.userId === uid)
                    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                    if (!submission) return null
                    return (
                      <div key={uid} className="flex items-center gap-3 px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-brand-600/20 flex items-center justify-center text-xs text-brand-400 font-medium shrink-0">
                          {submission.user.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white truncate">{submission.user.name}</div>
                          <div className="text-xs text-slate-500">{scores.length} submission{scores.length !== 1 ? 's' : ''}</div>
                        </div>
                        <QualityScore score={avg} size="sm" />
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
            <h3 className="font-semibold text-white">Recent Student Submissions</h3>
            <Link href="/history" className="text-xs text-brand-400 hover:text-brand-300">
              View all →
            </Link>
          </div>
          {submissions.length === 0 ? (
            <EmptyState icon={FileCode2} title="No submissions" description="Your students have not submitted any code yet." />
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {submissions.slice(0, 8).map((submission) => (
                <div key={submission.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-brand-600/20 flex items-center justify-center text-xs text-brand-400 font-medium shrink-0">
                    {submission.user.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{submission.title}</div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-slate-500">{submission.user.name}</span>
                      <span className="text-slate-700">·</span>
                      <span className="text-xs text-slate-500 code-font">{submission.language.name}</span>
                      <span className="text-slate-700">·</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={11} /> {new Date(submission.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {submission.qualityScore != null && <QualityScore score={submission.qualityScore} size="sm" />}
                  {submission.bugReport && (
                    <Link href={`/reports/${submission.bugReport.id}`} className="text-brand-400 hover:text-brand-300">
                      <ChevronRight size={16} />
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
