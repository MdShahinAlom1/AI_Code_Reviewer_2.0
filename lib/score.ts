import type { BugRecord } from './analyzer'

export interface ScoreBreakdown {
  score: number
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  infoCount: number
  totalBugs: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  label: string
  color: string
}

export function calculateScore(bugs: BugRecord[]): ScoreBreakdown {
  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 }

  for (const bug of bugs) {
    counts[bug.severity]++
  }

  const deduction =
    counts.CRITICAL * 20 +
    counts.HIGH * 10 +
    counts.MEDIUM * 5 +
    counts.LOW * 2 +
    counts.INFO * 1

  const score = Math.max(0, Math.min(100, 100 - deduction))

  let grade: ScoreBreakdown['grade']
  let label: string
  let color: string

  if (score >= 90) {
    grade = 'A'
    label = 'Excellent'
    color = '#22c55e'
  } else if (score >= 75) {
    grade = 'B'
    label = 'Good'
    color = '#84cc16'
  } else if (score >= 60) {
    grade = 'C'
    label = 'Fair'
    color = '#eab308'
  } else if (score >= 40) {
    grade = 'D'
    label = 'Poor'
    color = '#f97316'
  } else {
    grade = 'F'
    label = 'Critical'
    color = '#ef4444'
  }

  return {
    score,
    criticalCount: counts.CRITICAL,
    highCount: counts.HIGH,
    mediumCount: counts.MEDIUM,
    lowCount: counts.LOW,
    infoCount: counts.INFO,
    totalBugs: bugs.length,
    grade,
    label,
    color,
  }
}
