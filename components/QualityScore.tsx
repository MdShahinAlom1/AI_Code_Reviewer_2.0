interface Props {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export default function QualityScore({ score, size = 'md', showLabel = true }: Props) {
  const safeScore = Math.max(0, Math.min(100, score))

  const getColor = (s: number) => {
    if (s >= 90) return '#22c55e'
    if (s >= 75) return '#84cc16'
    if (s >= 60) return '#eab308'
    if (s >= 40) return '#f97316'
    return '#ef4444'
  }

  const getLabel = (s: number) => {
    if (s >= 90) return 'Excellent'
    if (s >= 75) return 'Good'
    if (s >= 60) return 'Fair'
    if (s >= 40) return 'Poor'
    return 'Critical'
  }

  const color = getColor(safeScore)
  const r = size === 'lg' ? 52 : size === 'md' ? 40 : 28
  const stroke = size === 'lg' ? 6 : 5
  const circumference = 2 * Math.PI * r
  const offset = circumference - (safeScore / 100) * circumference
  const svgSize = (r + stroke) * 2 + 4
  const textSize = size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-sm'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg width={svgSize} height={svgSize} className="-rotate-90">
          <circle cx={svgSize / 2} cy={svgSize / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${textSize}`} style={{ color }}>
            {safeScore}
          </span>
        </div>
      </div>
      {showLabel && <span className="text-xs text-slate-400 font-medium">{getLabel(safeScore)}</span>}
    </div>
  )
}
