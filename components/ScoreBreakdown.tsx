interface Props {
  critical: number
  high: number
  medium: number
  low: number
  info: number
}

export default function ScoreBreakdown({ critical, high, medium, low, info }: Props) {
  const items = [
    { label: 'Critical', count: critical, color: 'bg-red-500', textColor: 'text-red-400', weight: 20 },
    { label: 'High', count: high, color: 'bg-orange-500', textColor: 'text-orange-400', weight: 10 },
    { label: 'Medium', count: medium, color: 'bg-yellow-500', textColor: 'text-yellow-400', weight: 5 },
    { label: 'Low', count: low, color: 'bg-blue-500', textColor: 'text-blue-400', weight: 2 },
    { label: 'Info', count: info, color: 'bg-slate-500', textColor: 'text-slate-400', weight: 1 },
  ]

  const total = items.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="space-y-2.5">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className={`text-xs font-semibold w-14 ${item.textColor}`}>{item.label}</span>
          <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            {item.count > 0 && total > 0 && (
              <div
                className={`h-full ${item.color} rounded-full transition-all duration-500`}
                style={{ width: `${(item.count / total) * 100}%` }}
              />
            )}
          </div>
          <span className="text-xs text-slate-400 w-6 text-right">{item.count}</span>
          <span className="text-xs text-slate-600 w-16">−{item.count * item.weight} pts</span>
        </div>
      ))}
    </div>
  )
}
