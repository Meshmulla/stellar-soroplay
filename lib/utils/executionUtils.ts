/**
 * Utilities for contract execution and environment setup
 */

export interface ExecutionContext {
  functionName: string
  params: Record<string, any>
  timestamp: number
}

export interface ExecutionResult {
  success: boolean
  result?: any
  error?: string
  executionTime: number
  gasUsed?: number
}

/**
 * Converts string parameters to appropriate types
 */
export function coerceParamTypes(
  params: Record<string, string>,
  paramDefs: Array<{ name: string; type: string }>
): Record<string, any> {
  const coerced: Record<string, any> = {}

  for (const def of paramDefs) {
    const value = params[def.name]
    if (value === undefined || value === '') continue

    switch (def.type.toLowerCase()) {
      case 'i32':
      case 'i64':
      case 'u32':
      case 'u64':
      case 'u128':
        coerced[def.name] = parseInt(value, 10)
        break
      case 'f32':
      case 'f64':
        coerced[def.name] = parseFloat(value)
        break
      case 'bool':
        coerced[def.name] = value.toLowerCase() === 'true' || value === '1'
        break
      case 'string':
      case 'str':
        coerced[def.name] = value
        break
      default:
        // For Soroban types like Address, Symbol, etc.
        coerced[def.name] = value
        break
    }
  }

  return coerced
}

/**
 * Formats execution output for display
 */
export function formatExecutionOutput(result: any): string {
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

/**
 * Simulates contract execution with timing
 */
export async function simulateExecution(
  context: ExecutionContext,
  result: any
): Promise<ExecutionResult> {
  const startTime = performance.now()

  // Simulate some processing time
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 100 + 50))

  const endTime = performance.now()

  return {
    success: true,
    result,
    executionTime: Math.round((endTime - startTime) * 100) / 100,
    gasUsed: Math.floor(Math.random() * 10000) + 1000,
  }
}

/**
 * Validates function execution parameters
 */
export function validateExecutionParams(
  functionName: string,
  params: Record<string, string>,
  paramDefs: Array<{ name: string; type: string }>
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  for (const def of paramDefs) {
    const value = params[def.name]

    // Check if required parameter is provided
    if (!value) {
      errors.push(`Parameter '${def.name}' is required`)
      continue
    }

    // Type-specific validation
    if (['i32', 'i64', 'u32', 'u64', 'u128'].includes(def.type.toLowerCase())) {
      if (!/^-?\d+$/.test(value)) {
        errors.push(`Parameter '${def.name}' must be an integer`)
      }
    } else if (['f32', 'f64'].includes(def.type.toLowerCase())) {
      if (!/^-?\d+(\.\d+)?$/.test(value)) {
        errors.push(`Parameter '${def.name}' must be a number`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
