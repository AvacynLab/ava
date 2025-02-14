"use client"

import { signIn } from "next-auth/react"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import type React from "react"
import { ShineBorder } from "@/components/ui/shine-border"
import { ShineInput } from "@/components/ui/shine-input"
import { SubmitButton } from "./submit-button"

export function AuthForm({
  action,
  children,
  defaultEmail = "",
  isSuccessful,
}: {
  action: (formData: FormData) => void | Promise<void>
  children: React.ReactNode
  defaultEmail?: string
  isSuccessful: boolean
}) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await action(formData)
  }

  return (
    <div className="flex flex-col gap-3">
      <ShineBorder
        className="w-full"
        color={["#4285F4", "#34A853", "#FBBC05", "#EA4335"]}
        onClick={() => signIn("google", { callbackUrl: "/" })}
      >
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2 transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-sm bg-transparent rounded-sm"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continuer avec Google
        </Button>
      </ShineBorder>

      <ShineBorder
        className="w-full"
        color={["#5865F2", "#57F287", "#FEE75C", "#EB459E"]}
        onClick={() => signIn("discord", { callbackUrl: "/" })}
      >
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2 transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-sm bg-transparent rounded-sm"
          type="button"
        >
          <svg width="24" height="24" viewBox="0 0 127.14 96.36" fill="#5865F2">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
          </svg>
          Continuer avec Discord
        </Button>
      </ShineBorder>

      <ShineBorder
        className="w-full"
        color={["#2DBA4E", "#EA4AAA", "#F1E05A", "#4F5D95"]}
        onClick={() => signIn("github", { callbackUrl: "/" })}
      >
        <Button
          variant="outline"
          className="w-full flex items-center justify-center gap-2 transition-all duration-300 hover:bg-white/10 hover:backdrop-blur-sm bg-transparent rounded-sm"
          type="button"
        >
          <svg width="24" height="24" viewBox="0 0 98 96" fill="#ffffff">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
            />
          </svg>
          Continuer avec GitHub
        </Button>
      </ShineBorder>

      <div className="flex items-center gap-4 my-4">
        <div className="h-[1px] flex-1 bg-border" />
        <span className="text-xs uppercase text-muted-foreground">Ou continuer avec un email</span>
        <div className="h-[1px] flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <ShineInput
            id="email"
            type="email"
            name="email"
            placeholder="nom@example.com"
            defaultValue={defaultEmail}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Mot de passe</Label>
          <ShineInput id="password" type="password" name="password" required />
        </div>
        <div className="flex flex-col gap-4">
          <SubmitButton
            isSuccessful={isSuccessful}
            shineBorderProps={{
              borderRadius: 2,
              borderWidth: 1,
              duration: 14,
              color: ["#4285F4", "#34A853", "#FBBC05", "#EA4335"],
            }}
          >
            {children}
          </SubmitButton>
        </div>
      </form>
    </div>
  )
}

