import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function prepareSqliteForServerless() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl?.startsWith('file:')) return

  // Vercel/serverless files are read-only except /tmp. SQLite must be placed in /tmp
  // so registration, login updates, submissions, and feedback can write safely.
  const isServerless = Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production'
  if (!isServerless) return

  const runtimeDbPath = '/tmp/codeguard-ai-dev.db'
  const runtimeDbUrl = `file:${runtimeDbPath}`

  if (!fs.existsSync(runtimeDbPath)) {
    const possibleSources = [
      path.join(process.cwd(), 'prisma', 'dev.db'),
      path.join(process.cwd(), 'dev.db'),
      path.join(__dirname, '..', 'prisma', 'dev.db'),
    ]

    const sourceDbPath = possibleSources.find((candidate) => fs.existsSync(candidate))

    if (sourceDbPath) {
      fs.copyFileSync(sourceDbPath, runtimeDbPath)
    }
  }

  process.env.DATABASE_URL = runtimeDbUrl
}

prepareSqliteForServerless()

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
