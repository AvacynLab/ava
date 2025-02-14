"use client"

import { cn } from "@/lib/utils"
import type React from "react"

type TColorProp = string | string[]

interface ShineBorderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  borderRadius?: number
  borderWidth?: number
  duration?: number
  color?: TColorProp
  className?: string
  children: React.ReactNode
  alwaysAnimate?: boolean
  passThrough?: boolean // Nouvelle prop
}

export function ShineBorder({
  borderRadius = 2,
  borderWidth = 1,
  duration = 14,
  color = "#000000",
  className,
  children,
  alwaysAnimate = false,
  passThrough = false, // Nouvelle prop avec false comme valeur par défaut
  ...props
}: ShineBorderProps) {
  return (
    <div
      style={
        {
          "--border-radius": `${borderRadius}px`,
          "--border-width": `${borderWidth}px`,
          "--duration": `${duration}s`,
          "--mask-linear-gradient": "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          "--background-radial-gradient": `radial-gradient(transparent,transparent, ${
            color instanceof Array ? color.join(",") : color
          },transparent,transparent)`,
        } as React.CSSProperties
      }
      className={cn(
        "relative w-full min-w-0 rounded-[--border-radius]",
        "before:absolute before:inset-0",
        "before:rounded-[--border-radius]",
        "before:p-[--border-width]",
        alwaysAnimate ? "before:opacity-100" : "before:opacity-0 hover:before:opacity-100",
        "before:transition-opacity before:duration-300",
        "before:![-webkit-mask-composite:xor]",
        "before:![mask-composite:exclude]",
        "before:[background-image:--background-radial-gradient]",
        "before:[background-size:300%_300%]",
        "before:[mask:--mask-linear-gradient]",
        alwaysAnimate ? "motion-safe:before:animate-shine" : "motion-safe:hover:before:animate-shine",
        passThrough && "pointer-events-none", // Ajoutez cette classe conditionnellement
        className,
      )}
      {...props}
    >
      <div className={passThrough ? "pointer-events-auto" : ""}>{children}</div>
    </div>
  )
}

