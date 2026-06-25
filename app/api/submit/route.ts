import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { analyzeCode } from '@/lib/analyzer'
import { calculateScore } from '@/lib/score'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code, languageSlug, title } = await req.json()

    if (!code || !languageSlug) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    if (String(code).length > 50000) {
      return NextResponse.json({ error: 'Code is too large for this demo MVP' }, { status: 400 })
    }

    const language = await prisma.language.findUnique({ where: { slug: languageSlug } })

    if (!language || !language.enabled) {
      return NextResponse.json({ error: 'Language not available' }, { status: 404 })
    }

    const userId = session.user.id

    const submission = await prisma.submission.create({
      data: {
        userId,
        languageId: language.id,
        code: String(code),
        title: title ? String(title).slice(0, 120) : 'Untitled',
        status: 'ANALYZING',
      },
    })

    const bugs = analyzeCode(String(code), String(languageSlug))
    const scoreData = calculateScore(bugs)

    await prisma.submission.update({
      where: { id: submission.id },
      data: {
        status: 'DONE',
        qualityScore: scoreData.score,
        analyzedAt: new Date(),
      },
    })

    const bugReport = await prisma.bugReport.create({
      data: {
        submissionId: submission.id,
        totalBugs: bugs.length,
        criticalCount: scoreData.criticalCount,
        highCount: scoreData.highCount,
        mediumCount: scoreData.mediumCount,
        lowCount: scoreData.lowCount,
        infoCount: scoreData.infoCount,
        qualityScore: scoreData.score,
      },
    })

    if (bugs.length > 0) {
      await prisma.bugRecord.createMany({
        data: bugs.map((bug) => ({
          bugReportId: bugReport.id,
          title: bug.title,
          line: bug.line ?? null,
          severity: bug.severity,
          category: bug.category,
          whyItMatters: bug.whyItMatters,
          beginnerExplanation: bug.beginnerExplanation,
          expertExplanation: bug.expertExplanation,
          howToFix: bug.howToFix,
          beforeCode: bug.beforeCode ?? null,
          afterCode: bug.afterCode ?? null,
          learningTopic: bug.learningTopic ?? null,
        })),
      })
    }

    await prisma.notification.create({
      data: {
        userId,
        title: 'Analysis Complete',
        message: `"${title || 'Untitled'}" analyzed. Score: ${scoreData.score}/100. ${bugs.length} issue(s) found.`,
      },
    })

    const fullReport = await prisma.bugReport.findUnique({
      where: { id: bugReport.id },
      include: {
        bugRecords: { orderBy: [{ severity: 'asc' }, { createdAt: 'asc' }] },
        submission: {
          include: {
            language: true,
          },
        },
      },
    })

    return NextResponse.json({ submissionId: submission.id, reportId: bugReport.id, report: fullReport })
  } catch (error) {
    console.error('Submit analysis error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
