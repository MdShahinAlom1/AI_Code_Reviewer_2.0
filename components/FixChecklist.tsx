'use client'

import { CheckCircle } from 'lucide-react'
import { useState } from 'react'
import SeverityBadge, { type Severity } from './SeverityBadge'

interface Item {
  id: string
  title: string
  severity: Severity
}

export default function FixChecklist({ items }: { items: Item[] }) {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const checkedCount = items.filter((item) => checked.has(item.id)).length
  const progress = items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (items.length === 0) return null

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-white flex items-center gap-2">
          <CheckCircle size={15} className="text-emerald-400" />
          Fix Checklist ({checkedCount}/{items.length})
        </div>
        <div className="text-xs text-slate-500">{progress}% done</div>
      </div>

      <div className="w-full h-1.5 bg-white/[0.06] rounded-full mb-3">
        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {items.map((item) => (
          <label key={item.id} className="flex items-center gap-2.5 cursor-pointer hover:bg-white/[0.03] px-2 py-1 rounded">
            <input
              type="checkbox"
              checked={checked.has(item.id)}
              onChange={() => toggle(item.id)}
              className="accent-emerald-500 w-3.5 h-3.5"
            />
            <span className={`text-xs flex-1 ${checked.has(item.id) ? 'line-through text-slate-600' : 'text-slate-300'}`}>
              {item.title}
            </span>
            <SeverityBadge severity={item.severity} />
          </label>
        ))}
      </div>
    </div>
  )
}
