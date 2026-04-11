'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/lib/stores/editorStore'

interface FunctionInvokerProps {
  wasmBinary: ArrayBuffer
  onClose: () => void
}

export default function FunctionInvoker({ wasmBinary, onClose }: FunctionInvokerProps) {
  const detectedFunctions = useEditorStore((state) => state.detectedFunctions)
  const [selectedFunction, setSelectedFunction] = useState<string>(
    detectedFunctions[0]?.name || 'hello'
  )
  const [params, setParams] = useState<Record<string, string>>({})
  const [isExecuting, setIsExecuting] = useState(false)
  const setExecuteOutput = useEditorStore((state) => state.setExecuteOutput)

  // Use detected functions or fallback to defaults
  const availableFunctions = useMemo(() => {
    return detectedFunctions.length > 0
      ? detectedFunctions.map((fn) => ({
          name: fn.name,
          label: `${fn.name}(${fn.params.map((p) => p.name).join(', ')})`,
          params: fn.params,
        }))
      : [
          { name: 'hello', label: 'hello()', params: [] },
          { name: 'greet', label: 'greet(name)', params: [{ name: 'name', type: 'string' }] },
        ]
  }, [detectedFunctions])

  const currentFunction = availableFunctions.find((f) => f.name === selectedFunction) || availableFunctions[0]

  const handleExecute = async () => {
    // Validate parameters
    const fn = availableFunctions.find((f) => f.name === selectedFunction)
    if (!fn) {
      setExecuteOutput('Selected function not found')
      return
    }

    // Check required parameters
    const emptyParams = fn.params.filter((p) => !params[p.name])
    if (emptyParams.length > 0) {
      setExecuteOutput(
        `Error: Missing required parameters: ${emptyParams.map((p) => p.name).join(', ')}`
      )
      return
    }

    setIsExecuting(true)
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wasmBinary: Array.from(new Uint8Array(wasmBinary)),
          functionName: selectedFunction,
          params: params,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        setExecuteOutput(`Execution failed: ${data.error}`)
      } else {
        const output = `Function: ${data.functionName}\nResult: ${data.result}\nExecution Time: ${data.executionTime}ms`
        setExecuteOutput(output)
      }
    } catch (error) {
      setExecuteOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="max-h-80 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Function Invocation</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">Select Function</label>
        <select
          value={selectedFunction}
          onChange={(e) => {
            setSelectedFunction(e.target.value)
            setParams({})
          }}
          className="w-full rounded border border-border bg-card px-3 py-2 text-sm text-foreground"
        >
          {availableFunctions.map((fn) => (
            <option key={fn.name} value={fn.name} className="bg-card">
              {fn.label}
            </option>
          ))}
        </select>
      </div>

      {currentFunction.params.length > 0 && (
        <div className="space-y-3">
          {currentFunction.params.map((param) => (
            <div key={param.name} className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">{param.name}</label>
              <input
                type="text"
                value={params[param.name] || ''}
                onChange={(e) => setParams({ ...params, [param.name]: e.target.value })}
                placeholder={`Enter ${param.type}`}
                className="w-full rounded border border-border bg-card px-3 py-2 text-sm text-foreground placeholder-muted-foreground"
              />
            </div>
          ))}
        </div>
      )}

      <Button
        onClick={handleExecute}
        disabled={isExecuting}
        className="w-full bg-primary hover:bg-primary/90"
      >
        {isExecuting ? 'Executing...' : 'Execute'}
      </Button>
    </div>
  )
}
