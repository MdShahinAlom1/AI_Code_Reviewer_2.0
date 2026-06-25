export interface Recommendation {
  topic: string
  description: string
  resources: string[]
  priority: 'high' | 'medium' | 'low'
}

const TOPIC_MAP: Record<string, Recommendation> = {
  'SQL Injection': {
    topic: 'SQL Injection Prevention',
    description: 'Learn how parameterized queries protect databases from malicious input.',
    resources: ['Parameterized queries', 'OWASP SQL Injection guide', 'ORM query builders'],
    priority: 'high',
  },
  Security: {
    topic: 'Secure Coding Basics',
    description: 'Understand how to avoid dangerous functions and unsafe command execution.',
    resources: ['OWASP Top 10', 'Input validation', 'Avoid eval and system calls'],
    priority: 'high',
  },
  'Secrets Management': {
    topic: 'Secrets Management',
    description: 'Learn how to store passwords, API keys, and tokens safely.',
    resources: ['Environment variables', 'Secret managers', 'Git secret scanning'],
    priority: 'high',
  },
  'Runtime Error': {
    topic: 'Runtime Error Prevention',
    description: 'Learn how to prevent crashes such as division by zero and invalid operations.',
    resources: ['Exception handling', 'Input validation', 'Defensive programming'],
    priority: 'high',
  },
  'Logic Error': {
    topic: 'Debugging Logic Errors',
    description: 'Practice tracing loops and conditions to avoid infinite loops and wrong output.',
    resources: ['Loop tracing', 'Debugging basics', 'Control-flow diagrams'],
    priority: 'medium',
  },
  'Runtime Safety': {
    topic: 'Runtime Safety and Bounds Checking',
    description: 'Learn how to avoid invalid index access and unsafe memory-like behavior.',
    resources: ['Array bounds checking', 'Safe indexing', 'Input validation'],
    priority: 'medium',
  },
  Reliability: {
    topic: 'Reliable Program Design',
    description: 'Learn how to handle failed network/database calls gracefully.',
    resources: ['Try/catch', 'Error handling patterns', 'Retry strategies'],
    priority: 'medium',
  },
  Logging: {
    topic: 'Logging Best Practices',
    description: 'Learn when to log, what not to log, and how to avoid exposing sensitive data.',
    resources: ['Log levels', 'Structured logging', 'Sensitive data redaction'],
    priority: 'low',
  },
  'Code Quality': {
    topic: 'Clean Code Basics',
    description: 'Improve readability and maintainability with modern language features.',
    resources: ['Clean code', 'Naming', 'Refactoring basics'],
    priority: 'low',
  },
}

export function getRecommendations(categories: string[]): Recommendation[] {
  const unique = Array.from(new Set(categories))
  const recommendations = unique
    .map((category) => TOPIC_MAP[category])
    .filter(Boolean) as Recommendation[]

  return recommendations.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.priority] - order[b.priority]
  })
}
