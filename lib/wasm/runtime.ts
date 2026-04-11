/**
 * WASM Runtime - Executes Soroban contracts in the browser
 */

export interface ContractFunction {
  name: string
  params: Array<{
    name: string
    type: string
  }>
  returnType: string
}

export class WasmRuntime {
  private instance: WebAssembly.Instance | null = null
  private functions: ContractFunction[] = []

  constructor(private wasmBinary: ArrayBuffer) {}

  async initialize(): Promise<void> {
    try {
      const wasmModule = await WebAssembly.instantiate(this.wasmBinary)
      this.instance = wasmModule.instance
      this.extractFunctions()
    } catch (error) {
      throw new Error(`Failed to initialize WASM: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private extractFunctions(): void {
    if (!this.instance?.exports) {
      this.functions = []
      return
    }

    // Extract exported functions from the WASM module
    this.functions = Object.keys(this.instance.exports)
      .filter((name) => typeof this.instance?.exports[name] === 'function')
      .map((name) => ({
        name,
        params: [],
        returnType: 'unknown',
      }))
  }

  async call(functionName: string, ...args: any[]): Promise<any> {
    if (!this.instance?.exports) {
      throw new Error('WASM instance not initialized')
    }

    const fn = this.instance.exports[functionName]
    if (typeof fn !== 'function') {
      throw new Error(`Function '${functionName}' not found in WASM module`)
    }

    try {
      const result = (fn as Function)(...args)
      return result
    } catch (error) {
      throw new Error(
        `Error calling function '${functionName}': ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  getFunctions(): ContractFunction[] {
    return this.functions
  }

  getMemory(): WebAssembly.Memory | undefined {
    return this.instance?.exports.memory as WebAssembly.Memory | undefined
  }
}
