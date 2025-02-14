"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import type { InputProps } from "@/components/ui/input"

interface ShineInputProps extends Omit<InputProps, "color"> {
  color?: string | string[]
  borderWidth?: number
  duration?: number
}

export const ShineInput = React.forwardRef<HTMLInputElement, ShineInputProps>(
  (
    { className, color = ["#4285F4", "#34A853", "#FBBC05", "#EA4335"], borderWidth = 1, duration = 8, ...props },
    ref,
  ) => {
    const [isFocused, setIsFocused] = React.useState(false)

    return (
      <div className="relative w-full min-w-0">
        <Input
          ref={ref}
          className={cn(
            "relative bg-transparent backdrop-blur-none border border-border rounded-sm ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
            className,
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        <div
          style={
            {
              "--border-width": `${borderWidth}px`,
              "--border-radius": "0.125rem",
              "--duration": `${duration}s`,
              "--mask-linear-gradient": "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              "--background-radial-gradient": `radial-gradient(transparent,transparent, ${
                color instanceof Array ? color.join(",") : color
              },transparent,transparent)`,
            } as React.CSSProperties
          }
          className={cn(
            "absolute inset-0 pointer-events-none",
            "before:absolute before:inset-0",
            "before:rounded-[--border-radius]",
            "before:p-[--border-width]",
            "before:![-webkit-mask-composite:xor]",
            "before:![mask-composite:exclude]",
            "before:[background-image:--background-radial-gradient]",
            "before:[background-size:300%_300%]",
            "before:[mask:--mask-linear-gradient]",
            "before:opacity-0 before:transition-opacity before:duration-300",
            isFocused && "before:opacity-100",
            "motion-safe:before:animate-shine",
          )}
        />
      </div>
    )
  },
)
ShineInput.displayName = "ShineInput"

