import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const role = session.user.role

    const report = await prisma.bugReport.findUnique({
      where: { id: params.id },
      include: {
        bugRecords: { orderBy: [{ severity: 'asc' }, { createdAt: 'asc' }] },
        submission: {
          include: {
            language: true,
            user: true,
          },
        },
      },
    })

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    if (role === 'STUDENT' && report.submission.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (role === 'TEACHER') {
      const membership = await prisma.classMember.findFirst({
        where: {
          userId: report.submission.userId,
          class: { teacherId: userId },
        },
      })

      if (!membership && report.submission.userId !== userId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Report fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 })
  }
}
