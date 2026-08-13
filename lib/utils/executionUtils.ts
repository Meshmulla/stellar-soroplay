/**
 * Utilities for formatting contract execution output.
 */

/**
 * Formats execution output for display
 */
export function formatExecutionOutput(result: unknown): string {
  if (result === null || result === undefined) {
    return 'null'
  }

  if (typeof result === 'string') {
    return result
  }

  if (typeof result === 'object') {
    try {
      return JSON.stringify(result, null, 2)
    } catch {
      return String(result)
    }
  }

  return String(result)
}
