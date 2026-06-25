'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CalendarPlus, Plus, Trash2 } from 'lucide-react'
import Navbar from '@/components/Navbar'
import { addLabExam, getLabExams, type LabExam, type LabQuestion, type TestCase } from '@/lib/examStore'

const blankQuestion = (): LabQuestion => ({ id: `q-${Date.now()}`, title: '', description: '', starterCode: '', marks: 10 })
const blankTest = (): TestCase => ({ input: '', expectedOutput: '', hidden: false })

export default function TeacherExamsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [exams, setExams] = useState<LabExam[]>([])
  const [form, setForm] = useState({ courseName: 'Programming Lab', courseCode: 'CSE-101', title: '', description: '', language: 'cpp', deadline: '' })
  const [questions, setQuestions] = useState<LabQuestion[]>([blankQuestion()])
  const [testCases, setTestCases] = useState<TestCase[]>([blankTest()])
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated' && session?.user?.role !== 'TEACHER') router.push('/dashboard')
  }, [status, session, router])

  useEffect(() => setExams(getLabExams()), [])

  const createExam = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanQuestions = questions.filter((q) => q.title.trim() && q.description.trim())
    const cleanTests = testCases.filter((t) => t.input.trim() || t.expectedOutput.trim())
    if (!form.title.trim() || cleanQuestions.length === 0 || !form.deadline) {
      setMessage('Please add title, deadline, and at least one complete question.')
      return
    }
    const exam: LabExam = {
      id: `exam-${Date.now()}`,
      courseName: form.courseName,
      courseCode: form.courseCode,
      title: form.title,
      description: form.description,
      language: form.language,
      deadline: new Date(form.deadline).toISOString(),
      questions: cleanQuestions,
      testCases: cleanTests,
      createdAt: new Date().toISOString(),
      published: true,
    }
    addLabExam(exam)
    setExams(getLabExams())
    setForm({ courseName: 'Programming Lab', courseCode: 'CSE-101', title: '', description: '', language: 'cpp', deadline: '' })
    setQuestions([blankQuestion()])
    setTestCases([blankTest()])
    setMessage('Exam created and published successfully.')
  }

  if (status === 'loading') return <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center text-slate-400">Loading...</div>

  return (
    <div className="min-h-screen bg-[#0a0d14]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Create Programming Lab Exam</h1>
          <p className="text-slate-400 text-sm mt-0.5">Create courses, lab exams, deadlines, programming questions, and test cases.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={createExam} className="lg:col-span-2 card p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="input" placeholder="Course name" value={form.courseName} onChange={(e) => setForm({ ...form, courseName: e.target.value })} />
              <input className="input" placeholder="Course code" value={form.courseCode} onChange={(e) => setForm({ ...form, courseCode: e.target.value })} />
              <input className="input" placeholder="Exam title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <select className="input" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
                <option value="cpp">C++</option><option value="c">C</option><option value="python">Python</option><option value="java">Java</option><option value="javascript">JavaScript</option>
              </select>
              <input className="input md:col-span-2" type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
              <textarea className="input md:col-span-2 min-h-[90px]" placeholder="Exam instructions" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between"><h2 className="font-semibold text-white">Questions</h2><button type="button" onClick={() => setQuestions([...questions, blankQuestion()])} className="btn-secondary text-xs flex items-center gap-1"><Plus size={13} /> Add question</button></div>
              {questions.map((q, index) => (
                <div key={q.id} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-3">
                  <div className="flex gap-2"><input className="input flex-1" placeholder={`Question ${index + 1} title`} value={q.title} onChange={(e) => setQuestions(questions.map((item) => item.id === q.id ? { ...item, title: e.target.value } : item))} /><input className="input w-24" type="number" value={q.marks} onChange={(e) => setQuestions(questions.map((item) => item.id === q.id ? { ...item, marks: Number(e.target.value) } : item))} /></div>
                  <textarea className="input w-full min-h-[80px]" placeholder="Problem statement" value={q.description} onChange={(e) => setQuestions(questions.map((item) => item.id === q.id ? { ...item, description: e.target.value } : item))} />
                  <textarea className="input w-full min-h-[90px] code-font" placeholder="Starter code" value={q.starterCode} onChange={(e) => setQuestions(questions.map((item) => item.id === q.id ? { ...item, starterCode: e.target.value } : item))} />
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between"><h2 className="font-semibold text-white">Test Cases</h2><button type="button" onClick={() => setTestCases([...testCases, blankTest()])} className="btn-secondary text-xs flex items-center gap-1"><Plus size={13} /> Add test case</button></div>
              {testCases.map((t, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2">
                  <textarea className="input code-font" placeholder="Input" value={t.input} onChange={(e) => setTestCases(testCases.map((item, i) => i === index ? { ...item, input: e.target.value } : item))} />
                  <textarea className="input code-font" placeholder="Expected output" value={t.expectedOutput} onChange={(e) => setTestCases(testCases.map((item, i) => i === index ? { ...item, expectedOutput: e.target.value } : item))} />
                  <button type="button" onClick={() => setTestCases(testCases.filter((_, i) => i !== index))} className="btn-ghost px-3"><Trash2 size={15} /></button>
                </div>
              ))}
            </div>

            {message && <div className="text-sm text-brand-400">{message}</div>}
            <button className="btn-primary flex items-center gap-2"><CalendarPlus size={16} /> Publish exam</button>
          </form>

          <aside className="card p-5">
            <h2 className="font-semibold text-white mb-4">Published Exams</h2>
            <div className="space-y-3">
              {exams.map((exam) => <div key={exam.id} className="rounded-lg bg-white/[0.03] p-3"><div className="text-sm font-semibold text-white">{exam.title}</div><div className="text-xs text-slate-500 mt-1">{exam.courseCode} · {exam.questions.length} questions · {new Date(exam.deadline).toLocaleDateString()}</div></div>)}
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
