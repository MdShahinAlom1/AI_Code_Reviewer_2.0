import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bugRecordId, feedback } = await req.json()

    if (!bugRecordId || !feedback) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const allowedFeedback = ['HELPFUL', 'CONFUSING', 'FALSE_POSITIVE']
    if (!allowedFeedback.includes(feedback)) {
      return NextResponse.json({ error: 'Invalid feedback' }, { status: 400 })
    }

    await prisma.bugRecord.update({
      where: { id: bugRecordId },
      data: { feedback },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Feedback error:', error)
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
  }
}
