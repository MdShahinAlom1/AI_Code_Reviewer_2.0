import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const language = await prisma.language.findUnique({ where: { id: params.id } })

    if (!language) {
      return NextResponse.json({ error: 'Language not found' }, { status: 404 })
    }

    const updated = await prisma.language.update({
      where: { id: params.id },
      data: { enabled: !language.enabled },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Language toggle error:', error)
    return NextResponse.json({ error: 'Failed to toggle language' }, { status: 500 })
  }
}
