# CodeGuard AI

CodeGuard AI is an academic Software Engineering web project for automated bug detection and code quality analysis.

## Features

- Student registration and login
- Role-based dashboards for Student, Teacher, and Admin
- Code submission page with sample code
- Rule-based bug detection
- Bug severity classification
- Quality score generation
- Bug report with beginner/expert explanations
- Fix checklist and learning recommendations
- Submission history
- Admin language enable/disable toggle
- Demo seed users

## Tech Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite for local development
- NextAuth credentials login
- Recharts

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create database and run migration:

```bash
npx prisma migrate dev --name init
```

3. Seed demo data:

```bash
npx prisma db seed
```

4. Start development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Demo Accounts

```text
Student: student@codeguard.ai / password123
Teacher: teacher@codeguard.ai / password123
Admin: admin@codeguard.ai / password123
```

## Important Files

```text
app/page.tsx                    Landing page
app/dashboard/page.tsx           Student dashboard
app/submit/page.tsx              Code submission
app/reports/[id]/page.tsx        Bug report
app/history/page.tsx             Submission history
app/teacher/page.tsx             Teacher dashboard
app/admin/page.tsx               Admin dashboard
app/profile/page.tsx             Profile page
lib/analyzer.ts                  Rule-based analyzer
lib/score.ts                     Quality score algorithm
prisma/schema.prisma             Database schema
prisma/seed.ts                   Demo data
```

## Note

This MVP uses educational rule-based analysis. For a production system, add sandboxed code execution, compiler integration, and stronger static analysis tools.
