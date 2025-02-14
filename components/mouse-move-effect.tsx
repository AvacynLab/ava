"use client"

import { useRef } from "react"
import { useMousePosition } from "@/hooks/use-mouse-position"

export default function MouseMoveEffect() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { x, y } = useMousePosition(containerRef)

  return (
    <div ref={containerRef} className="pointer-events-none fixed inset-0 z-30">
      <div
        className="absolute w-px h-screen bg-foreground/5 top-0 -translate-x-1/2"
        style={{
          left: `${x}px`,
        }}
      />
      <div
        className="absolute w-screen h-px bg-foreground/5 left-0 -translate-y-1/2"
        style={{
          top: `${y}px`,
        }}
      />
      <div
        className="absolute w-1 h-1 bg-blue-500 -translate-x-1/2 -translate-y-1/2"
        style={{
          top: `${y}px`,
          left: `${x}px`,
        }}
      />
      <div className="absolute bottom-8 left-8 flex flex-col font-mono">
        <span className="text-xs text-foreground/40 tabular-nums">x: {Math.round(x)}</span>
        <span className="text-xs text-foreground/40 tabular-nums">y: {Math.round(y)}</span>
      </div>
    </div>
  )
}

