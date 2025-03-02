"use client"

import { useRef, useEffect } from "react"
import { Bold, Italic, List, ListOrdered, Underline } from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function RichTextEditor({ value, onChange, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      const selection = window.getSelection()
      const range = selection?.getRangeAt(0)
      const start = range?.startOffset
      const end = range?.endOffset

      editorRef.current.innerHTML = value

      if (selection && range && editorRef.current.firstChild) {
        const newRange = document.createRange()
        newRange.setStart(editorRef.current.firstChild, start || 0)
        newRange.setEnd(editorRef.current.firstChild, end || 0)
        selection.removeAllRanges()
        selection.addRange(newRange)
      }
    }
  }, [value])

  const handleFormat = (command: string, value?: string) => {
    if (editorRef.current) {
      document.execCommand(command, false, value)
      const newContent = editorRef.current.innerHTML
      onChange(newContent)
    }
  }

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerHTML
    if (newContent !== value) {
      onChange(newContent)
    }
  }

  return (
    <div className={cn("rounded-md border", className)}>
      <div className="flex items-center gap-1 border-b bg-muted/50 p-1">
        <Toggle size="sm" onClick={() => handleFormat("bold")} aria-label="Toggle bold">
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" onClick={() => handleFormat("italic")} aria-label="Toggle italic">
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" onClick={() => handleFormat("underline")} aria-label="Toggle underline">
          <Underline className="h-4 w-4" />
        </Toggle>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Toggle size="sm" onClick={() => handleFormat("insertUnorderedList")} aria-label="Toggle bullet list">
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle size="sm" onClick={() => handleFormat("insertOrderedList")} aria-label="Toggle numbered list">
          <ListOrdered className="h-4 w-4" />
        </Toggle>
      </div>
      <div
        ref={editorRef}
        className="min-h-[150px] px-3 py-2 text-sm"
        contentEditable
        onInput={handleInput}
        suppressContentEditableWarning
        style={{ outline: "none" }}
        dir="ltr"
      />
    </div>
  )
}

