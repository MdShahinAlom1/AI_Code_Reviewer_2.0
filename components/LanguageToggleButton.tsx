'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  id: string
  enabled: boolean
}

export default function LanguageToggleButton({ id, enabled }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    try {
      await fetch(`/api/admin/languages/${id}/toggle`, { method: 'POST' })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 text-xs px-2.5 py-1 rounded-full transition-colors disabled:opacity-60 ${
        enabled ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${enabled ? 'bg-emerald-400' : 'bg-red-400'}`} />
      {loading ? 'Updating...' : enabled ? 'Enabled' : 'Disabled'}
    </button>
  )
}
