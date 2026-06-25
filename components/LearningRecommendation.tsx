import { BookOpen } from 'lucide-react'
import type { Recommendation } from '@/lib/recommendations'

export default function LearningRecommendation({ recommendations }: { recommendations: Recommendation[] }) {
  if (recommendations.length === 0) return null

  const badgeClass = {
    high: 'bg-red-500/15 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    low: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  }

  return (
    <div className="card p-5">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <BookOpen size={15} className="text-brand-400" />
        Learning Recommendations
      </h3>
      <div className="space-y-3">
        {recommendations.slice(0, 4).map((rec) => (
          <div key={rec.topic} className="border border-white/[0.06] rounded-lg p-3 bg-white/[0.02]">
            <div className="flex items-center justify-between gap-3 mb-1">
              <div className="text-sm font-medium text-white">{rec.topic}</div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase ${badgeClass[rec.priority]}`}>
                {rec.priority}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-2">{rec.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {rec.resources.map((resource) => (
                <span key={resource} className="text-[10px] bg-white/[0.05] text-slate-400 rounded px-2 py-0.5">
                  {resource}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
