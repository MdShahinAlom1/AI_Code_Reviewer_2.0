import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = session.user.role
    let whereClause: any = { userId: session.user.id }

    if (role === 'ADMIN') {
      whereClause = {}
    }

    if (role === 'TEACHER') {
      const classes = await prisma.class.findMany({
        where: { teacherId: session.user.id },
        include: { members: true },
      })
      const studentIds = Array.from(
        new Set(classes.flatMap((cls) => cls.members.map((member) => member.userId)))
      )
      whereClause = { userId: { in: studentIds } }
    }

    const submissions = await prisma.submission.findMany({
      where: whereClause,
      include: { language: true, user: true, bugReport: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(
      submissions.map((submission) => ({
        id: submission.id,
        reportId: submission.bugReport?.id ?? null,
        title: submission.title,
        languageName: submission.language.name,
        userName: submission.user.name,
        status: submission.status,
        qualityScore: submission.qualityScore,
        totalBugs: submission.bugReport?.totalBugs ?? 0,
        createdAt: submission.createdAt,
      }))
    )
  } catch (error) {
    console.error('History fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
  }
}
