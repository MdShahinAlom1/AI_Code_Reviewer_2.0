import Link from 'next/link'
import { AlertTriangle, ArrowRight, BarChart3, BookOpen, CheckCircle, Code2, Lock, Shield, Zap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-200">
      <nav className="border-b border-white/[0.06] px-6 h-14 flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center">
            <Shield size={14} className="text-white" />
          </div>
          <span className="font-semibold text-white">
            CodeGuard <span className="text-brand-400">AI</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
            Sign in
          </Link>
          <Link href="/register" className="btn-primary text-sm">
            Get Started
          </Link>
        </div>
      </nav>

      <section className="relative max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-600/10 border border-brand-600/30 text-brand-400 text-xs font-medium mb-8">
          <Zap size={11} /> Academic Software Engineering Project
        </div>

        <h1 className="relative text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
          Find bugs before<br />
          <span className="gradient-text">your users do</span>
        </h1>
        <p className="relative text-xl text-slate-400 max-w-2xl mx-auto mb-10">
          CodeGuard AI analyzes source code for security vulnerabilities, runtime errors, and quality issues — with beginner-friendly explanations and actionable fix suggestions.
        </p>

        <div className="relative flex flex-wrap gap-3 justify-center mb-16">
          <Link href="/register" className="btn-primary flex items-center gap-2 text-base px-6 py-3">
            Analyze Your Code <ArrowRight size={16} />
          </Link>
          <Link href="/login" className="btn-secondary flex items-center gap-2 text-base px-6 py-3">
            Sign In
          </Link>
        </div>

        <div className="relative inline-block card px-6 py-4 text-left max-w-full overflow-x-auto">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-3">Demo Credentials</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { role: 'Student', email: 'student@codeguard.ai' },
              { role: 'Teacher', email: 'teacher@codeguard.ai' },
              { role: 'Admin', email: 'admin@codeguard.ai' },
            ].map((item) => (
              <div key={item.role}>
                <span className="text-xs text-brand-400 font-medium">{item.role}</span>
                <p className="text-xs text-slate-400 code-font mt-0.5">{item.email}</p>
                <p className="text-xs text-slate-600 code-font">password123</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-white text-center mb-12">Everything you need to write safer code</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: AlertTriangle, color: 'text-red-400', title: 'Bug Detection', desc: 'Rule-based detection for common security, runtime, logic, and quality issues.' },
            { icon: BarChart3, color: 'text-brand-400', title: 'Quality Score', desc: 'Each submission gets a 0–100 score based on severity-weighted issue counts.' },
            { icon: BookOpen, color: 'text-purple-400', title: 'Dual Explanations', desc: 'Switch between beginner-friendly explanations and technical analysis.' },
            { icon: Code2, color: 'text-emerald-400', title: 'Before / After Code', desc: 'Side-by-side examples show exactly how each issue can be fixed.' },
            { icon: Lock, color: 'text-orange-400', title: 'Security Analysis', desc: 'Detects SQL injection, hardcoded credentials, dangerous exec calls, and more.' },
            { icon: CheckCircle, color: 'text-yellow-400', title: 'Submission History', desc: 'Track progress over time with history and score trend charts.' },
          ].map((feature) => (
            <div key={feature.title} className="card p-5 hover:border-white/[0.14] transition-colors">
              <div className={`mb-3 ${feature.color}`}>
                <feature.icon size={22} />
              </div>
              <h3 className="font-semibold text-white mb-1.5">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="card p-8">
          <h3 className="text-lg font-bold text-white mb-6 text-center">Severity Levels</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { level: 'Critical', weight: '−20 pts', cls: 'badge-critical' },
              { level: 'High', weight: '−10 pts', cls: 'badge-high' },
              { level: 'Medium', weight: '−5 pts', cls: 'badge-medium' },
              { level: 'Low', weight: '−2 pts', cls: 'badge-low' },
              { level: 'Info', weight: '−1 pt', cls: 'badge-info' },
            ].map((item) => (
              <div key={item.level} className="flex items-center gap-2.5">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${item.cls}`}>
                  {item.level}
                </span>
                <span className="text-xs text-slate-500">{item.weight}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-slate-500 mt-4">
            Quality Score = 100 − (Critical×20 + High×10 + Medium×5 + Low×2 + Info×1)
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-12 text-center">
        <p className="text-sm text-slate-500 mb-4">Supported Languages</p>
        <div className="flex flex-wrap justify-center gap-3">
          {['Python', 'JavaScript', 'C', 'C++', 'Java'].map((lang) => (
            <span key={lang} className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-slate-300 code-font">
              {lang}
            </span>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield size={14} className="text-brand-400" />
          <span className="text-sm font-medium text-slate-400">CodeGuard AI</span>
        </div>
        <p className="text-xs text-slate-600">Academic Software Engineering Project · Built with Next.js, Prisma, SQLite</p>
      </footer>
    </div>
  )
}
