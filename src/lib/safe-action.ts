/**
 * Wraps a server action function in try/catch to prevent
 * uncaught exceptions from crashing the page.
 * Returns { error: string } on any unexpected failure.
 */
export function safeAction<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>
): (...args: TArgs) => Promise<TResult | { error: string }> {
  return async (...args: TArgs) => {
    try {
      return await fn(...args)
    } catch (err: unknown) {
      console.error('[ServerAction Error]', err)
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      return { error: `SYSTEM_ERROR: ${message}` } as { error: string }
    }
  }
}
