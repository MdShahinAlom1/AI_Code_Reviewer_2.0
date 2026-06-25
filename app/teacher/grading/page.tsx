'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Download, MessageSquare, ShieldAlert, TrendingUp } from 'lucide-react'
import Navbar from '@/components/Navbar'
import CodeEditor from '@/components/CodeEditor'
import { exportCsv, getExamSubmissions, updateExamSubmission, type ExamSubmission } from '@/lib/examStore'

export default function TeacherGradingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [items, setItems] = useState<ExamSubmission[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [grade, setGrade] = useState('')
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated' && session?.user?.role !== 'TEACHER') router.push('/dashboard')
  }, [status, session, router])

  useEffect(() => {
    const data = getExamSubmissions()
    setItems(data)
    if (data[0]) setSelectedId(data[0].id)
  }, [])

  const selected = items.find((item) => item.id === selectedId)
  const avg = useMemo(() => items.length ? Math.round(items.reduce((s, i) => s + (i.manualGrade ?? i.aiScore), 0) / items.length) : 0, [items])
  const plagiarismHigh = items.filter((i) => i.plagiarismRisk === 'HIGH' || i.plagiarismRisk === 'MEDIUM').length

  const saveGrade = () => {
    if (!selected) return
    updateExamSubmission(selected.id, { manualGrade: Number(grade || selected.aiScore), teacherComment: comment })
    const updated = getExamSubmissions()
    setItems(updated)
    setSelectedId(selected.id)
  }

  if (status === 'loading') return <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center text-slate-400">Loading...</div>

  return (
    <div className="min-h-screen bg-[#0a0d14]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Manual Grading & AI Assistance</h1>
            <p className="text-sm text-slate-400 mt-1">Review submissions, AI explanations, plagiarism risk, teacher comments, and published grades.</p>
          </div>
          <button onClick={() => exportCsv(items.map((i) => ({ student: i.studentName, exam: i.examTitle, attempt: i.attempt, aiScore: i.aiScore, manualGrade: i.manualGrade, plagiarism: i.plagiarismRisk })), 'codeguard-results.csv')} className="btn-secondary flex items-center gap-2"><Download size={15} /> Export results</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card p-4"><TrendingUp size={17} className="text-brand-400 mb-2" /><div className="text-2xl font-bold text-white">{avg}</div><div className="text-xs text-slate-500">Average grade</div></div>
          <div className="card p-4"><MessageSquare size={17} className="text-purple-400 mb-2" /><div className="text-2xl font-bold text-white">{items.filter((i) => i.teacherComment).length}</div><div className="text-xs text-slate-500">Teacher comments</div></div>
          <div className="card p-4"><ShieldAlert size={17} className="text-orange-400 mb-2" /><div className="text-2xl font-bold text-white">{plagiarismHigh}</div><div className="text-xs text-slate-500">Plagiarism reports to review</div></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card divide-y divide-white/[0.04]">
            {items.length === 0 ? <div className="p-5 text-sm text-slate-400">No exam submissions yet. Submit once from the student exam page.</div> : items.map((item) => (
              <button key={item.id} onClick={() => { setSelectedId(item.id); setGrade(String(item.manualGrade ?? item.aiScore)); setComment(item.teacherComment || '') }} className={`w-full text-left p-4 hover:bg-white/[0.03] ${selectedId === item.id ? 'bg-brand-600/10' : ''}`}>
                <div className="font-semibold text-white text-sm">{item.studentName}</div>
                <div className="text-xs text-slate-500 mt-1">{item.examTitle} · Attempt {item.attempt}</div>
                <div className="flex gap-2 mt-2"><span className="text-xs text-brand-400">AI {item.aiScore}/100</span><span className={`text-xs ${item.plagiarismRisk === 'LOW' ? 'text-emerald-400' : 'text-orange-400'}`}>{item.plagiarismRisk} plagiarism risk</span></div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2 space-y-4">
            {selected ? (
              <>
                <div className="card p-5">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div><h2 className="text-lg font-bold text-white">{selected.studentName}</h2><p className="text-xs text-slate-500">Submitted {new Date(selected.submittedAt).toLocaleString()}</p></div>
                    <span className="text-sm text-brand-400 font-semibold">AI Score {selected.aiScore}/100</span>
                  </div>
                  <CodeEditor value={selected.code} onChange={() => {}} language={selected.language} readOnly />
                </div>
                <div className="card p-5">
                  <h3 className="font-semibold text-white mb-3">AI grading assistance</h3>
                  <ul className="space-y-2 mb-4">{selected.feedback.map((f) => <li key={f} className="text-sm text-slate-400">• {f}</li>)}</ul>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input className="input" type="number" min="0" max="100" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="Manual grade" />
                    <input className="input" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Teacher comment" />
                  </div>
                  <button onClick={saveGrade} className="btn-primary mt-4">Publish grade/comment</button>
                </div>
              </>
            ) : <div className="card p-8 text-center text-slate-400">Select a submission to review.</div>}
          </div>
        </div>
      </main>
    </div>
  )
}
