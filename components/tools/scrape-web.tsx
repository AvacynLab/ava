
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, TextIcon, ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

interface ScrapeWebResultProps {
  result: any;
}

const ScrapeWebResult: React.FC<ScrapeWebResultProps> = ({ result }) => {
  if (!result) {
    return (
      <Card className="w-full my-4 p-4 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
        <p>Loading document...</p>
      </Card>
    );
  }
  return (
    <Card className="w-full my-4 overflow-hidden bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
      <CardContent>
        <div className="flex items-start gap-4">
          <div className="relative w-10 h-10 flex-shrink-0">
            <img
              className="h-5 w-5 absolute inset-0 m-auto"
              src={`https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(
                result.results[0].url
              )}`}
              alt=""
            />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <h2 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100 tracking-tight truncate">
              {result.results[0].title}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
              {result.results[0].description}
            </p>
            <div className="flex items-center gap-3">
              <a
                href={result.results[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-primary transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                View source
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-neutral-200 dark:border-neutral-800 mt-4">
          <details className="group">
            <summary className="w-full px-4 py-2 cursor-pointer text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TextIcon className="h-4 w-4 text-neutral-400" />
                <span>View content</span>
              </div>
              <ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="max-h-[50vh] overflow-y-auto p-4 bg-neutral-50/50 dark:bg-neutral-800/30">
              <ReactMarkdown>{result.results[0].content}</ReactMarkdown>
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScrapeWebResult;
