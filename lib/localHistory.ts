export interface StoredHistoryItem {
  id: string
  reportId: string
  title: string
  languageName: string
  userName?: string
  status: string
  qualityScore: number | null
  totalBugs: number
  createdAt: string
}

export interface StoredReportPayload {
  id: string
  submissionId: string
  totalBugs: number
  qualityScore: number
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  infoCount: number
  createdAt: string
  submission: {
    title: string
    code: string
    language: { name: string }
    createdAt: string
  }
  bugRecords: any[]
}

const HISTORY_KEY = 'codeguard_history'
const REPORT_KEY_PREFIX = 'codeguard_report_'

export function getLocalHistory(): StoredHistoryItem[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function getLocalReport(reportId: string): StoredReportPayload | null {
  if (typeof window === 'undefined' || !reportId) return null

  try {
    const raw = window.localStorage.getItem(`${REPORT_KEY_PREFIX}${reportId}`)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveLocalReport(report: StoredReportPayload) {
  if (typeof window === 'undefined' || !report?.id) return

  const item: StoredHistoryItem = {
    id: report.submissionId,
    reportId: report.id,
    title: report.submission?.title || 'Untitled',
    languageName: report.submission?.language?.name || 'Unknown',
    status: 'DONE',
    qualityScore: report.qualityScore ?? null,
    totalBugs: report.totalBugs ?? 0,
    createdAt: report.submission?.createdAt || report.createdAt || new Date().toISOString(),
  }

  const current = getLocalHistory()
  const next = [item, ...current.filter((entry) => entry.reportId !== item.reportId)].slice(0, 50)

  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
  window.localStorage.setItem(`${REPORT_KEY_PREFIX}${report.id}`, JSON.stringify(report))
}
