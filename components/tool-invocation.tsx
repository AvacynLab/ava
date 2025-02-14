// tool-invocation-list-view.tsx
import React, { useCallback, useState, memo } from 'react';
import { ToolInvocation } from 'ai';
import { motion } from 'framer-motion';
import cx from 'classnames';
import { FlightTracker } from '@/components/tools/flight-tracker';
import MultiSearch from '@/components/tools/multi-search';
import TMDBResult from '@/components/tools/movie-info';
import NearbySearchMapView from '@/components/tools/nearby-search-map-view';
import { Weather } from '@/components/weather';
import { DocumentToolResult, DocumentToolCall } from './document';
import { DocumentPreview } from './document-preview';
import TrendingResults from './tools/trending-tv-movies-results';
import FindPlaceResult from "@/components/tools/find-place-result";
import YouTubeSearchResult from "@/components/tools/youtube-search";
import ScrapeWebResult from "@/components/tools/scrape-web";
import TranslationTool from "@/components/tools/translation";
import XSearchResult from "@/components/tools/x-search";
import AcademicSearchResult from "@/components/tools/academic-search";
import { MapContainer } from './tools/map-components';
import { Code, Calendar, Calculator, FileText, TrendingUp } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

// --- CollapsibleSection (issu de l'ancienne version)
interface CollapsibleSectionProps {
  code: string;
  output?: string;
  language?: string;
  title?: string;
  icon?: string;
  status?: 'running' | 'completed';
}

function CollapsibleSection({
  code,
  output,
  language = "plaintext",
  title,
  icon,
  status,
}: CollapsibleSectionProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'code' | 'output'>('code');
  const { theme } = useTheme();
  const IconMapping: Record<string, React.ComponentType<{ className?: string }>> = {
    stock: TrendingUp,
    default: Code,
    date: Calendar,
    calculation: Calculator,
    output: FileText
  };
  const IconComponent = icon ? IconMapping[icon] : null;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = activeTab === 'code' ? code : output;
    await navigator.clipboard.writeText(textToCopy || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden transition-all duration-200 hover:shadow-sm">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer bg-white dark:bg-neutral-900 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {IconComponent && (
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800">
              <IconComponent className="h-4 w-4 text-primary" />
            </div>
          )}
          <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {status && (
            <div className={`w-fit flex items-center gap-1.5 px-1.5 py-0.5 text-xs ${status === 'running' ? "bg-blue-50/50 text-blue-600" : "bg-green-50/50 text-green-600"}`}>
              {status === 'running' ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <span>✔</span>
              )}
              {status === 'running' ? "Running" : "Done"}
            </div>
          )}
          <div className={`h-4 w-4 transition-transform duration-200 ${!isExpanded ? "-rotate-90" : ""}`}>
            ▼
          </div>
        </div>
      </div>

      {isExpanded && (
        <div>
          <div className="flex border-b border-neutral-200 dark:border-neutral-800">
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'code' ? "border-b-2 border-primary text-primary" : "text-neutral-600 dark:text-neutral-400"}`}
              onClick={() => setActiveTab('code')}
            >
              Code
            </button>
            {output && (
              <button
                className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'output' ? "border-b-2 border-primary text-primary" : "text-neutral-600 dark:text-neutral-400"}`}
                onClick={() => setActiveTab('output')}
              >
                Output
              </button>
            )}
            <div className="ml-auto pr-2 flex items-center">
              <button
                onClick={handleCopy}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          <div className={`text-sm ${theme === "dark" ? "bg-[rgb(40,44,52)]" : "bg-[rgb(250,250,250)]"}`}>
            <pre className="p-4">
              {activeTab === 'code' ? code : output || ''}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Fin CollapsibleSection

interface ToolInvocationListViewProps {
  toolInvocations: ToolInvocation[];
  isReadonly: boolean;
}

const ToolInvocationListView = memo(
  ({ toolInvocations, isReadonly }: ToolInvocationListViewProps) => {
    const renderToolInvocation = useCallback(
      (toolInvocation: ToolInvocation, index: number) => {
        const { toolName, toolCallId, state, args } = toolInvocation;
        const result = ('result' in toolInvocation) ? (toolInvocation as any).result : undefined;

        if (toolName === 'web_search') {
          return (
            <div key={toolCallId} className="mt-4">
              <MultiSearch result={result ?? null} args={args} />
            </div>
          );
        }

        if (toolName === 'x_search') {
          return (
            <div key={toolCallId} className="my-4">
              <XSearchResult result={result} />
            </div>
          );
        }

        if (toolName === 'academic_search') {
          return (
            <div key={toolCallId} className="my-4">
              <AcademicSearchResult result={result} />
            </div>
          );
        }
    
        if (toolName === 'youtube_search') {
          return (
            <div key={toolCallId} className="my-4">
              <YouTubeSearchResult result={result} />
            </div>
          );
        }

        if (toolName === 'scrape_web') {
          return (
            <div key={toolCallId} className="my-4">
              <ScrapeWebResult result={result} />
            </div>
          );
        }
        
        if (toolName === 'find_place') {
          return (
            <div key={toolCallId} className="my-4">
              <FindPlaceResult result={result} />
            </div>
          );
        }

        if (toolName === 'text_search') {
          return (
            <div key={toolCallId} className="my-4">
              {result && result.results && result.results.length > 0 ? (
                <MapContainer
                  title="Search Results"
                  center={result.results[0]?.location}
                  places={result.results}
                />
              ) : (
                <div className="p-4">
                  <p>Searching places...</p>
                </div>
              )}
            </div>
          );
        }

        if (toolName === 'nearby_search') {
          return (
            <div key={toolCallId} className="my-4">
              {result && result.results && result.results.length > 0 ? (
                <NearbySearchMapView
                  center={result.center}
                  places={result.results}
                  type={args.type}
                />
              ) : (
                <div className="p-4">
                  <p>Searching nearby places...</p>
                </div>
              )}
            </div>
          );
        }

        if (toolName === 'tmdb_search') {
          return (
            <div key={toolCallId}>
              <TMDBResult result={result} />
            </div>
          );
        }

        if (toolName === 'trending_movies') {
          return (
            <div key={toolCallId}>
              <TrendingResults result={result} type="movie" />
            </div>
          );
        }
    
        if (toolName === 'trending_tv') {
          return (
            <div key={toolCallId}>
              <TrendingResults result={result} type="tv" />
            </div>
          );
        }

        // if (toolName === 'stock_chart') {
        //   return (
        //     <div key={toolCallId} className="flex flex-col gap-3 w-full mt-4">
        //       {result?.chart ? (
        //         <InteractiveStockChart title={args.title} chart={result.chart} data={result.chart.elements} />
        //       ) : (
        //         <motion.div
        //           initial={{ opacity: 0 }}
        //           animate={{ opacity: 1 }}
        //           className="flex items-center gap-2 text-neutral-500"
        //         >
        //           <motion.div className="w-4 h-4 animate-spin" />
        //           <span>Generating stock chart...</span>
        //         </motion.div>
        //       )}
        //     </div>
        //   );
        // }

        // if (toolName === 'currency_converter') {
        //   return (
        //     <div key={toolCallId} className="my-4">
        //       <CurrencyConverter toolInvocation={toolInvocation} result={result} />
        //     </div>
        //   );
        // }

        // if (toolName === 'code_interpreter') {
        //   return (
        //     <div key={toolCallId} className="space-y-6">
        //       <CollapsibleSection
        //         code={args.code}
        //         output={result?.message || "Processing code..."}
        //         language="python"
        //         title={args.title}
        //         icon={args.icon || 'default'}
        //         status={result ? 'completed' : 'running'}
        //       />
        //       {result?.chart && (
        //         <div className="pt-1">
        //           <InteractiveChart chart={result.chart} />
        //         </div>
        //       )}
        //     </div>
        //   );
        // }

        if (toolName === 'track_flight') {
          return (
            <div key={toolCallId} className="my-4">
              {result ? (
                <FlightTracker data={result} />
              ) : (
                <div className="p-4">
                  <p>Tracking flight...</p>
                </div>
              )}
            </div>
          );
        }

        if (state === 'result') {
          switch (toolName) {
            case 'getWeather':
              return (
                <div key={toolCallId}>
                  <Weather weatherAtLocation={result} />
                </div>
              );
            case 'createDocument':
              return (
                <div key={toolCallId}>
                  <DocumentPreview isReadonly={isReadonly} result={result} />
                </div>
              );
            case 'updateDocument':
              return (
                <div key={toolCallId}>
                  <DocumentToolResult type="update" result={result} isReadonly={isReadonly} />
                </div>
              );
            case 'requestSuggestions':
              return (
                <div key={toolCallId}>
                  <DocumentToolResult type="request-suggestions" result={result} isReadonly={isReadonly} />
                </div>
              );
            case "text_translate":
              return (
                <div key={toolCallId} className="my-4">
                  <TranslationTool toolInvocation={toolInvocation} result={result} />
                </div>
              );
            default:
              return (
                <div key={toolCallId} className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                  <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
              );
          }
        } else {
          switch (toolName) {
            case 'getWeather':
              return (
                <div key={toolCallId} className={cx({ skeleton: ['getWeather'].includes(toolName) })}>
                  <Weather />
                </div>
              );
            case 'createDocument':
              return (
                <div key={toolCallId} className={cx({ skeleton: ['createDocument'].includes(toolName) })}>
                  <DocumentPreview isReadonly={isReadonly} args={args} />
                </div>
              );
            case 'updateDocument':
              return (
                <div key={toolCallId} className={cx({ skeleton: ['updateDocument'].includes(toolName) })}>
                  <DocumentToolCall type="update" args={args} isReadonly={isReadonly} />
                </div>
              );
            case 'requestSuggestions':
              return (
                <div key={toolCallId} className={cx({ skeleton: ['requestSuggestions'].includes(toolName) })}>
                  <DocumentToolCall type="request-suggestions" args={args} isReadonly={isReadonly} />
                </div>
              );
            default:
              return null;
          }
        }
      },
      []
    );

    return (
      <>
        {toolInvocations.map((invocation, index) => (
          <div key={`tool-${index}`}>
            {renderToolInvocation(invocation, index)}
          </div>
        ))}
      </>
    );
  },
  (prevProps, nextProps) =>
    prevProps.toolInvocations === nextProps.toolInvocations
);

export default ToolInvocationListView;
