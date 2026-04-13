import { NextRequest, NextResponse } from 'next/server'
import { formatExecutionOutput, simulateExecution } from '@/lib/utils/executionUtils'

export async function POST(request: NextRequest) {
  try {
    const { wasmBinary, functionName, params } = await request.json()

    if (!wasmBinary || !functionName) {
      return NextResponse.json(
        { error: 'Missing wasmBinary or functionName' },
        { status: 400 }
      )
    }

    console.log(`[soroplay] Executing function: ${functionName} with params:`, params)

    // For MVP, return mock results based on function name
    // In production, this would use wasmtime or similar to execute WASM
    let result: any = ''

    if (functionName === 'hello') {
      result = 'Hello, World!'
    } else if (functionName === 'greet') {
      const name = params?.name || 'Friend'
      result = `Hello, ${name}!`
    } else if (functionName === 'increment') {
      result = (parseInt(params?.value || '0') + 1).toString()
    } else if (functionName === 'concat') {
      const str1 = params?.str1 || ''
      const str2 = params?.str2 || ''
      result = str1 + str2
    } else {
      result = {
        function: functionName,
        params,
        message: 'Function executed successfully',
      }
    }

    // Simulate execution timing
    const startTime = performance.now()
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 50 + 10))
    const executionTime = performance.now() - startTime

    const formattedResult = formatExecutionOutput(result)

    return NextResponse.json({
      success: true,
      result: formattedResult,
      functionName,
      executionTime: Math.round(executionTime * 100) / 100,
      gasEstimate: Math.floor(Math.random() * 5000) + 1000,
    })
  } catch (error) {
    console.error('[soroplay] Execution error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Execution failed' },
      { status: 500 }
    )
  }
}
