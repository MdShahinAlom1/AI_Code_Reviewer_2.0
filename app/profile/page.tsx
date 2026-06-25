import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Bell, Calendar, FileCode2, Mail, Shield, User } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import Navbar from '@/components/Navbar'
import EmptyState from '@/components/EmptyState'
import QualityScore from '@/components/QualityScore'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      submissions: {
        include: { language: true, bugReport: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      notifications: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      _count: {
        select: { submissions: true, notifications: true, memberships: true },
      },
    },
  })

  if (!user) redirect('/login')

  const doneSubmissions = user.submissions.filter((s) => s.status === 'DONE')
  const avgScore = doneSubmissions.length
    ? Math.round(doneSubmissions.reduce((sum, submission) => sum + (submission.qualityScore || 0), 0) / doneSubmissions.length)
    : 0

  return (
    <div className="min-h-screen bg-[#0a0d14]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="text-slate-400 text-sm mt-0.5">Manage your account information and activity.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-6 lg:col-span-1">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-brand-600/20 flex items-center justify-center mb-4">
                <User size={32} className="text-brand-400" />
              </div>

              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-sm text-slate-500 mt-1 break-all">{user.email}</p>

              <span
                className={`mt-4 text-xs px-3 py-1 rounded-full font-semibold ${
                  user.role === 'ADMIN'
                    ? 'bg-red-500/15 text-red-400'
                    : user.role === 'TEACHER'
                      ? 'bg-purple-500/15 text-purple-400'
                      : 'bg-brand-500/15 text-brand-400'
                }`}
              >
                {user.role}
              </span>
            </div>

            <div className="mt-6 space-y-3 border-t border-white/[0.06] pt-5">
              <div className="flex items-center gap-3 text-sm">
                <Mail size={15} className="text-slate-500" />
                <span className="text-slate-400 break-all">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield size={15} className="text-slate-500" />
                <span className="text-slate-400">{user.role}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={15} className="text-slate-500" />
                <span className="text-slate-400">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="card p-5">
                <div className="text-2xl font-bold text-white">{user._count.submissions}</div>
                <div className="text-sm text-slate-400">Total Submissions</div>
              </div>
              <div className="card p-5">
                <div className="text-2xl font-bold text-white">{avgScore}</div>
                <div className="text-sm text-slate-400">Average Score</div>
              </div>
              <div className="card p-5">
                <div className="text-2xl font-bold text-white">{user._count.notifications}</div>
                <div className="text-sm text-slate-400">Notifications</div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <FileCode2 size={15} className="text-brand-400" /> Recent Submissions
                </h3>
                <Link href="/history" className="text-xs text-brand-400 hover:text-brand-300">
                  View all →
                </Link>
              </div>

              {user.submissions.length === 0 ? (
                <EmptyState
                  icon={FileCode2}
                  title="No submissions yet"
                  description="Submit your first code to see your profile activity."
                  action={{ label: 'Analyze Code', href: '/submit' }}
                />
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {user.submissions.map((submission) => (
                    <div key={submission.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02]">
                      <div className="w-9 h-9 rounded-lg bg-brand-600/10 flex items-center justify-center">
                        <FileCode2 size={15} className="text-brand-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate">{submission.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {submission.language.name} · {new Date(submission.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {submission.qualityScore != null && <QualityScore score={submission.qualityScore} size="sm" />}
                      {submission.bugReport && (
                        <Link href={`/reports/${submission.bugReport.id}`} className="text-brand-400 hover:text-brand-300">
                          <ArrowRight size={16} />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <div className="p-5 border-b border-white/[0.06]">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Bell size={15} className="text-yellow-400" /> Recent Notifications
                </h3>
              </div>

              {user.notifications.length === 0 ? (
                <div className="p-8 text-sm text-slate-500 text-center">No notifications yet.</div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {user.notifications.map((notification) => (
                    <div key={notification.id} className="px-5 py-4">
                      <div className="text-sm font-medium text-white">{notification.title}</div>
                      <div className="text-xs text-slate-500 mt-1">{notification.message}</div>
                      <div className="text-xs text-slate-600 mt-1">{new Date(notification.createdAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
