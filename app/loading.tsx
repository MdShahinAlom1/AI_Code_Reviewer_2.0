export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center text-slate-400">
      <div className="flex items-center gap-3">
        <span className="w-5 h-5 border-2 border-white/20 border-t-brand-500 rounded-full animate-spin" />
        Loading...
      </div>
    </div>
  )
}
