'use client'

import { useEditorStore } from '@/lib/stores/editorStore'
import { Button } from '@/components/ui/button'
import FunctionInvoker from './FunctionInvoker'
import QuickTips from './QuickTips'
import { useState } from 'react'

export default function OutputPane() {
  const executeOutput = useEditorStore((state) => state.executeOutput)
  const compilationError = useEditorStore((state) => state.compilationError)
  const wasmBinary = useEditorStore((state) => state.wasmBinary)
  const wasmSize = useEditorStore((state) => state.wasmSize)
  const detectedFunctions = useEditorStore((state) => state.detectedFunctions)
  const clearOutput = useEditorStore((state) => state.clearOutput)
  const [showInvoker, setShowInvoker] = useState(false)

  const hasOutput = executeOutput.length > 0 || compilationError

  return (
    <div className="flex w-1/3 flex-col border-l border-border">
      <div className="border-b border-border px-4 py-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Output & Execution</h2>
        {hasOutput && (
          <Button variant="ghost" size="sm" onClick={clearOutput}>
            Clear
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {!wasmBinary && !hasOutput && (
          <div className="flex flex-col h-full">
            <div className="flex-1 flex items-start justify-center pt-8">
              <div className="text-center max-w-xs">
                <p className="text-sm text-muted-foreground mb-4">Compile your contract to see output</p>
                <code className="text-xs bg-card p-3 rounded inline-block text-primary">
                  Click "Compile" to get started
                </code>
              </div>
            </div>
            <QuickTips />
          </div>
        )}

        {compilationError && (
          <div className="p-4">
            <div className="rounded bg-destructive/10 p-3 text-sm">
              <p className="font-semibold text-destructive mb-2">Compilation Error</p>
              <pre className="text-xs text-destructive/80 overflow-x-auto whitespace-pre-wrap">
                {compilationError}
              </pre>
            </div>
          </div>
        )}

        {wasmBinary && !compilationError && (
          <div className="p-4 space-y-4">
            <div className="rounded bg-card p-3 border border-border space-y-2">
              <div>
                <p className="text-xs text-muted-foreground mb-1">WASM Binary Size</p>
                <p className="font-mono text-sm">
                  {(wasmSize / 1024).toFixed(2)} KB
                </p>
              </div>

              {detectedFunctions.length > 0 && (
                <div className="border-t border-border pt-2 mt-2">
                  <p className="text-xs text-muted-foreground mb-2">Detected Functions</p>
                  <div className="space-y-1">
                    {detectedFunctions.map((fn) => (
                      <div key={fn.name} className="text-xs text-foreground font-mono">
                        {fn.name}({fn.params.map((p) => `${p.name}: ${p.type}`).join(', ')})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {!showInvoker && detectedFunctions.length > 0 && (
              <Button onClick={() => setShowInvoker(true)} className="w-full bg-primary hover:bg-primary/90">
                Invoke Functions
              </Button>
            )}
          </div>
        )}

        {executeOutput && (
          <div className="p-4 space-y-3">
            <div className="rounded bg-card p-3 border border-border">
              <p className="text-xs text-muted-foreground mb-2">Execution Output</p>
              <pre className="text-xs text-foreground font-mono overflow-x-auto whitespace-pre-wrap break-words">
                {executeOutput}
              </pre>
            </div>
            <div className="text-xs text-muted-foreground text-center">
              Execution completed successfully
            </div>
          </div>
        )}
      </div>

      {showInvoker && wasmBinary && (
        <div className="border-t border-border">
          <FunctionInvoker wasmBinary={wasmBinary} onClose={() => setShowInvoker(false)} />
        </div>
      )}
    </div>
  )
}
