'use client'

import type React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Save, Send, TestTube2 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import CodeEditor from '@/components/CodeEditor'
import { getLabExams, saveExamSubmission } from '@/lib/examStore'

function scoreCode(code: string) {
  let score = 100
  const feedback: string[] = []
  if (code.length < 80) { score -= 20; feedback.push('Solution looks too short. Add complete logic and edge cases.') }
  if (/while\s*\(\s*true\s*\)/i.test(code)) { score -= 20; feedback.push('Possible infinite loop detected.') }
  if (/\[\s*(i|idx|index|\d+)\s*\]/i.test(code) && !/(length|size\s*\(|bounds|<\s*\w+\.size|<\s*n)/i.test(code)) { score -= 10; feedback.push('Array access should be protected by bounds checks.') }
  if (/(console\.log|printf|cout\s*<<|System\.out\.println|print\s*\()/i.test(code)) feedback.push('Debug/output statements found. Make sure final output format matches test cases.')
  if (!/(return|cout|printf|System\.out|print)/i.test(code)) { score -= 10; feedback.push('No clear return/output statement found.') }
  if (!/function|def|int\s+main|public\s+class|class\s+|void\s+|int\s+/.test(code)) { score -= 10; feedback.push('Add modular functions/classes where possible.') }
  return { score: Math.max(0, Math.min(100, score)), feedback: feedback.length ? feedback : ['Good structure. Check hidden test cases and edge cases before final submission.'] }
}

export default function ExamStartPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { data: session, status } = useSession()
  const exam = useMemo(() => getLabExams().find((item) => item.id === params.id), [params.id])
  const draftKey = `codeguard_exam_draft_${params.id}`
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [ai, setAi] = useState<{ score: number; feedback: string[] } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (!exam) return
    const saved = localStorage.getItem(draftKey)
    setCode(saved || exam.questions.map((q) => `${q.starterCode}\n\n`).join('\n'))
  }, [draftKey, exam])

  useEffect(() => {
    if (!code) return
    const t = setTimeout(() => {
      localStorage.setItem(draftKey, code)
      setMessage('Auto-saved')
    }, 700)
    return () => clearTimeout(t)
  }, [code, draftKey])

  if (status === 'loading') return <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center text-slate-400">Loading...</div>
  if (!exam) return <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center text-slate-400">Exam not found</div>

  const closed = new Date(exam.deadline).getTime() < Date.now()

  const runAi = () => {
    const result = scoreCode(code)
    setAi(result)
    setMessage('AI assistance completed')
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (closed) { setMessage('Deadline is over. Submission is disabled.'); return }
    const result = ai || scoreCode(code)
    const previous = JSON.parse(localStorage.getItem('codeguard_exam_submissions_v2') || '[]').filter((s: any) => s.examId === exam.id)
    saveExamSubmission({
      id: `sub-${Date.now()}`,
      examId: exam.id,
      examTitle: exam.title,
      studentName: session?.user?.name || 'Student',
      language: exam.language,
      code,
      submittedAt: new Date().toISOString(),
      attempt: previous.length + 1,
      aiScore: result.score,
      plagiarismRisk: code.length < 120 ? 'MEDIUM' : 'LOW',
      feedback: result.feedback,
    })
    setAi(result)
    setMessage('Submitted successfully. You can submit again until the deadline.')
  }

  return (
    <div className="min-h-screen bg-[#0a0d14]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="mb-5">
              <p className="text-xs text-brand-400 font-semibold code-font">{exam.courseCode}</p>
              <h1 className="text-2xl font-bold text-white">{exam.title}</h1>
              <p className="text-sm text-slate-400 mt-1">Deadline: {new Date(exam.deadline).toLocaleString()}</p>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <CodeEditor value={code} onChange={setCode} language={exam.language} />
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => localStorage.setItem(draftKey, code)} className="btn-secondary flex items-center gap-2"><Save size={15} /> Save draft</button>
                <button type="button" onClick={runAi} className="btn-secondary flex items-center gap-2"><TestTube2 size={15} /> Run AI feedback</button>
                <button disabled={closed} className="btn-primary flex items-center gap-2 disabled:opacity-50"><Send size={15} /> Submit attempt</button>
                <span className="text-xs text-slate-500">{message}</span>
              </div>
            </form>
          </div>
          <aside className="space-y-4">
            <div className="card p-5">
              <h2 className="font-semibold text-white mb-3">Questions</h2>
              <div className="space-y-4">
                {exam.questions.map((q, i) => (
                  <div key={q.id} className="border-b border-white/[0.06] pb-3 last:border-0">
                    <div className="text-sm font-semibold text-white">{i + 1}. {q.title} <span className="text-xs text-slate-500">({q.marks} marks)</span></div>
                    <p className="text-xs text-slate-400 mt-1">{q.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-5">
              <h2 className="font-semibold text-white mb-3">Visible Test Cases</h2>
              {exam.testCases.filter((t) => !t.hidden).map((t, i) => (
                <div key={i} className="text-xs code-font bg-white/[0.03] p-3 rounded-lg mb-2 text-slate-300">
                  <div>Input: {t.input}</div><div>Expected: {t.expectedOutput}</div>
                </div>
              ))}
            </div>
            {ai && <div className="card p-5"><h2 className="font-semibold text-white mb-2">AI Feedback: {ai.score}/100</h2><ul className="space-y-2">{ai.feedback.map((f) => <li key={f} className="text-sm text-slate-400">• {f}</li>)}</ul></div>}
          </aside>
        </div>
      </main>
    </div>
  )
}
