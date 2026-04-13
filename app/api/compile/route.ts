import { NextRequest, NextResponse } from 'next/server'
import { validateSorobanContract, detectContractFunctions } from '@/lib/utils/contractDetector'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 })
    }

    // Validate contract structure
    const validation = validateSorobanContract(code)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.errors[0] }, { status: 400 })
    }

    // Detect functions for later execution
    const functions = detectContractFunctions(code)
    console.log(`[soroplay] Detected ${functions.length} contract functions:`, functions.map((f) => f.name))

    // For MVP, we'll use a remote compilation service or return mock WASM
    const compilationServiceUrl = process.env.COMPILATION_SERVICE_URL

    if (!compilationServiceUrl) {
      // Fallback: return a mock WASM binary for demo purposes
      console.log('[soroplay] Compilation service not configured, returning mock WASM for demo')
      const mockWasm = new Uint8Array([
        0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, // WASM magic + version
        0x01, 0x07, 0x01, 0x60, 0x00, 0x01, 0x7f, // Function signature
        0x03, 0x02, 0x01, 0x00, // Export function
        0x07, 0x05, 0x01, 0x01, 0x68, 0x00, 0x00, // Export name
        0x0a, 0x04, 0x01, 0x02, 0x41, 0x01, 0x0b, // Function body
      ])

      return NextResponse.json({
        success: true,
        wasmBinary: Array.from(mockWasm),
        size: mockWasm.length,
        functions,
        warnings: validation.warnings,
      })
    }

    try {
      const response = await fetch(compilationServiceUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()

      if (!response.ok) {
        return NextResponse.json(
          { error: data.error || 'Compilation failed' },
          { status: response.status }
        )
      }

      return NextResponse.json({
        success: true,
        wasmBinary: data.wasmBinary,
        size: data.size || (data.wasmBinary ? data.wasmBinary.length : 0),
        functions,
        warnings: validation.warnings,
      })
    } catch (error) {
      console.error('[soroplay] Compilation service error:', error)
      return NextResponse.json(
        { error: 'Failed to reach compilation service' },
        { status: 503 }
      )
    }
  } catch (error) {
    console.error('[soroplay] Compilation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
