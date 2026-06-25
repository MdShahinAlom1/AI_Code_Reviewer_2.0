export type LabQuestion = {
  id: string
  title: string
  description: string
  starterCode: string
  marks: number
}

export type TestCase = {
  input: string
  expectedOutput: string
  hidden?: boolean
}

export type LabExam = {
  id: string
  courseName: string
  courseCode: string
  title: string
  description: string
  language: string
  deadline: string
  questions: LabQuestion[]
  testCases: TestCase[]
  createdAt: string
  published: boolean
}

export type ExamSubmission = {
  id: string
  examId: string
  examTitle: string
  studentName: string
  language: string
  code: string
  submittedAt: string
  attempt: number
  aiScore: number
  manualGrade?: number
  teacherComment?: string
  plagiarismRisk: 'LOW' | 'MEDIUM' | 'HIGH'
  feedback: string[]
}

const EXAMS_KEY = 'codeguard_lab_exams_v2'
const SUBMISSIONS_KEY = 'codeguard_exam_submissions_v2'

export const defaultExams: LabExam[] = [
  {
    id: 'exam-arrays-101',
    courseName: 'Programming Lab',
    courseCode: 'CSE-101',
    title: 'Array and Loop Lab Exam',
    description: 'Solve array problems and submit clean, readable code before the deadline.',
    language: 'cpp',
    deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    createdAt: new Date().toISOString(),
    published: true,
    questions: [
      {
        id: 'q1',
        title: 'Find maximum value',
        description: 'Read n integers and print the maximum value. Handle empty or invalid input safely.',
        starterCode: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main(){\n  int n; cin >> n;\n  vector<int> a(n);\n  for(int i=0;i<n;i++) cin >> a[i];\n  // write your solution here\n  return 0;\n}',
        marks: 50,
      },
      {
        id: 'q2',
        title: 'Count even numbers',
        description: 'Count how many values in the input array are even.',
        starterCode: '// Add your second solution here',
        marks: 50,
      },
    ],
    testCases: [
      { input: '5\n1 7 3 9 2', expectedOutput: '9' },
      { input: '4\n2 4 6 8', expectedOutput: '4', hidden: true },
    ],
  },
]

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try { return JSON.parse(value) as T } catch { return fallback }
}

export function getLabExams(): LabExam[] {
  if (typeof window === 'undefined') return defaultExams
  const stored = safeParse<LabExam[]>(localStorage.getItem(EXAMS_KEY), [])
  if (stored.length === 0) {
    localStorage.setItem(EXAMS_KEY, JSON.stringify(defaultExams))
    return defaultExams
  }
  return stored
}

export function saveLabExams(exams: LabExam[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(EXAMS_KEY, JSON.stringify(exams))
}

export function addLabExam(exam: LabExam) {
  const exams = getLabExams()
  saveLabExams([exam, ...exams])
}

export function getExamSubmissions(): ExamSubmission[] {
  if (typeof window === 'undefined') return []
  return safeParse<ExamSubmission[]>(localStorage.getItem(SUBMISSIONS_KEY), [])
}

export function saveExamSubmission(submission: ExamSubmission) {
  if (typeof window === 'undefined') return
  const submissions = getExamSubmissions()
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify([submission, ...submissions]))
}

export function updateExamSubmission(id: string, patch: Partial<ExamSubmission>) {
  if (typeof window === 'undefined') return
  const submissions = getExamSubmissions().map((item) => item.id === id ? { ...item, ...patch } : item)
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions))
}

export function exportCsv(rows: Record<string, string | number | undefined>[], filename: string) {
  if (typeof window === 'undefined') return
  const headers = Object.keys(rows[0] || { empty: '' })
  const csv = [headers.join(','), ...rows.map((row) => headers.map((h) => JSON.stringify(row[h] ?? '')).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
