const PISTON_API = 'https://emkc.org/api/v2/piston/execute'
const MAX_OUTPUT_CHARS = 500
const TIMEOUT_MS = 10_000

export type RunResult = {
  stdout: string
  stderr: string
  exitCode: number | null
  timedOut: boolean
  error?: string
}

// Map display names → Piston runtime identifiers + versions
const LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  python:     { language: 'python',     version: '3.10.0' },
  javascript: { language: 'javascript', version: '18.15.0' },
  java:       { language: 'java',       version: '15.0.2' },
  cpp:        { language: 'c++',        version: '10.2.0' },
  html:       { language: 'html',       version: '5' },  // fallback: won't execute
}

export const SUPPORTED_LANGUAGES = [
  { id: 'python',     label: 'Python',     monacoId: 'python' },
  { id: 'javascript', label: 'JavaScript', monacoId: 'javascript' },
  { id: 'java',       label: 'Java',       monacoId: 'java' },
  { id: 'cpp',        label: 'C++',        monacoId: 'cpp' },
  { id: 'html',       label: 'HTML/CSS',   monacoId: 'html' },
] as const

export type SupportedLanguageId = (typeof SUPPORTED_LANGUAGES)[number]['id']

function truncate(str: string, max: number): string {
  if (str.length <= max) return str
  return str.slice(0, max) + `\n... (truncated at ${max} chars)`
}

export async function runCode(language: string, code: string): Promise<RunResult> {
  // HTML can't be executed via Piston — return a preview hint
  if (language === 'html') {
    return {
      stdout: '[HTML/CSS Preview] Use the browser preview panel to see output.',
      stderr: '',
      exitCode: 0,
      timedOut: false,
    }
  }

  const runtime = LANGUAGE_MAP[language]
  if (!runtime) {
    return { stdout: '', stderr: `Unsupported language: ${language}`, exitCode: 1, timedOut: false, error: 'unsupported' }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(PISTON_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        language: runtime.language,
        version: runtime.version,
        files: [{ content: code }],
      }),
    })

    clearTimeout(timer)

    if (!res.ok) {
      const text = await res.text().catch(() => 'Unknown error')
      return { stdout: '', stderr: `API Error ${res.status}: ${text}`, exitCode: 1, timedOut: false, error: 'api' }
    }

    const data = await res.json()
    const run = data.run ?? {}

    return {
      stdout: truncate(run.stdout?.trim() ?? '', MAX_OUTPUT_CHARS),
      stderr: truncate(run.stderr?.trim() ?? '', MAX_OUTPUT_CHARS),
      exitCode: run.code ?? null,
      timedOut: false,
    }
  } catch (err: unknown) {
    clearTimeout(timer)

    if (err instanceof DOMException && err.name === 'AbortError') {
      return { stdout: '', stderr: 'Execution timed out (10s limit)', exitCode: null, timedOut: true, error: 'timeout' }
    }

    const msg = err instanceof Error ? err.message : 'Unknown network error'
    return { stdout: '', stderr: msg, exitCode: null, timedOut: false, error: 'network' }
  }
}
