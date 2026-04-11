'use client'

import { useState } from 'react'
import { useEditorStore } from '@/lib/stores/editorStore'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/lib/stores/uiStore'
import ExamplesSidebar from './ExamplesSidebar'

export default function Header() {
  const [showExamples, setShowExamples] = useState(false)
  const isCompiling = useEditorStore((state) => state.isCompiling)
  const compilationError = useEditorStore((state) => state.compilationError)
  const setIsCompiling = useEditorStore((state) => state.setIsCompiling)
  const code = useEditorStore((state) => state.code)
  const clearOutput = useEditorStore((state) => state.clearOutput)
  const setUIMessage = useUIStore((state) => state.setMessage)

  const setWasmBinary = useEditorStore((state) => state.setWasmBinary)
  const setCompilationError = useEditorStore((state) => state.setCompilationError)

  const handleCompile = async () => {
    clearOutput()
    setIsCompiling(true)
    setCompilationError(null)
    try {
      const response = await fetch('/api/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()
      if (!response.ok) {
        setCompilationError(data.error || 'Compilation failed')
        setUIMessage(`Compilation failed: ${data.error}`, 'error')
      } else {
        // Convert array to ArrayBuffer
        const binary = new Uint8Array(data.wasmBinary).buffer
        setWasmBinary(binary, data.size, data.functions)
        setCompilationError(null)
        setUIMessage('Compilation successful!', 'success')
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      setCompilationError(errorMsg)
      setUIMessage(`Error: ${errorMsg}`, 'error')
    } finally {
      setIsCompiling(false)
    }
  }

  return (
    <>
      <header className="border-b border-border bg-card px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">SoroPlay</h1>
            <p className="text-sm text-muted-foreground">Learn Soroban Smart Contracts</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowExamples(true)}
              variant="outline"
              className="border-border hover:bg-card/80"
            >
              Examples
            </Button>

            {compilationError && (
              <div className="flex items-center gap-2 rounded bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <span className="font-medium">Error</span>
              </div>
            )}

            <Button
              onClick={handleCompile}
              disabled={isCompiling}
              className="bg-primary hover:bg-primary/90"
              size="lg"
            >
              {isCompiling ? 'Compiling...' : 'Compile'}
            </Button>
          </div>
        </div>
      </header>
      <ExamplesSidebar isOpen={showExamples} onClose={() => setShowExamples(false)} />
    </>
  )
}
