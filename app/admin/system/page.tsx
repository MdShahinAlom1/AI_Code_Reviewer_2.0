import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { Activity, Archive, BarChart3, BrainCircuit, Database, HardDrive, Server, ShieldCheck, UsersRound } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import Navbar from '@/components/Navbar'
import DashboardCard from '@/components/DashboardCard'

export default async function AdminSystemPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/dashboard')

  const [users, classes, assignments, submissions, bugs] = await Promise.all([
    prisma.user.count(),
    prisma.class.count(),
    prisma.assignment.count(),
    prisma.submission.count(),
    prisma.bugRecord.count(),
  ])

  const modules = [
    { name: 'Authentication', status: 'Online', icon: ShieldCheck, note: 'Student, Teacher, Admin role routing enabled' },
    { name: 'AI Review Engine', status: 'Online', icon: BrainCircuit, note: 'Readability, complexity, duplicate code, bug detection rules active' },
    { name: 'SQLite Runtime', status: 'Online', icon: Database, note: 'Local/Vercel demo persistence with browser fallback' },
    { name: 'Backup Management', status: 'Ready', icon: Archive, note: 'Export results and browser saved exam data available' },
  ]

  return (
    <div className="min-h-screen bg-[#0a0d14]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">System Monitoring</h1>
          <p className="text-sm text-slate-400 mt-1">Admin overview for lab, role, AI usage, logs, and backup management.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <DashboardCard title="Users" value={users} icon={UsersRound} iconColor="text-brand-400" />
          <DashboardCard title="Courses" value={classes} icon={Server} iconColor="text-purple-400" />
          <DashboardCard title="Lab Exams" value={assignments} icon={HardDrive} iconColor="text-orange-400" />
          <DashboardCard title="AI Analyses" value={submissions} icon={BrainCircuit} iconColor="text-emerald-400" />
          <DashboardCard title="Detected Issues" value={bugs} icon={BarChart3} iconColor="text-red-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((item) => {
            const Icon = item.icon
            return <div key={item.name} className="card p-5 flex gap-4"><div className="w-10 h-10 rounded-xl bg-brand-600/10 flex items-center justify-center"><Icon size={18} className="text-brand-400" /></div><div><div className="flex items-center gap-2"><h2 className="font-semibold text-white">{item.name}</h2><span className="text-xs bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded">{item.status}</span></div><p className="text-sm text-slate-400 mt-1">{item.note}</p></div></div>
          })}
        </div>
        <div className="card p-5 mt-6">
          <h2 className="font-semibold text-white flex items-center gap-2 mb-3"><Activity size={16} className="text-brand-400" /> Dashboard Analytics</h2>
          <p className="text-sm text-slate-400">Use this panel to monitor AI usage statistics, active users, course/lab growth, system status, and backup/export readiness.</p>
        </div>
      </main>
    </div>
  )
}
