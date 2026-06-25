'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Zap } from 'lucide-react'
import Navbar from '@/components/Navbar'
import CodeEditor from '@/components/CodeEditor'
import { saveLocalReport } from '@/lib/localHistory'

const LANGUAGES = [
  { slug: 'python', name: 'Python' },
  { slug: 'javascript', name: 'JavaScript' },
  { slug: 'c', name: 'C' },
  { slug: 'cpp', name: 'C++' },
  { slug: 'java', name: 'Java' },
]

const SAMPLES: Record<string, { title: string; code: string }> = {
  python: {
    title: 'Python Bug Demo',
    code: `import os

password = "admin123"
api_key = "sk-secret-key-here"

def divide_numbers(a, b):
    result = a / b
    return result

def get_user(user_id):
    query = "SELECT * FROM users WHERE id = " + str(user_id)
    return db.query(query)

print("Starting app...")
os.system("rm -rf /tmp/" + user_id)
print(divide_numbers(10, 0))`,
  },
  javascript: {
    title: 'JavaScript Bug Demo',
    code: `const token = "Bearer secret_token_12345"

async function getUser(id) {
  console.log("Fetching user:", id)
  const query = "SELECT * FROM users WHERE id = " + id
  const data = await db.query(query)
  return data
}

function processItems(items, index) {
  var result = items[index]
  while (true) {
    if (result) break
  }
  return eval(result.code)
}`,
  },
  java: {
    title: 'Java Bug Demo',
    code: `import java.sql.*;

public class UserService {
    private String dbPassword = "password123";

    public String getUser(String userId) {
        String query = "SELECT * FROM users WHERE id = " + userId;
        return executeQuery(query);
    }

    public int divide(int a, int b) {
        return a / b;
    }

    public void processData(String[] items, int index) {
        String item = items[index];
        Runtime.getRuntime().exec("process " + item);
    }
}`,
  },
  c: {
    title: 'C Bug Demo',
    code: `#include <stdio.h>
#include <stdlib.h>

const char* SECRET = "admin_pass_123";

int divide(int a, int b) {
    return a / b;
}

void processInput(char* input) {
    system(input);
    printf("Debug: processing %s\\n", input);
}

int main() {
    int arr[5] = {1, 2, 3, 4, 5};
    printf("%d\\n", arr[10]);
    printf("%d\\n", divide(10, 0));
    return 0;
}`,
  },
  cpp: {
    title: 'C++ Bug Demo',
    code: `#include <iostream>
#include <vector>
using namespace std;

string apiKey = "secret_api_key_here";

int divide(int a, int b) {
    return a / b;
}

void processData(vector<int>& data, int index) {
    cout << "Debug: index = " << index << endl;
    int val = data[index];
    system("process_data");
}

int main() {
    vector<int> v = {1, 2, 3};
    processData(v, 10);
    cout << divide(5, 0) << endl;
    return 0;
}`,
  },
}

export default function SubmitPage() {
  const router = useRouter()
  const { status } = useSession()
  const [code, setCode] = useState('')
  const [title, setTitle] = useState('')
  const [lang, setLang] = useState('python')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  const loadSample = () => {
    const sample = SAMPLES[lang]
    if (!sample) return
    setCode(sample.code)
    setTitle(sample.title)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!code.trim()) {
      setError('Please enter some code to analyze.')
      return
    }

    setLoading(true)
    setError('')

    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, languageSlug: lang, title: title || 'Untitled' }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Analysis failed. Please try again.')
      setLoading(false)
      return
    }

    const data = await res.json()

    if (data.report) {
      saveLocalReport(data.report)
    }

    router.push(`/reports/${data.reportId}`)
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center text-slate-400">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0d14]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Analyze Code</h1>
          <p className="text-slate-400 text-sm mt-0.5">Paste your code below to detect bugs and get a quality score.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Submission title (optional)"
              className="input flex-1 min-w-[200px]"
            />

            <div className="relative">
              <select value={lang} onChange={(e) => setLang(e.target.value)} className="input pr-8 appearance-none">
                {LANGUAGES.map((language) => (
                  <option key={language.slug} value={language.slug}>
                    {language.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>

            <button type="button" onClick={loadSample} className="btn-secondary text-sm">
              Try Sample Code
            </button>
          </div>

          <CodeEditor
            value={code}
            onChange={setCode}
            language={lang}
            placeholder={`Paste your ${LANGUAGES.find((language) => language.slug === lang)?.name} code here...`}
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-xs text-slate-500">Analysis uses custom pattern-based rules. Results are for educational purposes.</p>
            <button type="submit" disabled={loading || !code.trim()} className="btn-primary flex items-center gap-2 px-6">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing…
                </>
              ) : (
                <>
                  <Zap size={16} /> Analyze Code
                </>
              )}
            </button>
          </div>
        </form>

        <div className="card p-5 mt-8">
          <h3 className="text-sm font-semibold text-white mb-3">What We Detect</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              'Division by zero',
              'Hardcoded passwords',
              'SQL injection',
              'Dangerous exec calls',
              'Infinite loops',
              'Debug statements',
              'Missing error handling',
              'Unsafe array access',
              'Code quality issues',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
