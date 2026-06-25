import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/db'

const validRoles = ['STUDENT', 'TEACHER', 'ADMIN'] as const

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)

    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    const role = String(body.role || 'STUDENT').toUpperCase()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered. Please sign in instead.' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const selectedRole = validRoles.includes(role as any) ? role : 'STUDENT'

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: selectedRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error: any) {
    console.error('REGISTER ERROR:', error)

    const message =
      error?.code === 'P2002'
        ? 'Email already registered. Please sign in instead.'
        : 'Registration failed. Please check your database setup and try again.'

    return NextResponse.json(
      { error: message },
      { status: error?.code === 'P2002' ? 409 : 500 }
    )
  }
}
