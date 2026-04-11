'use client'

import { useEffect } from 'react'
import { useEditorStore } from '@/lib/stores/editorStore'
import Header from './Header'
import EditorPane from './EditorPane'
import OutputPane from './OutputPane'

export default function EditorLayout() {
  const initializeStore = useEditorStore((state) => state.initialize)

  useEffect(() => {
    // Initialize with a basic Rust contract template
    initializeStore()
  }, [initializeStore])

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header />
      <div className="flex flex-1 overflow-hidden relative">
        <EditorPane />
        <OutputPane />
      </div>
    </div>
  )
}
