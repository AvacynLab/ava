"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { motion } from "framer-motion"

import { AuthForm } from "@/components/auth-form"
import BackgroundPaths from "@/components/ui/background-paths"
import { ShineBorder } from "@/components/ui/shine-border"
import ScrambledTitle from "@/components/ui/flickering-letter"

import { register, type RegisterActionState } from "../actions"

export default function Page() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isSuccessful, setIsSuccessful] = useState(false)

  const [state, formAction] = useActionState<RegisterActionState, FormData>(register, {
    status: "idle",
  } as RegisterActionState)

  useEffect(() => {
    if (state.status === "user_exists") {
      toast.error("Ce compte existe déjà")
    } else if (state.status === "failed") {
      toast.error("Échec de la création du compte")
    } else if (state.status === "invalid_data") {
      toast.error("Échec de la validation de votre soumission !")
    } else if (state.status === "success") {
      toast.success("Compte créé avec succès")
      setIsSuccessful(true)
      router.refresh()
    }
  }, [state, router])

  const handleSubmit = async (formData: FormData) => {
    setEmail(formData.get("email") as string)
    await formAction(formData)
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <BackgroundPaths />

      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <ShineBorder
          className="absolute w-[442px] bg-background"
          color={["#4285F4", "#34A853", "#FBBC05", "#EA4335"]}
          borderWidth={1}
          duration={14}
          borderRadius={2}
          alwaysAnimate={true}
          passThrough={true}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full px-6 py-8"
          >
            <div className="flex flex-col gap-12">
              <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <ScrambledTitle
                    phrases={["Bienvenue", "Rejoignez-nous", "Créez votre compte", "Inscription rapide", "S'inscrire"]}
                  />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-sm text-muted-foreground"
                >
                  Créez un compte avec votre email et votre mot de passe
                </motion.p>
              </div>
              <AuthForm action={handleSubmit} defaultEmail={email} isSuccessful={isSuccessful}>
                S'inscrire
              </AuthForm>
              <p className="text-center text-sm text-muted-foreground">
                Vous avez déjà un compte ?{" "}
                <Link href="/login" className="font-semibold text-foreground hover:underline">
                  Se connecter
                </Link>
                .
              </p>
            </div>
          </motion.div>
        </ShineBorder>
      </div>
    </div>
  )
}

