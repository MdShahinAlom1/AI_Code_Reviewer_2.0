'use client'

import { useState } from 'react'
import { AlertCircle, BookOpen, ChevronDown, ChevronUp, Code, Lightbulb, ThumbsDown, ThumbsUp } from 'lucide-react'
import SeverityBadge, { type Severity } from './SeverityBadge'

export interface BugRecordView {
  id: string
  title: string
  line: number | null
  severity: Severity
  category: string
  whyItMatters: string
  beginnerExplanation: string
  expertExplanation: string
  howToFix: string
  beforeCode?: string | null
  afterCode?: string | null
  learningTopic?: string | null
  feedback?: string | null
}

interface Props {
  bug: BugRecordView
  mode: 'beginner' | 'expert'
  index: number
}

export default function BugCard({ bug, mode, index }: Props) {
  const [expanded, setExpanded] = useState(index === 0)
  const [feedback, setFeedback] = useState(bug.feedback || '')
  const [submitting, setSubmitting] = useState(false)

  const severityBg: Record<Severity, string> = {
    CRITICAL: 'border-red-500/30 bg-red-500/[0.03]',
    HIGH: 'border-orange-500/30 bg-orange-500/[0.03]',
    MEDIUM: 'border-yellow-500/30 bg-yellow-500/[0.03]',
    LOW: 'border-blue-500/30 bg-blue-500/[0.03]',
    INFO: 'border-slate-500/30 bg-slate-500/[0.03]',
  }

  const sendFeedback = async (value: string) => {
    if (submitting) return
    setSubmitting(true)
    setFeedback(value)

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bugRecordId: bug.id, feedback: value }),
      })

      if (!res.ok) setFeedback('')
    } finally {
      setSubmitting(false)
    }
  }

  const hasFixCode = Boolean(bug.beforeCode || bug.afterCode)

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${severityBg[bug.severity]}`}>
      <button className="w-full text-left p-4 flex items-start gap-3" onClick={() => setExpanded(!expanded)}>
        <div className="mt-0.5">
          <SeverityBadge severity={bug.severity} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-white">{bug.title}</span>
            {bug.line && (
              <span className="text-xs text-slate-500 code-font bg-white/[0.05] px-1.5 py-0.5 rounded">
                Line {bug.line}
              </span>
            )}
            <span className="text-xs text-slate-600">{bug.category}</span>
          </div>
          <p className="text-sm text-slate-400 mt-0.5 line-clamp-1">{bug.whyItMatters}</p>
        </div>
        <div className="text-slate-500 mt-0.5 shrink-0">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/[0.06] p-4 space-y-4">
          <div className="flex gap-3">
            <AlertCircle size={16} className="text-brand-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Why It Matters</div>
              <p className="text-sm text-slate-300">{bug.whyItMatters}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Lightbulb size={16} className="text-yellow-400 mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                {mode === 'beginner' ? 'Plain English Explanation' : 'Technical Analysis'}
              </div>
              <p className="text-sm text-slate-300">
                {mode === 'beginner' ? bug.beginnerExplanation : bug.expertExplanation}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Code size={16} className="text-emerald-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">How To Fix</div>
              <p className="text-sm text-slate-300 mb-3">{bug.howToFix}</p>

              {hasFixCode && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-red-400 font-medium mb-1.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Before
                    </div>
                    <pre className="code-font text-xs bg-red-500/[0.06] border border-red-500/20 rounded-lg p-3 overflow-x-auto text-slate-300 leading-relaxed">
                      {bug.beforeCode || 'No exact line available'}
                    </pre>
                  </div>
                  <div>
                    <div className="text-xs text-emerald-400 font-medium mb-1.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> After
                    </div>
                    <pre className="code-font text-xs bg-emerald-500/[0.06] border border-emerald-500/20 rounded-lg p-3 overflow-x-auto text-slate-300 leading-relaxed">
                      {bug.afterCode || 'Apply the suggested fix in your code.'}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {bug.learningTopic && (
            <div className="flex items-center gap-3 bg-brand-600/10 border border-brand-600/20 rounded-lg px-3 py-2">
              <BookOpen size={14} className="text-brand-400 shrink-0" />
              <span className="text-xs text-slate-300">
                Learn more: <span className="text-brand-400 font-medium">{bug.learningTopic}</span>
              </span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06] flex-wrap">
            <span className="text-xs text-slate-500">Was this helpful?</span>
            {[
              { key: 'HELPFUL', icon: <ThumbsUp size={13} />, label: 'Helpful', color: 'text-emerald-400 border-emerald-500/40' },
              { key: 'CONFUSING', icon: <ThumbsDown size={13} />, label: 'Confusing', color: 'text-yellow-400 border-yellow-500/40' },
              { key: 'FALSE_POSITIVE', icon: <AlertCircle size={13} />, label: 'False Positive', color: 'text-slate-400 border-slate-500/40' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => sendFeedback(item.key)}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  feedback === item.key
                    ? `${item.color} bg-white/[0.06]`
                    : 'text-slate-500 border-white/[0.08] hover:border-white/20'
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
