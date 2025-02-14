"use client"

import { motion } from "framer-motion"
import { useMemo } from "react"

function FloatingPaths({ position }: { position: number }) {
  const paths = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const startX = -380 - i * 5 * position
      const startY = -189 + i * 8
      const ctrl1X = startX
      const ctrl1Y = startY
      const ctrl2X = -312 - i * 5 * position
      const ctrl2Y = 216 - i * 8
      const endX = 152 - i * 5 * position
      const endY = 343 - i * 8
      const ctrl3X = 616 - i * 5 * position
      const ctrl3Y = 470 - i * 8
      const finalX = 684 - i * 5 * position
      const finalY = 875 - i * 8

      return {
        id: i,
        d: `M${startX} ${startY} C${ctrl1X} ${ctrl1Y} ${ctrl2X} ${ctrl2Y} ${endX} ${endY} C${ctrl3X} ${ctrl3Y} ${finalX} ${finalY} ${finalX} ${finalY}`,
        width: 0.4 + i * 0.02,
      }
    })
  }, [position])

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 696 316" fill="none">
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            strokeWidth={path.width}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 25 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            <animate
              attributeName="stroke"
              values="#4285F4; #34A853; #FBBC05; #EA4335; #4285F4"
              dur="14s"
              repeatCount="indefinite"
            />
          </motion.path>
        ))}
      </svg>
    </div>
  )
}

export default function BackgroundPaths() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>
    </div>
  )
}

