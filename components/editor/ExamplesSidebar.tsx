'use client'

import { useState } from 'react'
import { CONTRACT_EXAMPLES } from '@/lib/examples/contracts'
import { useEditorStore } from '@/lib/stores/editorStore'
import { Button } from '@/components/ui/button'

interface ExamplesSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function ExamplesSidebar({ isOpen, onClose }: ExamplesSidebarProps) {
  const [selectedExample, setSelectedExample] = useState<string | null>(null)
  const setCode = useEditorStore((state) => state.setCode)
  const resetResults = useEditorStore((state) => state.resetResults)

  const handleLoadExample = (exampleId: string) => {
    const example = CONTRACT_EXAMPLES.find((ex) => ex.id === exampleId)
    if (example) {
      // Clear stale results first, THEN set the code — resetResults leaves
      // the code untouched, so the loaded example survives.
      resetResults()
      setCode(example.code)
      setSelectedExample(exampleId)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="flex-1 bg-black/50"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="w-80 bg-card border-l border-border shadow-lg flex flex-col max-h-screen overflow-hidden">
        <div className="border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Example Contracts</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {CONTRACT_EXAMPLES.map((example) => (
            <div
              key={example.id}
              className={`rounded-lg border p-3 cursor-pointer transition-all ${
                selectedExample === example.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50 hover:bg-card/80'
              }`}
            >
              <div className="mb-2">
                <h3 className="font-semibold text-sm">{example.title}</h3>
                <p className="text-xs text-muted-foreground">{example.description}</p>
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    example.difficulty === 'beginner'
                      ? 'bg-green-500/20 text-green-400'
                      : example.difficulty === 'intermediate'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {example.difficulty}
                </span>
                <Button
                  size="sm"
                  onClick={() => handleLoadExample(example.id)}
                  className="text-xs h-7 bg-primary hover:bg-primary/90"
                >
                  Load
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-border p-4 bg-card/50">
          <p className="text-xs text-muted-foreground text-center">
            Click "Load" to open an example contract
          </p>
        </div>
      </div>
    </div>
  )
}
