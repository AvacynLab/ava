"use client"

import { useRef, useEffect, useState } from "react"

interface SquaresProps {
  direction?: "right" | "left" | "up" | "down" | "diagonal"
  speed?: number
  squareSize?: number
  borderColor?: string
  hoverFillColor?: string
  className?: string
}

export function Squares({
  direction = "right",
  speed = 1,
  squareSize = 40,
  borderColor = "var(--border)",
  hoverFillColor = "rgba(var(--foreground), 0.1)",
  className,
}: SquaresProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const requestRef = useRef<number>()
  const numSquaresX = useRef<number>()
  const numSquaresY = useRef<number>()
  const gridOffset = useRef({ x: 0, y: 0 })
  const [hoveredSquare, setHoveredSquare] = useState<{
    x: number
    y: number
  } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Get the computed styles
    const computedStyle = getComputedStyle(document.documentElement)
    const backgroundColor = computedStyle.getPropertyValue("--background").trim()

    // Use the borderColor prop instead of getting it from CSS variables
    // const borderColor = computedStyle.getPropertyValue("--border").trim()

    // Convert HSL to RGB
    const hslToRgb = (h: number, s: number, l: number) => {
      s /= 100
      l /= 100
      const k = (n: number) => (n + h / 30) % 12
      const a = s * Math.min(l, 1 - l)
      const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
      return [255 * f(0), 255 * f(8), 255 * f(4)]
    }

    // Parse HSL values
    const parseHsl = (hslString: string) => {
      const [h, s, l] = hslString.match(/\d+/g)!.map(Number)
      return hslToRgb(h, s, l)
    }

    const bgRgb = parseHsl(backgroundColor)
    // const borderRgb = parseHsl(borderColor)

    // Set canvas background
    canvas.style.background = `rgb(${bgRgb.join(",")})`

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      numSquaresX.current = Math.ceil(canvas.width / squareSize) + 1
      numSquaresY.current = Math.ceil(canvas.height / squareSize) + 1
    }

    window.addEventListener("resize", resizeCanvas)
    resizeCanvas()

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const startX = Math.floor(gridOffset.current.x / squareSize) * squareSize - squareSize
      const startY = Math.floor(gridOffset.current.y / squareSize) * squareSize - squareSize

      ctx.lineWidth = 0.5

      for (let x = startX; x < canvas.width + squareSize; x += squareSize) {
        for (let y = startY; y < canvas.height + squareSize; y += squareSize) {
          const squareX = x - (gridOffset.current.x % squareSize)
          const squareY = y - (gridOffset.current.y % squareSize)

          if (
            hoveredSquare &&
            Math.floor((x - startX) / squareSize) === hoveredSquare.x &&
            Math.floor((y - startY) / squareSize) === hoveredSquare.y
          ) {
            ctx.fillStyle = hoverFillColor
            ctx.fillRect(squareX, squareY, squareSize, squareSize)
          }

          ctx.strokeStyle = borderColor
          ctx.strokeRect(squareX, squareY, squareSize, squareSize)
        }
      }
    }

    const updateAnimation = () => {
      const effectiveSpeed = Math.max(speed, 0.1)

      switch (direction) {
        case "right":
          gridOffset.current.x += effectiveSpeed
          break
        case "left":
          gridOffset.current.x -= effectiveSpeed
          break
        case "up":
          gridOffset.current.y -= effectiveSpeed
          break
        case "down":
          gridOffset.current.y += effectiveSpeed
          break
        case "diagonal":
          gridOffset.current.x += effectiveSpeed
          gridOffset.current.y += effectiveSpeed
          break
      }

      // Ensure the offset stays within the square size
      gridOffset.current.x = gridOffset.current.x % squareSize
      gridOffset.current.y = gridOffset.current.y % squareSize

      drawGrid()
      requestRef.current = requestAnimationFrame(updateAnimation)
    }

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top

      const hoveredSquareX = Math.floor((mouseX + gridOffset.current.x) / squareSize)
      const hoveredSquareY = Math.floor((mouseY + gridOffset.current.y) / squareSize)

      setHoveredSquare({ x: hoveredSquareX, y: hoveredSquareY })
    }

    const handleMouseLeave = () => {
      setHoveredSquare(null)
    }

    // Event listeners
    window.addEventListener("resize", resizeCanvas)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseleave", handleMouseLeave)

    // Initial setup
    resizeCanvas()
    requestRef.current = requestAnimationFrame(updateAnimation)

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [direction, speed, hoverFillColor, squareSize, hoveredSquare, borderColor])

  return <canvas ref={canvasRef} className={`w-full h-full border-none block ${className}`} />
}

