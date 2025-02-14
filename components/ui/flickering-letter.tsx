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

interface ScrambledTitleProps {
  phrases: string[]
}

const ScrambledTitle: React.FC<ScrambledTitleProps> = ({ phrases }) => {
  const elementRef = useRef<HTMLHeadingElement>(null)
  const scramblerRef = useRef<TextScramble | null>(null)
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)

  useEffect(() => {
    if (elementRef.current && !scramblerRef.current) {
      scramblerRef.current = new TextScramble(elementRef.current)
    }
  }, [])

  useEffect(() => {
    const scrambler = scramblerRef.current
    if (!scrambler) return

    const animateNextPhrase = () => {
      if (currentPhraseIndex < phrases.length) {
        scrambler.setText(phrases[currentPhraseIndex]).then(() => {
          if (currentPhraseIndex < phrases.length - 1) {
            setTimeout(
              () => {
                setCurrentPhraseIndex((prevIndex) => prevIndex + 1)
              },
              currentPhraseIndex === phrases.length - 2 ? 3000 : 2000,
            ) // Longer delay before the last phrase
          }
        })
      }
    }

    animateNextPhrase()
  }, [currentPhraseIndex, phrases])

  return (
    <h1
      ref={elementRef}
      className="text-foreground text-3xl font-semibold tracking-wider justify-center"
      style={{ fontFamily: "monospace" }}
    >
      {phrases[0]}
    </h1>
  )
}

export default ScrambledTitle

