'use client'

import { useEffect, useRef } from 'react'
import { useEditorStore } from '@/lib/stores/editorStore'

declare global {
  interface Window {
    // Ace is loaded from a CDN and ships no types here, so it is untyped.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ace?: any
  }
}

const ACE_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.31.1/ace.min.js'

export default function EditorPane() {
  const editorRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- untyped Ace instance
  const aceEditorRef = useRef<any>(null)
  const code = useEditorStore((state) => state.code)
  const setCode = useEditorStore((state) => state.setCode)

  useEffect(() => {
    let cancelled = false

    const initEditor = () => {
      if (cancelled || !editorRef.current || aceEditorRef.current) return

      const editor = window.ace.edit(editorRef.current)
      aceEditorRef.current = editor

      editor.setTheme('ace/theme/dracula')
      editor.session.setMode('ace/mode/rust')
      // Read the latest code from the store to avoid a stale closure value.
      editor.setValue(useEditorStore.getState().code, -1)

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

    // Reuse the CDN script across mounts instead of re-injecting it.
    if (window.ace) {
      initEditor()
    } else {
      let script = document.querySelector<HTMLScriptElement>(`script[src="${ACE_CDN}"]`)
      if (!script) {
        script = document.createElement('script')
        script.src = ACE_CDN
        script.async = true
        document.head.appendChild(script)
      }
      script.addEventListener('load', initEditor)
    }

    return () => {
      cancelled = true
      aceEditorRef.current?.destroy()
      aceEditorRef.current = null
    }
  }, [setCode])

  // Push external code changes (e.g. loading an example) into the editor.
  // Guarded so we only setValue when it actually differs, avoiding a loop
  // with the editor's own change handler.
  useEffect(() => {
    const editor = aceEditorRef.current
    if (editor && editor.getValue() !== code) {
      editor.setValue(code, -1)
    }
  }, [code])

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
