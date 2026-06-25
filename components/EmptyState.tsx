import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface Props {
  icon: LucideIcon
  title: string
  description: string
  action?: { label: string; href: string }
}

export default function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
        <Icon size={24} className="text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm max-w-sm">{description}</p>
      {action && (
        <Link href={action.href} className="btn-primary mt-6 text-sm">
          {action.label}
        </Link>
      )}
    </div>
  )
}
