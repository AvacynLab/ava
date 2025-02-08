"use client";

import React, { memo, useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { YoutubeIcon, User } from "lucide-react";
import Link from "next/link";

interface VideoDetails {
  title?: string;
  author_name?: string;
  author_url?: string;
  thumbnail_url?: string;
  provider_name?: string;
  provider_url?: string;
}

interface VideoResult {
  videoId: string;
  url: string;
  details?: VideoDetails;
  captions?: string;     // texte complet du transcript
  timestamps?: string[]; // liste éventuelle des timecodes
}

interface YouTubeSearchResponse {
  results: VideoResult[];
}

interface YouTubeSearchResultProps {
  result: YouTubeSearchResponse;
}

/* ---------------------------
   Carte vidéo unique
--------------------------- */
const YouTubeCard: React.FC<{ video: VideoResult; index: number }> = ({
  video,
  index,
}) => {
  const [timestampsExpanded, setTimestampsExpanded] = useState(false);
  const [transcriptExpanded, setTranscriptExpanded] = useState(false);

  if (!video) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="relative w-[240px] flex-shrink-0 rounded-xl bg-gray-50 dark:bg-neutral-800 overflow-hidden"
    >
      <Link
        href={video.url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block aspect-video bg-neutral-200 dark:bg-neutral-700"
      >
        {video.details?.thumbnail_url ? (
          <img
            src={video.details.thumbnail_url}
            alt={video.details?.title || "Video thumbnail"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <YoutubeIcon className="h-8 w-8 text-neutral-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <YoutubeIcon className="h-12 w-12 text-red-500" />
        </div>
      </Link>

      <div className="p-4 flex flex-col gap-3">
        <div className="space-y-2">
          <Link
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold line-clamp-2 dark:text-neutral-100"
            style={{ textDecoration: "none" }}
          >
            {video.details?.title || "YouTube Video"}
          </Link>

          {video.details?.author_name && (
            <Link
              href={video.details.author_url || video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 group w-fit"
            >
              <div className="h-6 w-6 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center">
                <User className="h-4 w-4 text-red-500" />
              </div>
              <span className="text-xs text-neutral-600 dark:text-neutral-400 group-hover:text-red-500 transition-colors truncate">
                {video.details.author_name}
              </span>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* -----------------------------------------
   Conteneur principal (avec Accordion)
----------------------------------------- */
const YouTubeSearchResult: React.FC<YouTubeSearchResultProps> = ({ result }) => {
  if (!result || !result.results) {
    return <div className="text-sm text-neutral-500">Loading YouTube videos...</div>;
  }

  const PREVIEW_COUNT = 3;

  return (
    <Accordion type="single" defaultValue="videos" collapsible className="w-full">
      <AccordionItem value="videos" className="border-0">
        <AccordionTrigger
          className="flex w-full items-center justify-between px-4 py-3 rounded-md bg-neutral-900 text-neutral-100 focus:outline-none"
          style={{ userSelect: "none" }}
        >
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-neutral-800 border border-neutral-700">
              <YoutubeIcon className="h-4 w-4 text-red-500" />
            </div>
            <Badge variant="secondary" className="text-xs">
              {result.results.length} videos
            </Badge>
            <p className="text-sm font-semibold">YouTube Results</p>
          </div>
        </AccordionTrigger>

        {/* Force la largeur et supprime l'animation: */}
        <AccordionContent
          className="overflow-hidden px-4 pt-3 pb-2"
          style={{ width: "100%", transition: "none" }}
        >
          {/* 1) Un wrapper max-w-full */}
          <div className="mx-auto max-w-3xl">
            {/* 2) On conserve flex et le scroll horizontal */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {result.results.slice(0, PREVIEW_COUNT).map((video, index) => (
                <YouTubeCard key={video.videoId} video={video} index={index} />
              ))}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default memo(YouTubeSearchResult);
