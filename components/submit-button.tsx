"use client"

import { Loader2, ArrowRight } from "lucide-react"
import { useFormStatus } from "react-dom"
import { ShineBorder } from "@/components/ui/shine-border"
import type React from "react"

interface SubmitButtonProps {
  children: React.ReactNode
  isSuccessful: boolean
  shineBorderProps?: {
    borderRadius?: number
    borderWidth?: number
    duration?: number
    color?: string | string[]
  }
}

export function SubmitButton({
  children,
  isSuccessful,
  shineBorderProps = {
    borderRadius: 2,
    borderWidth: 1,
    duration: 14,
    color: ["#4285F4", "#34A853", "#FBBC05", "#EA4335"],
  },
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button type="submit" className="w-full" disabled={pending || isSuccessful} aria-disabled={pending || isSuccessful}>
      <ShineBorder className="w-full h-full disabled:opacity-50" {...shineBorderProps}>
        <span className="w-full h-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-border">
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Chargement
            </>
          ) : isSuccessful ? (
            "Succès !"
          ) : (
            <>
              {children}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </span>
      </ShineBorder>
      <output aria-live="polite" className="sr-only">
        {pending || isSuccessful ? "Chargement" : "Soumettre le formulaire"}
      </output>
    </button>
  )
}

