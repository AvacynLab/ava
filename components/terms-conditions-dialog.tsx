"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRef, useState } from "react"

export function TermsConditionsDialog() {
  const [hasReadToBottom, setHasReadToBottom] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const handleScroll = () => {
    const scrollArea = scrollAreaRef.current
    if (!scrollArea) return

    const scrollContainer = scrollArea.querySelector("[data-radix-scroll-area-viewport]")
    if (!scrollContainer) return

    const { scrollTop, scrollHeight, clientHeight } = scrollContainer
    const scrollPercentage = scrollTop / (scrollHeight - clientHeight)
    if (scrollPercentage >= 0.99 && !hasReadToBottom) {
      setHasReadToBottom(true)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="text-xs text-muted-foreground hover:text-primary">
          Conditions générales
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-lg [&>button:last-child]:hidden">
        <ScrollArea ref={scrollAreaRef} className="flex max-h-full flex-col" onScrollCapture={handleScroll}>
          <DialogHeader className="contents space-y-0 text-left">
            <DialogTitle className="border-b border-border px-6 py-4 text-base">Conditions générales</DialogTitle>
            <DialogDescription asChild>
              <div className="px-6 py-4">
                <div className="space-y-4 [&_strong]:font-semibold [&_strong]:text-foreground">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p>
                        <strong>Acceptation des conditions</strong>
                      </p>
                      <p>
                        En accédant et en utilisant ce site web, les utilisateurs acceptent de se conformer et d'être
                        liés par ces conditions d'utilisation. Les utilisateurs qui ne sont pas d'accord avec ces
                        conditions doivent cesser immédiatement d'utiliser le site web.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p>
                        <strong>Responsabilités du compte utilisateur</strong>
                      </p>
                      <p>
                        Les utilisateurs sont responsables de la confidentialité de leurs identifiants de compte. Toute
                        activité se produisant sous le compte d'un utilisateur relève de la seule responsabilité du
                        titulaire du compte. Les utilisateurs doivent informer immédiatement les administrateurs du site
                        web de tout accès non autorisé à leur compte.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p>
                        <strong>Utilisation et restrictions du contenu</strong>
                      </p>
                      <p>
                        Le site web et son contenu original sont protégés par les lois sur la propriété intellectuelle.
                        Les utilisateurs ne peuvent pas reproduire, distribuer, modifier, créer des œuvres dérivées ou
                        exploiter commercialement tout contenu sans l'autorisation écrite explicite des propriétaires du
                        site web.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p>
                        <strong>Limitation de responsabilité</strong>
                      </p>
                      <p>
                        Le site web fournit du contenu "tel quel" sans aucune garantie. Les propriétaires du site web ne
                        peuvent être tenus responsables des dommages directs, indirects, accessoires, consécutifs ou
                        punitifs découlant des interactions des utilisateurs avec la plateforme.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p>
                        <strong>Directives de conduite des utilisateurs</strong>
                      </p>
                      <ul className="list-disc pl-6">
                        <li>Ne pas télécharger de contenu nuisible ou malveillant</li>
                        <li>Respecter les droits des autres utilisateurs</li>
                        <li>Éviter les activités qui pourraient perturber le fonctionnement du site web</li>
                        <li>Se conformer aux lois locales et internationales applicables</li>
                      </ul>
                    </div>

                    <div className="space-y-1">
                      <p>
                        <strong>Modifications des conditions</strong>
                      </p>
                      <p>
                        Le site web se réserve le droit de modifier ces conditions à tout moment. L'utilisation continue
                        du site web après les modifications constitue une acceptation des nouvelles conditions.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p>
                        <strong>Clause de résiliation</strong>
                      </p>
                      <p>
                        Le site web peut résilier ou suspendre l'accès des utilisateurs sans préavis pour violation de
                        ces conditions ou pour toute autre raison jugée appropriée par l'administration.
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p>
                        <strong>Loi applicable</strong>
                      </p>
                      <p>
                        Ces conditions sont régies par les lois de la juridiction où le site web est principalement
                        exploité, sans égard aux principes de conflit de lois.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-t border-border px-6 py-4 sm:items-center">
            {!hasReadToBottom && (
              <span className="grow text-xs text-muted-foreground max-sm:text-center">
                Lisez toutes les conditions avant d'accepter.
              </span>
            )}
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="button" disabled={!hasReadToBottom}>
                J'accepte
              </Button>
            </DialogClose>
          </DialogFooter>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

