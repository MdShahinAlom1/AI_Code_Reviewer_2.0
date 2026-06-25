import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { Clock, FileText } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import Navbar from '@/components/Navbar'

export default async function AdminLogsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  const [users, submissions, notifications] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    prisma.submission.findMany({ include: { user: true, language: true }, orderBy: { createdAt: 'desc' }, take: 20 }),
    prisma.notification.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' }, take: 20 }),
  ])

  const logs = [
    ...users.map((u) => ({ time: u.createdAt, type: 'USER', text: `${u.name} registered as ${u.role}` })),
    ...submissions.map((s) => ({ time: s.createdAt, type: 'SUBMISSION', text: `${s.user.name} submitted ${s.title} in ${s.language.name}` })),
    ...notifications.map((n) => ({ time: n.createdAt, type: 'AI', text: `${n.title}: ${n.message}` })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 40)

  return (
    <div className="min-h-screen bg-[#0a0d14]">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6"><h1 className="text-2xl font-bold text-white">System Logs</h1><p className="text-sm text-slate-400 mt-1">Audit-style logs for registration, AI usage, submissions, and notifications.</p></div>
        <div className="card divide-y divide-white/[0.04]">
          {logs.map((log, i) => <div key={i} className="p-4 flex gap-3"><div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center"><FileText size={15} className="text-brand-400" /></div><div className="flex-1"><div className="flex items-center gap-2"><span className="text-xs code-font text-brand-400">{log.type}</span><span className="text-xs text-slate-600 flex items-center gap-1"><Clock size={11} />{new Date(log.time).toLocaleString()}</span></div><p className="text-sm text-slate-300 mt-1">{log.text}</p></div></div>)}
          {logs.length === 0 && <div className="p-8 text-center text-slate-400">No logs yet.</div>}
        </div>
      </main>
    </div>
  )
}
