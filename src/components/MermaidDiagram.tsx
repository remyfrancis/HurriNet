'use client'

import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

interface MermaidDiagramProps {
  diagram: string
}

export default function MermaidDiagram({ diagram }: MermaidDiagramProps) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
    })

    if (elementRef.current) {
      mermaid.render('mermaid-diagram', diagram).then(({ svg }) => {
        if (elementRef.current) {
          elementRef.current.innerHTML = svg
        }
      })
    }
  }, [diagram])

  return <div ref={elementRef} className="mermaid-wrapper" />
}