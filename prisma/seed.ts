import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding CodeGuard AI demo database...')

  await prisma.bugRecord.deleteMany()
  await prisma.bugReport.deleteMany()
  await prisma.submission.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.classMember.deleteMany()
  await prisma.assignment.deleteMany()
  await prisma.class.deleteMany()
  await prisma.user.deleteMany()
  await prisma.language.deleteMany()

  const password = await bcrypt.hash('password123', 10)

  const [python, javascript, c, cpp, java] = await Promise.all([
    prisma.language.create({ data: { name: 'Python', slug: 'python', enabled: true } }),
    prisma.language.create({ data: { name: 'JavaScript', slug: 'javascript', enabled: true } }),
    prisma.language.create({ data: { name: 'C', slug: 'c', enabled: true } }),
    prisma.language.create({ data: { name: 'C++', slug: 'cpp', enabled: true } }),
    prisma.language.create({ data: { name: 'Java', slug: 'java', enabled: true } }),
  ])

  const student = await prisma.user.create({
    data: { name: 'Demo Student', email: 'student@codeguard.ai', password, role: 'STUDENT' },
  })

  const teacher = await prisma.user.create({
    data: { name: 'Demo Teacher', email: 'teacher@codeguard.ai', password, role: 'TEACHER' },
  })

  await prisma.user.create({
    data: { name: 'Demo Admin', email: 'admin@codeguard.ai', password, role: 'ADMIN' },
  })

  const demoClass = await prisma.class.create({
    data: { name: 'CS101 - Programming Fundamentals', code: 'CS101-2024', teacherId: teacher.id },
  })

  await prisma.classMember.create({ data: { classId: demoClass.id, userId: student.id } })

  await prisma.assignment.create({
    data: {
      title: 'Safe Code Practice',
      description: 'Submit a short program and fix detected issues.',
      classId: demoClass.id,
      language: 'Python',
      minScore: 70,
    },
  })

  const submission1 = await prisma.submission.create({
    data: {
      userId: student.id,
      languageId: python.id,
      title: 'Python Security Demo',
      status: 'DONE',
      qualityScore: 45,
      analyzedAt: new Date(),
      code: `password = "admin123"

def divide(a, b):
    return a / b

query = "SELECT * FROM users WHERE id = " + user_id
print(divide(10, 0))`,
    },
  })

  const report1 = await prisma.bugReport.create({
    data: {
      submissionId: submission1.id,
      totalBugs: 4,
      criticalCount: 1,
      highCount: 1,
      mediumCount: 1,
      lowCount: 1,
      infoCount: 0,
      qualityScore: 45,
    },
  })

  await prisma.bugRecord.createMany({
    data: [
      {
        bugReportId: report1.id,
        title: 'Hardcoded Secret Detected',
        line: 1,
        severity: 'CRITICAL',
        category: 'Secrets Management',
        whyItMatters: 'Passwords stored directly in source code can be leaked through GitHub, screenshots, or logs.',
        beginnerExplanation: 'This is like writing your house key on the front door. Anyone who sees the code can use it.',
        expertExplanation: 'Credentials should be stored in environment variables or a dedicated secret manager instead of source code.',
        howToFix: 'Move the password to an environment variable and read it at runtime.',
        beforeCode: 'password = "admin123"',
        afterCode: 'import os\npassword = os.getenv("DB_PASSWORD")',
        learningTopic: 'Secrets Management',
      },
      {
        bugReportId: report1.id,
        title: 'Possible Division by Zero',
        line: 4,
        severity: 'HIGH',
        category: 'Runtime Error',
        whyItMatters: 'If b becomes zero, the program crashes during execution.',
        beginnerExplanation: 'A computer cannot divide by zero, so the program stops suddenly.',
        expertExplanation: 'Guard divisor values before arithmetic operations to prevent runtime exceptions.',
        howToFix: 'Check b before dividing.',
        beforeCode: 'return a / b',
        afterCode: 'if b == 0:\n    raise ValueError("b cannot be zero")\nreturn a / b',
        learningTopic: 'Runtime Error Prevention',
      },
      {
        bugReportId: report1.id,
        title: 'SQL Injection Risk',
        line: 6,
        severity: 'CRITICAL',
        category: 'SQL Injection',
        whyItMatters: 'String concatenation in SQL can allow attackers to change the query.',
        beginnerExplanation: 'You are letting user input directly touch the database command.',
        expertExplanation: 'Use parameterized queries to separate SQL structure from user-supplied values.',
        howToFix: 'Use placeholders or ORM query methods.',
        beforeCode: 'query = "SELECT * FROM users WHERE id = " + user_id',
        afterCode: 'query = "SELECT * FROM users WHERE id = ?"\ndb.execute(query, [user_id])',
        learningTopic: 'SQL Injection Prevention',
      },
      {
        bugReportId: report1.id,
        title: 'Debug Print Statement',
        line: 7,
        severity: 'LOW',
        category: 'Logging',
        whyItMatters: 'Debug output can expose internal data and make production logs noisy.',
        beginnerExplanation: 'It is okay while learning, but should be removed or replaced before final submission.',
        expertExplanation: 'Use a structured logger with log levels instead of raw print statements.',
        howToFix: 'Remove print or use proper logging.',
        beforeCode: 'print(divide(10, 0))',
        afterCode: 'logger.info("Calculation complete")',
        learningTopic: 'Logging Best Practices',
      },
    ],
  })

  const submission2 = await prisma.submission.create({
    data: {
      userId: student.id,
      languageId: javascript.id,
      title: 'JavaScript Login Check',
      status: 'DONE',
      qualityScore: 72,
      analyzedAt: new Date(),
      code: `function login(user) {
  console.log(user)
  const query = "SELECT * FROM users WHERE name = " + user.name
  return db.query(query)
}`,
    },
  })

  const report2 = await prisma.bugReport.create({
    data: {
      submissionId: submission2.id,
      totalBugs: 2,
      criticalCount: 1,
      highCount: 0,
      mediumCount: 0,
      lowCount: 1,
      infoCount: 0,
      qualityScore: 72,
    },
  })

  await prisma.bugRecord.createMany({
    data: [
      {
        bugReportId: report2.id,
        title: 'SQL Injection Risk',
        line: 3,
        severity: 'CRITICAL',
        category: 'SQL Injection',
        whyItMatters: 'User input is concatenated into a SQL string.',
        beginnerExplanation: 'Someone could type a value that changes the database command.',
        expertExplanation: 'Parameterized queries are required to separate data from SQL syntax.',
        howToFix: 'Use placeholders or ORM methods.',
        beforeCode: 'const query = "SELECT * FROM users WHERE name = " + user.name',
        afterCode: 'const userRecord = await db.user.findFirst({ where: { name: user.name } })',
        learningTopic: 'SQL Injection Prevention',
      },
      {
        bugReportId: report2.id,
        title: 'Console Log Left In Code',
        line: 2,
        severity: 'LOW',
        category: 'Logging',
        whyItMatters: 'Console logs can leak private user data.',
        beginnerExplanation: 'This prints user information and should not stay in final code.',
        expertExplanation: 'Avoid logging sensitive objects. Use structured logging and redaction.',
        howToFix: 'Remove console.log or log a safe message.',
        beforeCode: 'console.log(user)',
        afterCode: 'logger.debug("Login attempt received")',
        learningTopic: 'Safe Logging',
      },
    ],
  })

  await prisma.notification.create({
    data: {
      userId: student.id,
      title: 'Welcome to CodeGuard AI',
      message: 'Your demo account is ready. Try submitting code from the Analyze Code page.',
    },
  })

  console.log('Seed complete.')
  console.log('Student: student@codeguard.ai / password123')
  console.log('Teacher: teacher@codeguard.ai / password123')
  console.log('Admin: admin@codeguard.ai / password123')

  void c
  void cpp
  void java
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
