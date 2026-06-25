export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'

export default function SeverityBadge({ severity }: { severity: Severity }) {
  const map: Record<Severity, string> = {
    CRITICAL: 'badge-critical',
    HIGH: 'badge-high',
    MEDIUM: 'badge-medium',
    LOW: 'badge-low',
    INFO: 'badge-info',
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${map[severity]}`}>
      {severity}
    </span>
  )
}
