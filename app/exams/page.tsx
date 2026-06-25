'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { CalendarClock, Code2, FileText, Play, Search } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { getExamSubmissions, getLabExams, type LabExam } from '@/lib/examStore'

export default function ExamsPage() {
  const router = useRouter()
  const { status } = useSession()
  const [exams, setExams] = useState<LabExam[]>([])
  const [query, setQuery] = useState('')
  const [joined, setJoined] = useState<string[]>([])
  const submissions = getExamSubmissions()

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    setExams(getLabExams().filter((exam) => exam.published))
    setJoined(JSON.parse(localStorage.getItem('codeguard_joined_exams') || '[]'))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return exams.filter((exam) => !q || exam.title.toLowerCase().includes(q) || exam.courseCode.toLowerCase().includes(q))
  }, [exams, query])

  const joinExam = (id: string) => {
    const updated = Array.from(new Set([...joined, id]))
    setJoined(updated)
    localStorage.setItem('codeguard_joined_exams', JSON.stringify(updated))
  }

  if (status === 'loading') return <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center text-slate-400">Loading...</div>

  return (
    <div className="min-h-screen bg-[#0a0d14]">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Lab Exams</h1>
            <p className="text-slate-400 text-sm mt-0.5">Join upcoming exams, start coding, auto-save drafts, and submit until the deadline.</p>
          </div>
          <Link href="/history" className="btn-secondary text-sm">Previous submissions</Link>
        </div>

        <div className="card p-4 mb-6 flex items-center gap-3">
          <Search size={16} className="text-slate-500" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} className="bg-transparent outline-none text-sm text-slate-200 flex-1" placeholder="Search by exam title or course code" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((exam) => {
            const isJoined = joined.includes(exam.id)
            const attempts = submissions.filter((s) => s.examId === exam.id).length
            const closed = new Date(exam.deadline).getTime() < Date.now()
            return (
              <div key={exam.id} className="card p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="text-xs text-brand-400 font-semibold code-font mb-1">{exam.courseCode}</div>
                    <h2 className="text-lg font-bold text-white">{exam.title}</h2>
                    <p className="text-sm text-slate-400 mt-1">{exam.description}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${closed ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>{closed ? 'Closed' : 'Open'}</span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="rounded-lg bg-white/[0.03] p-3">
                    <FileText size={14} className="text-purple-400 mb-1" />
                    <div className="text-white font-semibold">{exam.questions.length}</div>
                    <div className="text-xs text-slate-500">Questions</div>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] p-3">
                    <Code2 size={14} className="text-brand-400 mb-1" />
                    <div className="text-white font-semibold uppercase">{exam.language}</div>
                    <div className="text-xs text-slate-500">Language</div>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] p-3">
                    <CalendarClock size={14} className="text-orange-400 mb-1" />
                    <div className="text-white font-semibold">{attempts}</div>
                    <div className="text-xs text-slate-500">Attempts</div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mb-4">Deadline: {new Date(exam.deadline).toLocaleString()}</p>
                {isJoined ? (
                  <Link href={`/exams/${exam.id}`} className={`btn-primary inline-flex items-center gap-2 ${closed ? 'pointer-events-none opacity-50' : ''}`}><Play size={15} /> Start exam</Link>
                ) : (
                  <button onClick={() => joinExam(exam.id)} className="btn-secondary">Join lab exam</button>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
