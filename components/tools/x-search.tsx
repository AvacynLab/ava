import React, { memo } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Twitter } from "lucide-react";
import { motion } from "framer-motion";
import { Tweet } from "react-tweet";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

// Composant d'état de chargement pour x_search
interface SearchLoadingStateProps {
  icon: React.ElementType;
  text: string;
  color: "red" | "green" | "orange" | "violet" | "gray" | "blue";
}
const SearchLoadingState: React.FC<SearchLoadingStateProps> = ({
  icon: Icon,
  text,
  color,
}) => {
  // Définition d'une variante pour "gray" (on peut ajouter d'autres couleurs si besoin)
  const colorVariants: Record<string, { background: string; border: string; text: string; icon: string }> = {
    gray: {
      background: "bg-neutral-50 dark:bg-neutral-950",
      border: "from-neutral-200 via-neutral-500 to-neutral-200 dark:from-neutral-400 dark:via-neutral-500 dark:to-neutral-700",
      text: "text-neutral-500",
      icon: "text-neutral-500",
    },
    // Autres variantes peuvent être ajoutées ici...
  };
  const variant = colorVariants[color] || colorVariants.gray;

  return (
    <Card className="relative w-full my-4 h-[100px] overflow-hidden shadow-none">
      {/* Effet de bordure simulé (remplace ici BorderTrail) */}
      <div className={`border-t-4 ${variant.border}`} />
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`relative h-10 w-10 rounded-full flex items-center justify-center ${variant.background}`}>
              <Twitter className={`h-5 w-5 ${variant.icon}`} />
            </div>
            <div className="space-y-2">
              <p className={`text-base font-medium ${variant.text}`}>{text}</p>
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse"
                    style={{
                      width: `${Math.random() * 40 + 20}px`,
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

interface XResult {
  tweetId: string;
  // autres propriétés...
}

interface XSearchResultProps {
  result: XResult[] | null;
}

const XSearchResult: React.FC<XSearchResultProps> = ({ result }) => {
  const PREVIEW_COUNT = 3;

  if (!result) {
    return (
      <SearchLoadingState
        icon={Twitter}
        text="Searching for latest news..."
        color="gray"
      />
    );
  }

  const FullTweetList = React.memo(() => (
    <div className="grid gap-4 p-4">
      {result.map((post, index) => (
        <motion.div
          key={post.tweetId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Tweet id={post.tweetId} />
        </motion.div>
      ))}
    </div>
  ));

  return (
    <Card className="w-full my-4 overflow-hidden shadow-none">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Utilisation de Twitter pour conserver l'identité visuelle */}
          <div className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
            <Twitter className="h-4 w-4" />
          </div>
          <div>
            <CardTitle>Latest from X</CardTitle>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {result.length} tweets found
            </p>
          </div>
        </div>
      </CardHeader>
      <div className="relative">
        <div className="px-4 pb-2 h-72">
          {/* Largeur responsive : utilisation de min(100vw-2rem,320px) et ajout de no-scrollbar */}
          <div className="flex flex-nowrap overflow-x-auto gap-4 no-scrollbar">
            {result.slice(0, PREVIEW_COUNT).map((post, index) => (
              <motion.div
                key={post.tweetId}
                className="w-[min(100vw-2rem,320px)] flex-none"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Tweet id={post.tweetId} />
              </motion.div>
            ))}
          </div>
        </div>
        {/* Dégradé pour masquer la scrollbar et améliorer l’esthétique */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-black pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 flex items-center justify-center pb-4 pt-20 bg-gradient-to-t from-white dark:from-black to-transparent">
          <div className="hidden sm:block">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2 bg-white dark:bg-black">
                  <Twitter className="h-4 w-4" />
                  Show all {result.length} tweets
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[400px] sm:w-[600px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-center">All Tweets</SheetTitle>
                </SheetHeader>
                <FullTweetList />
              </SheetContent>
            </Sheet>
          </div>
          <div className="block sm:hidden">
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" className="gap-2 bg-white dark:bg-black">
                  <Twitter className="h-4 w-4" />
                  Show all {result.length} tweets
                </Button>
              </DrawerTrigger>
              <DrawerContent className="max-h-[85vh]">
                <DrawerHeader>
                  <DrawerTitle>All Tweets</DrawerTitle>
                </DrawerHeader>
                <div className="overflow-y-auto">
                  <FullTweetList />
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default memo(XSearchResult);
