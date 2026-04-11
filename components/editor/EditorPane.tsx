'use client'

import { useEffect, useRef } from 'react'
import { useEditorStore } from '@/lib/stores/editorStore'

declare global {
  interface Window {
    ace?: any
  }
}

export default function EditorPane() {
  const editorRef = useRef<HTMLDivElement>(null)
  const aceEditorRef = useRef<any>(null)
  const code = useEditorStore((state) => state.code)
  const setCode = useEditorStore((state) => state.setCode)

  useEffect(() => {
    // Load Ace editor from CDN
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.31.1/ace.min.js'
    script.async = true
    script.onload = () => {
      if (!editorRef.current) return

      const editor = window.ace.edit(editorRef.current)
      aceEditorRef.current = editor

      editor.setTheme('ace/theme/dracula')
      editor.session.setMode('ace/mode/rust')
      editor.setValue(code)
      editor.clearSelection()

      // Set options
      editor.setOptions({
        fontSize: 14,
        fontFamily: 'Monaco, Menlo, Consolas, "Courier New", monospace',
        showPrintMargin: false,
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: false,
        enableSnippets: false,
      })

      // Update store on change
      editor.session.on('change', () => {
        setCode(editor.getValue())
      })
    }

    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  return (
    <div className="flex flex-1 flex-col border-r border-border">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Contract Code</h2>
      </div>
      <div
        ref={editorRef}
        className="flex-1"
        style={{
          background: 'rgb(40, 42, 54)',
        }}
      />
    </div>
  )
}
