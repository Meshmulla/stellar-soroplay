import { create } from 'zustand'
import type { DetectedFunction } from '@/lib/utils/contractDetector'

export const DEFAULT_CONTRACT = `#[soroban_contract]
pub mod hello_contract {
    use soroban_sdk::{contract, contractimpl, log, Env, String};

    #[contract]
    pub struct HelloContract;

    #[contractimpl]
    impl HelloContract {
        /// Returns "Hello, World!"
        pub fn hello(env: Env) -> String {
            log!(&env, "Hello, World!");
            String::from_slice(&env, "Hello, World!")
        }

        /// Returns greeting for a name
        pub fn greet(env: Env, name: String) -> String {
            log!(&env, "Greeting {}", &name);
            let greeting = String::from_slice(&env, "Hello, ");
            greeting.concat(&name)
        }
    }
}
`

interface EditorState {
  code: string
  isCompiling: boolean
  compilationError: string | null
  wasmBinary: ArrayBuffer | null
  wasmSize: number
  detectedFunctions: DetectedFunction[]
  executeOutput: string
  setCode: (code: string) => void
  setIsCompiling: (compiling: boolean) => void
  setCompilationError: (error: string | null) => void
  setWasmBinary: (binary: ArrayBuffer | null, size?: number, functions?: DetectedFunction[]) => void
  setExecuteOutput: (output: string) => void
  clearOutput: () => void
  initialize: () => void
}

export const useEditorStore = create<EditorState>((set) => ({
  code: DEFAULT_CONTRACT,
  isCompiling: false,
  compilationError: null,
  wasmBinary: null,
  wasmSize: 0,
  detectedFunctions: [],
  executeOutput: '',
  setCode: (code) => set({ code }),
  setIsCompiling: (isCompiling) => set({ isCompiling }),
  setCompilationError: (compilationError) => set({ compilationError }),
  setWasmBinary: (wasmBinary, size = 0, functions = []) =>
    set({ wasmBinary, wasmSize: size || 0, detectedFunctions: functions }),
  setExecuteOutput: (executeOutput) => set({ executeOutput }),
  clearOutput: () => set({ executeOutput: '' }),
  initialize: () =>
    set({
      code: DEFAULT_CONTRACT,
      executeOutput: '',
      compilationError: null,
      detectedFunctions: [],
    }),
}))
