import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { Activity, AlertCircle, CheckCircle, Code2, FileCode2, Users, XCircle } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import Navbar from '@/components/Navbar'
import DashboardCard from '@/components/DashboardCard'
import LanguageToggleButton from '@/components/LanguageToggleButton'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  const [users, submissions, languages] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.submission.findMany({ include: { language: true, user: true }, orderBy: { createdAt: 'desc' }, take: 50 }),
    prisma.language.findMany({ orderBy: { name: 'asc' } }),
  ])

  const failed = submissions.filter((s) => s.status === 'FAILED').length
  const done = submissions.filter((s) => s.status === 'DONE').length
  const pending = submissions.filter((s) => s.status === 'PENDING' || s.status === 'ANALYZING').length
  const students = users.filter((u) => u.role === 'STUDENT').length
  const teachers = users.filter((u) => u.role === 'TEACHER').length

  const langUsage: Record<string, number> = {}
  for (const submission of submissions) {
    langUsage[submission.language.name] = (langUsage[submission.language.name] || 0) + 1
  }

  return (
    <div className="min-h-screen bg-[#0a0d14]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">System overview and management</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <DashboardCard title="Total Users" value={users.length} icon={Users} iconColor="text-brand-400" subtitle={`${students} students, ${teachers} teachers`} />
          <DashboardCard title="Total Submissions" value={submissions.length} icon={FileCode2} iconColor="text-purple-400" />
          <DashboardCard title="Active Languages" value={languages.filter((l) => l.enabled).length} icon={Code2} iconColor="text-emerald-400" />
          <DashboardCard title="Failed Analyses" value={failed} icon={AlertCircle} iconColor="text-red-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Analysis Engine', status: 'Operational', ok: true },
            { label: 'Database', status: 'Operational', ok: true },
            { label: 'Authentication', status: 'Operational', ok: true },
          ].map((item) => (
            <div key={item.label} className="card p-4 flex items-center gap-3">
              {item.ok ? <CheckCircle size={18} className="text-emerald-400 shrink-0" /> : <XCircle size={18} className="text-red-400 shrink-0" />}
              <div>
                <div className="text-sm font-medium text-white">{item.label}</div>
                <div className={`text-xs ${item.ok ? 'text-emerald-400' : 'text-red-400'}`}>{item.status}</div>
              </div>
              <div className={`ml-auto w-2 h-2 rounded-full ${item.ok ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <div className="p-5 border-b border-white/[0.06]">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Code2 size={15} className="text-brand-400" /> Language Management
              </h3>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {languages.map((language) => (
                <div key={language.id} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="text-sm font-medium text-white code-font flex-1">{language.name}</span>
                  <span className="text-xs text-slate-500">{langUsage[language.name] || 0} submissions</span>
                  <LanguageToggleButton id={language.id} enabled={language.enabled} />
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="p-5 border-b border-white/[0.06]">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Activity size={15} className="text-purple-400" /> Analysis Stats
              </h3>
            </div>
            <div className="p-5 space-y-4">
              {[
                { label: 'Completed', count: done, color: 'bg-emerald-500', cls: 'text-emerald-400' },
                { label: 'Pending', count: pending, color: 'bg-yellow-500', cls: 'text-yellow-400' },
                { label: 'Failed', count: failed, color: 'bg-red-500', cls: 'text-red-400' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className={`text-xs font-medium w-20 ${item.cls}`}>{item.label}</span>
                  <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    {submissions.length > 0 && <div className={`h-full ${item.color} rounded-full`} style={{ width: `${(item.count / submissions.length) * 100}%` }} />}
                  </div>
                  <span className="text-sm font-semibold text-white w-8 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-5 border-b border-white/[0.06]">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Users size={15} className="text-brand-400" /> User Management
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3 uppercase tracking-wider">User</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3 uppercase tracking-wider">Role</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3 uppercase tracking-wider hidden md:table-cell">Joined</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-brand-600/20 flex items-center justify-center text-xs text-brand-400 font-medium shrink-0">
                          {user.name[0]}
                        </div>
                        <div>
                          <div className="text-white font-medium">{user.name}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium ${
                          user.role === 'ADMIN'
                            ? 'bg-red-500/15 text-red-400'
                            : user.role === 'TEACHER'
                              ? 'bg-purple-500/15 text-purple-400'
                              : 'bg-brand-500/15 text-brand-400'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-slate-400 text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-xs text-emerald-400">Active</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
