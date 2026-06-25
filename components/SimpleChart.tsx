'use client'

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface DataPoint {
  label: string
  score: number
}

interface Props {
  data: DataPoint[]
}

export default function SimpleChart({ data }: Props) {
  if (data.length < 2) {
    return (
      <div className="h-32 flex items-center justify-center text-sm text-slate-500">
        Submit at least 2 analyses to see trend
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={140}>
      <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#475569' }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#475569' }} />
        <Tooltip
          contentStyle={{ background: '#0f1420', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#94a3b8' }}
          itemStyle={{ color: '#33b2ff' }}
        />
        <Line type="monotone" dataKey="score" stroke="#33b2ff" strokeWidth={2} dot={{ fill: '#33b2ff', r: 3 }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
