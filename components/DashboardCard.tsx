import type { LucideIcon } from 'lucide-react'

interface Props {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
  trend?: { value: string; positive: boolean }
}

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-brand-400',
  trend,
}: Props) {
  return (
    <div className="card p-5 hover:border-white/[0.12] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg bg-white/[0.05] ${iconColor}`}>
          <Icon size={18} />
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trend.positive ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-0.5 truncate">{value}</div>
      <div className="text-sm text-slate-400">{title}</div>
      {subtitle && <div className="text-xs text-slate-600 mt-1">{subtitle}</div>}
    </div>
  )
}
