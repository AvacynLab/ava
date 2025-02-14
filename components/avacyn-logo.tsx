"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"

class TextScramble {
  el: HTMLElement
  chars: string
  queue: Array<{
    from: string
    to: string
    start: number
    end: number
    char?: string
  }>
  frame: number
  frameRequest: number
  resolve: (value: void | PromiseLike<void>) => void

  constructor(el: HTMLElement) {
    this.el = el
    this.chars = "!<>-_\\/[]{}—=+*^?#"
    this.queue = []
    this.frame = 0
    this.frameRequest = 0
    this.resolve = () => {}
    this.update = this.update.bind(this)
  }

  setText(newText: string) {
    const oldText = this.el.innerText
    const length = Math.max(oldText.length, newText.length)
    const promise = new Promise<void>((resolve) => (this.resolve = resolve))
    this.queue = []

    for (let i = 0; i < length; i++) {
      const from = oldText[i] || ""
      const to = newText[i] || ""
      const start = Math.floor(Math.random() * 40)
      const end = start + Math.floor(Math.random() * 40)
      this.queue.push({ from, to, start, end })
    }

    cancelAnimationFrame(this.frameRequest)
    this.frame = 0
    this.update()
    return promise
  }

  update() {
    let output = ""
    let complete = 0

    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i]
      if (this.frame >= end) {
        complete++
        output += to
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)]
          this.queue[i].char = char
        }
        output += `<span class="dud">${char}</span>`
      } else {
        output += from
      }
    }

    this.el.innerHTML = output
    if (complete === this.queue.length) {
      this.resolve()
    } else {
      this.frameRequest = requestAnimationFrame(this.update)
      this.frame++
    }
  }
}

const AvacynLogo: React.FC = () => {
  const elementRef = useRef<HTMLHeadingElement>(null)
  const scramblerRef = useRef<TextScramble | null>(null)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    if (elementRef.current && !scramblerRef.current) {
      scramblerRef.current = new TextScramble(elementRef.current)
    }
  }, [])

  useEffect(() => {
    const scrambler = scramblerRef.current
    if (!scrambler) return

    const animateLogo = () => {
      scrambler.setText("Avacyn").then(() => {
        setTimeout(() => {
          if (!isHovering) {
            scrambler.setText("Avacyn")
          }
        }, 5000)
      })
    }

    animateLogo()
    const interval = setInterval(animateLogo, 10000)

    return () => clearInterval(interval)
  }, [isHovering])

  const handleMouseEnter = () => {
    setIsHovering(true)
    scramblerRef.current?.setText("Avacyn")
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
  }

  return (
    <h1
      ref={elementRef}
      className="text-foreground text-2xl font-semibold tracking-wider"
      style={{ fontFamily: "monospace" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      Avacyn
    </h1>
  )
}

export default AvacynLogo

