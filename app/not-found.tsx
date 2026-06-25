import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center px-4">
      <div className="card p-8 text-center max-w-md">
        <h1 className="text-3xl font-bold text-white mb-2">404</h1>
        <p className="text-slate-400 text-sm mb-6">The page you are looking for does not exist.</p>
        <Link href="/" className="btn-primary inline-block">
          Back Home
        </Link>
      </div>
    </div>
  )
}
