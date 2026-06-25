'use client'

import type React from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
  language: string
  placeholder?: string
  readOnly?: boolean
}

export default function CodeEditor({ value, onChange, language, placeholder, readOnly }: Props) {
  const handleTab = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Tab' || readOnly) return

    e.preventDefault()
    const el = e.currentTarget
    const start = el.selectionStart
    const end = el.selectionEnd
    const newValue = value.substring(0, start) + '  ' + value.substring(end)
    onChange(newValue)
    setTimeout(() => el.setSelectionRange(start + 2, start + 2), 0)
  }

  const lines = (value || '').split('\n')

  return (
    <div className="relative rounded-xl overflow-hidden border border-white/[0.08] bg-[#0a0d14]">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/[0.06] bg-[#0f1420]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
        </div>
        <span className="text-xs text-slate-500 code-font ml-2">{language || 'code'}</span>
        <span className="ml-auto text-xs text-slate-600">{lines.length} lines</span>
      </div>

      <div className="flex">
        <div className="select-none border-r border-white/[0.05] text-right py-4 pr-3 pl-4 min-w-[3rem] bg-[#080b11]">
          {lines.map((_, i) => (
            <div key={i} className="text-slate-700 text-xs code-font leading-6">
              {i + 1}
            </div>
          ))}
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleTab}
          readOnly={readOnly}
          placeholder={placeholder}
          spellCheck={false}
          className="flex-1 bg-transparent code-font text-sm text-slate-300 leading-6 p-4 resize-y focus:outline-none placeholder-slate-700 min-h-[360px]"
          style={{ tabSize: 2 }}
        />
      </div>
    </div>
  )
}
