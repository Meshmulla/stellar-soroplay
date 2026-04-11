/**
 * Detects contract functions from Rust source code
 */

export interface DetectedFunction {
  name: string
  params: Array<{
    name: string
    type: string
  }>
  returnType: string
  isPublic: boolean
}

export function detectContractFunctions(rustCode: string): DetectedFunction[] {
  const functions: DetectedFunction[] = []

  // Regex to find public functions in impl blocks
  // Matches: pub fn function_name(param: type, ...) -> ReturnType
  const functionRegex = /pub\s+fn\s+(\w+)\s*\(\s*([^)]*)\s*\)\s*(?:->\s*(\w+))?/g

  let match
  while ((match = functionRegex.exec(rustCode)) !== null) {
    const [, name, paramsStr, returnType] = match

    // Skip special functions like main, lib, etc
    if (['main', 'lib', 'new', '__init'].includes(name)) {
      continue
    }

    // Parse parameters
    const params = parseParams(paramsStr)

    // Filter out env and other non-contract parameters
    const contractParams = params.filter((p) => p.name !== 'env' && !p.name.startsWith('_'))

    functions.push({
      name,
      params: contractParams,
      returnType: returnType || 'void',
      isPublic: true,
    })
  }

  return functions
}

function parseParams(paramsStr: string): Array<{ name: string; type: string }> {
  const params: Array<{ name: string; type: string }> = []

  if (!paramsStr.trim()) {
    return params
  }

  // Split by comma, but handle nested generics
  const paramParts = paramsStr.split(',').map((p) => p.trim())

  for (const param of paramParts) {
    if (!param) continue

    // Match "name: type"
    const match = param.match(/(\w+)\s*:\s*(.+)/)
    if (match) {
      const [, name, type] = match
      params.push({
        name: name.trim(),
        type: type.trim(),
      })
    }
  }

  return params
}

/**
 * Validates if Rust code contains valid Soroban contract structure
 */
export function validateSorobanContract(rustCode: string): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Check for soroban_contract attribute
  if (!rustCode.includes('#[soroban_contract]')) {
    errors.push('Missing #[soroban_contract] attribute')
  }

  // Check for contractimpl
  if (!rustCode.includes('#[contractimpl]')) {
    warnings.push('No #[contractimpl] attribute found')
  }

  // Check for at least one public function
  const functions = detectContractFunctions(rustCode)
  if (functions.length === 0) {
    warnings.push('No public functions detected')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}
