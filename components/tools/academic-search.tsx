
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Book, Calendar, User2, Download, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AcademicResult {
  title: string;
  url: string;
  author?: string;
  publishedDate?: string;
  summary: string;
}

interface AcademicSearchResultProps {
  result: { results: AcademicResult[] };
}

const AcademicSearchResult: React.FC<AcademicSearchResultProps> = ({ result }) => {
  if (!result) {
    return (
      <Card className="w-full my-4">
        <p>Searching academic papers...</p>
      </Card>
    );
  }
  return (
    <Card className="w-full my-4 overflow-hidden">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/20 flex items-center justify-center">
            <Book className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <CardTitle>Academic Papers</CardTitle>
            <p className="text-sm text-muted-foreground">
              Found {result.results.length} papers
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex overflow-x-auto gap-4">
          {result.results.map((paper, index) => (
            <motion.div
              key={paper.url || index}
              className="w-[400px] flex-none"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="h-[300px] relative group">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500/20 via-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="h-full relative backdrop-blur-sm bg-background/95 dark:bg-neutral-900/95 border border-neutral-200/50 dark:border-neutral-800/50 rounded-xl p-4 flex flex-col transition-all duration-500 group-hover:border-violet-500/20">
                  <h3 className="font-semibold text-xl tracking-tight mb-3 line-clamp-2 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors duration-300">
                    {paper.title}
                  </h3>
                  {paper.author && (
                    <div className="mb-3">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-muted-foreground bg-neutral-100 dark:bg-neutral-800 rounded-md">
                        <User2 className="h-3.5 w-3.5 text-violet-500" />
                        <span className="line-clamp-1">
                          {paper.author
                            .split(";")
                            .slice(0, 2)
                            .join(", ") +
                            (paper.author.split(";").length > 2 ? " et al." : "")}
                        </span>
                      </div>
                    </div>
                  )}
                  {paper.publishedDate && (
                    <div className="mb-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-muted-foreground bg-neutral-100 dark:bg-neutral-800 rounded-md">
                        <Calendar className="h-3.5 w-3.5 text-violet-500" />
                        {new Date(paper.publishedDate).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                  <div className="flex-1 relative mb-4 pl-3">
                    <div className="absolute -left-0 top-1 bottom-1 w-[2px] rounded-full bg-gradient-to-b from-violet-500 via-violet-400 to-transparent opacity-50" />
                    <p className="text-sm text-muted-foreground line-clamp-4">
                      {paper.summary}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => window.open(paper.url, "_blank")}
                      className="flex-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-violet-100 dark:hover:bg-violet-900/20 hover:text-violet-600 dark:hover:text-violet-400"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Paper
                    </Button>
                    {paper.url.includes("arxiv.org") && (
                      <Button
                        variant="ghost"
                        onClick={() => window.open(paper.url.replace("abs", "pdf"), "_blank")}
                        className="bg-neutral-100 dark:bg-neutral-800 hover:bg-violet-100 dark:hover:bg-violet-900/20 hover:text-violet-600 dark:hover:text-violet-400"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AcademicSearchResult;
