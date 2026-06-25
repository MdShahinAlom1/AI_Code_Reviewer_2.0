# CodeGuard AI - Added Role and AI Features

## Student
- Register/Login with role routing
- Lab exams page: `/exams`
- Join lab exams
- View upcoming/open exams
- Start exam page: `/exams/[id]`
- Online code editor
- Browser auto-save draft
- Multiple submissions until deadline
- AI feedback for exam attempts
- Previous submission history
- Performance/history dashboards
- Dark UI already enabled across the app

## Teacher
- Teacher dashboard: `/teacher`
- Create programming lab exams: `/teacher/exams`
- Course code/name, deadline, questions, starter code, and test cases
- Manual grading: `/teacher/grading`
- AI grading assistance
- Teacher comments
- Plagiarism risk review
- Publish grades/comments
- Student progress analytics
- Export results as CSV

## Admin
- Admin dashboard: `/admin`
- User management overview
- Course/lab/system statistics
- System monitoring: `/admin/system`
- AI usage statistics
- Logs: `/admin/logs`
- Backup/export readiness
- Role based dashboards

## AI Module
The analyzer now checks code review and bug detection items, including:
- Readability and naming convention
- Clean code / modularization hints
- Function complexity
- Duplicate code
- Dead code
- Code smells
- Infinite loops
- Null pointer or undefined access risks
- Index out of bounds risks
- Syntax error patterns
- Logical mistakes
- Missing return statements
- Variable misuse in conditions
