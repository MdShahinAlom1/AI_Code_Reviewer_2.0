export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'

export interface BugRecord {
  title: string
  line?: number | null
  severity: Severity
  category: string
  whyItMatters: string
  beginnerExplanation: string
  expertExplanation: string
  howToFix: string
  beforeCode?: string | null
  afterCode?: string | null
  learningTopic?: string | null
}

interface Rule {
  id: string
  title: string
  pattern: RegExp
  severity: Severity
  category: string
  whyItMatters: string
  beginnerExplanation: string
  expertExplanation: string
  howToFix: string
  afterCode?: string
  learningTopic: string
  languages?: string[]
}

const RULES: Rule[] = [
  {
    id: 'hardcoded-secret',
    title: 'Hardcoded Secret Detected',
    pattern: /(password|passwd|pwd|secret|api[_-]?key|token)\s*[=:]\s*["'][^"']{4,}["']/i,
    severity: 'CRITICAL',
    category: 'Secrets Management',
    whyItMatters: 'Secrets stored directly in code can be leaked through Git, screenshots, logs, or shared files.',
    beginnerExplanation: 'This is like writing your password on paper and leaving it on your desk. Anyone who sees the code can use it.',
    expertExplanation: 'Credentials should not be committed to source control. Use environment variables, vaults, or a secret manager.',
    howToFix: 'Move the secret into an environment variable and read it at runtime.',
    afterCode: 'const password = process.env.DB_PASSWORD',
    learningTopic: 'Secrets Management',
  },
  {
    id: 'sql-injection',
    title: 'SQL Injection Risk',
    pattern: /(SELECT|INSERT|UPDATE|DELETE).*\+|\+.*(SELECT|INSERT|UPDATE|DELETE)|query\s*=\s*["'`].*(SELECT|INSERT|UPDATE|DELETE)/i,
    severity: 'CRITICAL',
    category: 'SQL Injection',
    whyItMatters: 'Building SQL with string concatenation can let attackers modify database commands.',
    beginnerExplanation: 'You are mixing user input with a database command. A bad user may change the command.',
    expertExplanation: 'Use parameterized queries or ORM methods to separate SQL syntax from user-controlled values.',
    howToFix: 'Use prepared statements, placeholders, or ORM query builders.',
    afterCode: 'db.query("SELECT * FROM users WHERE id = ?", [userId])',
    learningTopic: 'SQL Injection Prevention',
  },
  {
    id: 'dangerous-exec',
    title: 'Dangerous Command Execution',
    pattern: /\b(eval|exec|system|popen|Runtime\.getRuntime\(\)\.exec|os\.system|subprocess\.call|subprocess\.Popen)\s*\(/i,
    severity: 'HIGH',
    category: 'Security',
    whyItMatters: 'Executing dynamic commands can allow attackers to run harmful code on the server.',
    beginnerExplanation: 'This lets the program run commands. If user input reaches here, it may run dangerous commands.',
    expertExplanation: 'Avoid dynamic code execution and shell invocation; validate input and use safe library APIs instead.',
    howToFix: 'Remove eval/exec/system calls or replace them with a safe API.',
    afterCode: '// Use safe parsing or a library function instead of eval/exec/system.',
    learningTopic: 'Secure Coding',
  },
  {
    id: 'division-by-zero-literal',
    title: 'Possible Division by Zero',
    pattern: /\/\s*0(?![\.\d])/,
    severity: 'HIGH',
    category: 'Runtime Error',
    whyItMatters: 'Division by zero causes runtime errors or invalid results.',
    beginnerExplanation: 'A computer cannot divide a number by zero, so the program may crash.',
    expertExplanation: 'Guard divisors before arithmetic operations and define behavior for zero input.',
    howToFix: 'Check the divisor before division.',
    afterCode: 'if (b === 0) throw new Error("Cannot divide by zero")\nreturn a / b',
    learningTopic: 'Runtime Error Prevention',
  },
  {
    id: 'infinite-loop',
    title: 'Possible Infinite Loop',
    pattern: /while\s*(\(\s*(true|1|True)\s*\)|True\s*:|1\s*:)/i,
    severity: 'HIGH',
    category: 'Logic Error',
    whyItMatters: 'An infinite loop can freeze the program or consume server resources.',
    beginnerExplanation: 'The loop may never stop, like a fan that keeps running forever.',
    expertExplanation: 'Ensure loop termination conditions depend on state that changes during each iteration.',
    howToFix: 'Add a clear break condition or update the loop variable.',
    afterCode: 'while (hasMoreItems) {\n  // update hasMoreItems\n}',
    learningTopic: 'Loop Control Flow',
  },
  {
    id: 'console-log',
    title: 'Debug Output Left In Code',
    pattern: /\b(console\.log|print\s*\(|printf\s*\(|cout\s*<<|System\.out\.println)\b/i,
    severity: 'LOW',
    category: 'Logging',
    whyItMatters: 'Debug output can expose sensitive data and make logs noisy.',
    beginnerExplanation: 'Printing is useful while testing, but final code should not show private or noisy messages.',
    expertExplanation: 'Use structured logging with levels and redaction instead of raw debug statements.',
    howToFix: 'Remove debug prints or replace them with a proper logger.',
    afterCode: 'logger.debug("Operation completed")',
    learningTopic: 'Logging Best Practices',
  },
  {
    id: 'array-index-risk',
    title: 'Possible Unsafe Array Access',
    pattern: /\w+\s*\[\s*(index|idx|i|j|\d+)\s*\]/i,
    severity: 'MEDIUM',
    category: 'Runtime Safety',
    whyItMatters: 'Accessing arrays without checking bounds may crash or return undefined values.',
    beginnerExplanation: 'You may be asking for an item that does not exist in the list.',
    expertExplanation: 'Validate indexes before array access to prevent out-of-bounds behavior.',
    howToFix: 'Check index range before reading from the array.',
    afterCode: 'if (index >= 0 && index < items.length) {\n  const item = items[index]\n}',
    learningTopic: 'Array Bounds Checking',
  },
  {
    id: 'missing-error-handling',
    title: 'Network or Async Operation Without Error Handling',
    pattern: /\b(fetch|axios\.|requests\.|http\.|db\.query|await)\b/i,
    severity: 'MEDIUM',
    category: 'Reliability',
    whyItMatters: 'External calls can fail. Without error handling, the application may crash or hide useful feedback.',
    beginnerExplanation: 'The internet or database may fail. Your program should know what to do when that happens.',
    expertExplanation: 'Wrap I/O operations in try/catch and handle expected failures explicitly.',
    howToFix: 'Use try/catch and show a safe error message.',
    afterCode: 'try {\n  const result = await fetch(url)\n} catch (error) {\n  logger.error(error)\n}',
    learningTopic: 'Exception Handling',
  },
  {
    id: 'legacy-var',
    title: 'Use const or let Instead of var',
    pattern: /\bvar\s+\w+/,
    severity: 'INFO',
    category: 'Code Quality',
    whyItMatters: 'var has function scope and can create confusing bugs in JavaScript.',
    beginnerExplanation: 'var is an older way to create variables. let and const are clearer and safer.',
    expertExplanation: 'Prefer const by default and let when reassignment is required to improve lexical scoping.',
    howToFix: 'Replace var with const or let.',
    afterCode: 'const result = items[index]',
    learningTopic: 'Modern JavaScript',
    languages: ['javascript'],
  },
  {
    id: 'null-pointer-risk',
    title: 'Possible Null Pointer or Undefined Access',
    pattern: /\b\w+\.(\w+)\b(?!\s*[?])|->\s*\w+/i,
    severity: 'MEDIUM',
    category: 'Bug Detection',
    whyItMatters: 'Accessing properties or pointers without a null check can crash the program.',
    beginnerExplanation: 'The variable may be empty/null. If you use it directly, the program can stop.',
    expertExplanation: 'Add null/undefined guards or optional chaining before dereferencing objects and pointers.',
    howToFix: 'Check the value before accessing its members.',
    afterCode: 'if (user != null) {\n  // safely use user\n}',
    learningTopic: 'Null Safety',
  },
  {
    id: 'missing-return',
    title: 'Possible Missing Return Statement',
    pattern: /(function\s+\w+\s*\([^)]*\)\s*\{|def\s+\w+\s*\([^)]*\)\s*:|\b(int|String|double|float|boolean|bool)\s+\w+\s*\([^)]*\)\s*\{)(?![\s\S]*?\breturn\b)/i,
    severity: 'MEDIUM',
    category: 'Bug Detection',
    whyItMatters: 'Functions that promise a value must return one on every path.',
    beginnerExplanation: 'The function should give back an answer, but some path may finish without giving anything.',
    expertExplanation: 'Ensure non-void functions return a value across all branches and error paths.',
    howToFix: 'Add a return statement or change the function type to void when no value is required.',
    afterCode: 'function total(a, b) {\n  return a + b\n}',
    learningTopic: 'Control Flow',
  },
  {
    id: 'dead-code-after-return',
    title: 'Dead Code After Return',
    pattern: /return[^\n;]*(;)?\s*\n\s*(const|let|var|int|double|float|string|String|cout|printf|console\.log|print\()/i,
    severity: 'LOW',
    category: 'Code Review',
    whyItMatters: 'Code after return will not run, so it creates confusion and hides mistakes.',
    beginnerExplanation: 'After return, the function is finished. The next lines will be ignored.',
    expertExplanation: 'Remove unreachable code or move it before the return statement.',
    howToFix: 'Delete the unreachable lines or restructure the condition.',
    afterCode: '// Move required logic before return, or remove it.',
    learningTopic: 'Dead Code',
  },
  {
    id: 'duplicate-code',
    title: 'Possible Duplicate Code',
    pattern: /(.{20,})[\s\S]*\n\s*\1/i,
    severity: 'INFO',
    category: 'Code Review',
    whyItMatters: 'Duplicate code is harder to maintain and can cause inconsistent fixes.',
    beginnerExplanation: 'The same logic appears more than once. A function can make it cleaner.',
    expertExplanation: 'Extract repeated logic into a function or reusable module.',
    howToFix: 'Create a helper function and call it from both places.',
    afterCode: 'function helper() {\n  // shared logic\n}',
    learningTopic: 'DRY Principle',
  },
  {
    id: 'long-function-complexity',
    title: 'High Function Complexity',
    pattern: /(if|for|while|switch|case|catch)[\s\S]*(if|for|while|switch|case|catch)[\s\S]*(if|for|while|switch|case|catch)[\s\S]*(if|for|while|switch|case|catch)/i,
    severity: 'MEDIUM',
    category: 'Code Review',
    whyItMatters: 'Complex functions are difficult to test, debug, and understand.',
    beginnerExplanation: 'Too many decisions in one place make the code hard to follow.',
    expertExplanation: 'Reduce cyclomatic complexity by extracting functions and simplifying branches.',
    howToFix: 'Split the function into smaller functions with clear responsibilities.',
    afterCode: 'function validateInput() {}\nfunction calculateResult() {}\nfunction printResult() {}',
    learningTopic: 'Function Complexity',
  },
  {
    id: 'poor-naming',
    title: 'Poor Naming Convention',
    pattern: /\b(int|let|const|var|double|float|string|String)\s+([a-zA-Z])\b/i,
    severity: 'INFO',
    category: 'Code Review',
    whyItMatters: 'Single-letter names outside small loops reduce readability.',
    beginnerExplanation: 'Names like x or y do not explain what the value means.',
    expertExplanation: 'Use intention-revealing names for variables, functions, and classes.',
    howToFix: 'Rename variables to describe their purpose.',
    afterCode: 'const totalPrice = price * quantity',
    learningTopic: 'Naming Convention',
  },
  {
    id: 'syntax-error-missing-semicolon-or-brace',
    title: 'Possible Syntax Error',
    pattern: /(if|for|while)\s*\([^)]*$/im,
    severity: 'HIGH',
    category: 'Bug Detection',
    whyItMatters: 'Syntax errors stop the code from compiling or running.',
    beginnerExplanation: 'The code line looks incomplete, so the compiler may reject it.',
    expertExplanation: 'Check brackets, parentheses, and statement terminators around this line.',
    howToFix: 'Complete the condition and close parentheses/braces correctly.',
    afterCode: 'if (condition) {\n  // code\n}',
    learningTopic: 'Syntax Validation',
  },
  {
    id: 'variable-misuse-assignment-in-condition',
    title: 'Possible Variable Misuse in Condition',
    pattern: /\b(if|while)\s*\([^)]*[^=!<>]=[^=][^)]*\)/i,
    severity: 'HIGH',
    category: 'Bug Detection',
    whyItMatters: 'Using assignment instead of comparison can create logical mistakes.',
    beginnerExplanation: 'One equal sign changes the value. Two or three equal signs compare values.',
    expertExplanation: 'Use equality operators in conditions unless intentional assignment is clearly documented.',
    howToFix: 'Replace = with == or === when comparing values.',
    afterCode: 'if (status === "DONE") {\n  // ...\n}',
    learningTopic: 'Logical Mistakes',
  },

]

function lineNumberOf(code: string, pattern: RegExp): number | null {
  const lines = code.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (pattern.test(lines[i])) {
      pattern.lastIndex = 0
      return i + 1
    }
  }
  pattern.lastIndex = 0
  return null
}

function matchedLine(code: string, line: number | null): string | null {
  if (!line) return null
  return code.split('\n')[line - 1]?.trim() || null
}

export function analyzeCode(code: string, language: string): BugRecord[] {
  const bugs: BugRecord[] = []

  for (const rule of RULES) {
    if (rule.languages && !rule.languages.includes(language)) continue
    const regex = new RegExp(rule.pattern.source, rule.pattern.flags)

    if (!regex.test(code)) continue

    const line = lineNumberOf(code, new RegExp(rule.pattern.source, rule.pattern.flags))

    bugs.push({
      title: rule.title,
      line,
      severity: rule.severity,
      category: rule.category,
      whyItMatters: rule.whyItMatters,
      beginnerExplanation: rule.beginnerExplanation,
      expertExplanation: rule.expertExplanation,
      howToFix: rule.howToFix,
      beforeCode: matchedLine(code, line),
      afterCode: rule.afterCode || null,
      learningTopic: rule.learningTopic,
    })
  }

  return bugs
}
