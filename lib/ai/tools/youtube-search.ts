import { tool } from 'ai';
import { z } from 'zod';
import Exa from 'exa-js';

export const youtube_search = ({ dataStream }: { dataStream: any }) => tool({
  description: 'Search YouTube videos using Exa AI and get detailed video information.',
  parameters: z.object({
    query: z.string().describe('The search query for YouTube videos'),
    no_of_results: z.number().default(5).describe('The number of results to return'),
  }),
  execute: async ({ query, no_of_results }: { query: string; no_of_results: number }) => {
    try {
      const exa = new Exa(process.env.EXA_API_KEY as string);
      // Effectuer la recherche sur YouTube via Exa
      const searchResult = await exa.search(query, {
        type: 'keyword',
        numResults: no_of_results,
        includeDomains: ['youtube.com'],
      });
      // Pour chaque résultat, récupérer les détails complémentaires
      const processedResults = await Promise.all(
        searchResult.results.map(async (result: any): Promise<any | null> => {
          const videoIdMatch = result.url.match(
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
          );
          const videoId = videoIdMatch?.[1];
          if (!videoId) return null;
          const baseResult: any = { videoId, url: result.url };
          try {
            const [detailsResponse, captionsResponse, timestampsResponse] = await Promise.all([
              fetch(`https://mplx-yt-production.up.railway.app/video-data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: result.url }),
              }).then((res) => (res.ok ? res.json() : null)),
              fetch(`https://mplx-yt-production.up.railway.app/video-captions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: result.url }),
              }).then((res) => (res.ok ? res.text() : null)),
              fetch(`https://mplx-yt-production.up.railway.app/video-timestamps`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: result.url }),
              }).then((res) => (res.ok ? res.json() : null)),
            ]);
            return {
              ...baseResult,
              details: detailsResponse || undefined,
              captions: captionsResponse || undefined,
              timestamps: timestampsResponse || undefined,
            };
          } catch (error) {
            console.error(`Error fetching details for video ${videoId}:`, error);
            return baseResult;
          }
        })
      );
      // Filtrer les résultats nuls
      const validResults = processedResults.filter((result): result is any => result !== null);
      return { results: validResults };
    } catch (error) {
      console.error('YouTube search error:', error);
      throw error;
    }
  },
});
